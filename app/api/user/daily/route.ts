import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json(
        { success: false, error: "Missing fid" },
        { status: 400 }
      )
    }

    // Get user's last activity
    const { data: user } = await supabase
      .from("users")
      .select("last_active_at, credit_balance")
      .eq("fid", fid)
      .single()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    const now = new Date()
    const lastActive = user.last_active_at ? new Date(user.last_active_at) : null

    // Check if user already claimed today
    const isToday = lastActive &&
      lastActive.getFullYear() === now.getFullYear() &&
      lastActive.getMonth() === now.getMonth() &&
      lastActive.getDate() === now.getDate()

    if (isToday) {
      return NextResponse.json({
        success: true,
        alreadyClaimed: true,
        creditBalance: user.credit_balance,
      })
    }

    // Award daily credit
    const newBalance = user.credit_balance + 1

    await supabase
      .from("users")
      .update({
        credit_balance: newBalance,
        last_active_at: now.toISOString(),
      })
      .eq("fid", fid)

    // Record transaction
    await supabase.from("credit_transactions").insert({
      user_fid: fid,
      amount: 1,
      balance_after: newBalance,
      type: "daily",
      description: "Daily connection reward",
    })

    return NextResponse.json({
      success: true,
      alreadyClaimed: false,
      creditBalance: newBalance,
      creditAwarded: 1,
    })
  } catch (error) {
    console.error("Error claiming daily reward:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Check if daily reward is available
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get("fid")

    if (!fid) {
      return NextResponse.json(
        { success: false, error: "Missing fid parameter" },
        { status: 400 }
      )
    }

    const { data: user } = await supabase
      .from("users")
      .select("last_active_at, credit_balance")
      .eq("fid", parseInt(fid))
      .single()

    if (!user) {
      return NextResponse.json({
        success: true,
        available: true,
        creditBalance: 3,
      })
    }

    const now = new Date()
    const lastActive = user.last_active_at ? new Date(user.last_active_at) : null

    const isToday = lastActive &&
      lastActive.getFullYear() === now.getFullYear() &&
      lastActive.getMonth() === now.getMonth() &&
      lastActive.getDate() === now.getDate()

    return NextResponse.json({
      success: true,
      available: !isToday,
      creditBalance: user.credit_balance,
      lastClaimed: lastActive?.toISOString() || null,
    })
  } catch (error) {
    console.error("Error checking daily reward:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
