import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Get current login streak status
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

    const { data: user, error } = await supabase
      .from("users")
      .select("login_streak, longest_login_streak, last_login_date, free_generations")
      .eq("fid", parseInt(fid))
      .single()

    if (error || !user) {
      // User doesn't exist yet, return defaults
      return NextResponse.json({
        success: true,
        loginStreak: 0,
        longestLoginStreak: 0,
        lastLoginDate: null,
        freeGenerations: 1,
        canCheckIn: true,
      })
    }

    const today = new Date().toISOString().split('T')[0]
    const lastLogin = user.last_login_date

    return NextResponse.json({
      success: true,
      loginStreak: user.login_streak || 0,
      longestLoginStreak: user.longest_login_streak || 0,
      lastLoginDate: lastLogin,
      freeGenerations: user.free_generations || 0,
      canCheckIn: lastLogin !== today, // Can check in if not already done today
    })
  } catch (error) {
    console.error("Error fetching login streak:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Check in for the day (update login streak)
export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json(
        { success: false, error: "Missing fid" },
        { status: 400 }
      )
    }

    // Call the database function to update streak
    const { data, error } = await supabase.rpc("update_daily_login_streak", {
      p_user_fid: fid,
    })

    if (error) {
      console.error("Error updating login streak:", error)
      return NextResponse.json(
        { success: false, error: "Failed to update login streak" },
        { status: 500 }
      )
    }

    const result = Array.isArray(data) ? data[0] : data

    return NextResponse.json({
      success: true,
      loginStreak: result.login_streak || 0,
      longestLoginStreak: result.longest_login_streak || 0,
      freeGenerations: result.free_generations || 0,
      streakIncreased: result.streak_increased || false,
      freeGenAwarded: result.free_gen_awarded || false,
    })
  } catch (error) {
    console.error("Error checking in:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
