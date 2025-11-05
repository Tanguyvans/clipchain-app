import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

// GET: Check current login streak
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

    // Get user's login streak data
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("login_streak, longest_login_streak, last_login_date, free_videos_from_login, total_free_videos_earned")
      .eq("fid", parseInt(fid))
      .single()

    if (error || !user) {
      // User doesn't exist yet, return defaults
      return NextResponse.json({
        success: true,
        loginStreak: 0,
        longestLoginStreak: 0,
        lastLoginDate: null,
        freeVideosFromLogin: 0,
        totalFreeVideos: 0,
        daysUntilReward: 7,
      })
    }

    const loginStreak = user.login_streak || 0
    const daysUntilReward = 7 - (loginStreak % 7)

    return NextResponse.json({
      success: true,
      loginStreak,
      longestLoginStreak: user.longest_login_streak || 0,
      lastLoginDate: user.last_login_date,
      freeVideosFromLogin: user.free_videos_from_login || 0,
      totalFreeVideos: user.total_free_videos_earned || 0,
      daysUntilReward: daysUntilReward === 7 ? 7 : daysUntilReward,
    })
  } catch (error) {
    console.error("Error fetching login streak:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST: Record login and update streak
export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json(
        { success: false, error: "Missing fid" },
        { status: 400 }
      )
    }

    // Check if user exists, create if not
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("fid")
      .eq("fid", fid)
      .single()

    if (!existingUser) {
      // Create new user with default values
      await supabaseAdmin.from("users").insert({
        fid: fid,
        credit_balance: 3,
        total_credits_earned: 3,
        login_streak: 0,
        longest_login_streak: 0,
        free_videos_from_login: 0,
        free_videos_from_generation: 0,
        total_free_videos_earned: 0,
      })
    }

    // Call database function to update login streak
    const { data, error } = await supabaseAdmin.rpc("update_login_streak", {
      p_user_fid: fid,
    })

    if (error) {
      console.error("Error updating login streak:", error)
      return NextResponse.json(
        { success: false, error: "Failed to update login streak" },
        { status: 500 }
      )
    }

    const result = data?.[0]

    if (!result) {
      return NextResponse.json(
        { success: false, error: "No result from database function" },
        { status: 500 }
      )
    }

    const loginStreak = result.current_login_streak || 0
    const daysUntilReward = 7 - (loginStreak % 7)

    // If free video was awarded, log it to credit transactions
    if (result.free_video_awarded) {
      await supabaseAdmin.from("credit_transactions").insert({
        user_fid: fid,
        amount: 1,
        balance_after: 0, // Will be updated by the user's credit balance
        type: "bonus",
        description: `🔥 ${result.current_login_streak}-day login streak! Free video awarded!`,
      })
    }

    return NextResponse.json({
      success: true,
      loginStreak: result.current_login_streak || 0,
      longestLoginStreak: result.longest_login_streak || 0,
      freeVideoAwarded: result.free_video_awarded || false,
      streakContinued: result.streak_continued || false,
      streakBroken: result.streak_broken || false,
      daysUntilReward: daysUntilReward === 7 ? 7 : daysUntilReward,
    })
  } catch (error) {
    console.error("Error recording login:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
