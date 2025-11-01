import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

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

    // Use current_streak as generation counter
    const { data: user, error } = await supabase
      .from("users")
      .select("current_streak, free_generations")
      .eq("fid", parseInt(fid))
      .single()

    if (error || !user) {
      // User doesn't exist yet, return defaults
      return NextResponse.json({
        success: true,
        count: 0,
        freeGenerations: 1,
      })
    }

    return NextResponse.json({
      success: true,
      count: user.current_streak || 0,
      freeGenerations: user.free_generations || 0,
    })
  } catch (error) {
    console.error("Error fetching generation count:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Increment generation counter (called after each video generation)
export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json(
        { success: false, error: "Missing fid" },
        { status: 400 }
      )
    }

    // Get current count (using current_streak field)
    const { data: user } = await supabase
      .from("users")
      .select("current_streak, free_generations")
      .eq("fid", fid)
      .single()

    if (!user) {
      // Create user
      await supabase.from("users").insert({
        fid: fid,
        credit_balance: 3,
        current_streak: 1,
        free_generations: 1,
      })

      return NextResponse.json({
        success: true,
        count: 1,
        freeGenerations: 1,
        freeGenAwarded: false,
      })
    }

    // Increment counter
    const newCount = (user.current_streak || 0) + 1
    let freeGens = user.free_generations || 0
    let awarded = false

    // Award free gen every 7 videos
    if (newCount % 7 === 0) {
      freeGens += 1
      awarded = true
    }

    // Update user (use current_streak as counter)
    await supabase
      .from("users")
      .update({
        current_streak: newCount,
        free_generations: freeGens,
      })
      .eq("fid", fid)

    return NextResponse.json({
      success: true,
      count: newCount,
      freeGenerations: freeGens,
      freeGenAwarded: awarded,
    })
  } catch (error) {
    console.error("Error incrementing generation count:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
