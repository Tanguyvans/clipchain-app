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

    // Get user's streak data
    const { data: user, error } = await supabase
      .from("users")
      .select("current_streak, longest_streak, free_generations, last_activity_date, streak_updated_at")
      .eq("fid", parseInt(fid))
      .single()

    if (error || !user) {
      // User doesn't exist yet, return defaults
      return NextResponse.json({
        success: true,
        streak: {
          current: 0,
          longest: 0,
          freeGenerations: 1, // New users get 1 free
          lastActivity: null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      streak: {
        current: user.current_streak || 0,
        longest: user.longest_streak || 0,
        freeGenerations: user.free_generations || 0,
        lastActivity: user.last_activity_date,
      },
    })
  } catch (error) {
    console.error("Error fetching streak:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Update streak when user generates a video
export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json(
        { success: false, error: "Missing fid" },
        { status: 400 }
      )
    }

    // Ensure user exists first
    const { data: existingUser } = await supabase
      .from("users")
      .select("fid")
      .eq("fid", fid)
      .single()

    if (!existingUser) {
      // Create user with 1 free generation
      await supabase.from("users").insert({
        fid: fid,
        credit_balance: 3,
        free_generations: 1,
      })
    }

    // Call the database function to update streak
    const { data, error } = await supabase.rpc("update_user_streak", {
      p_user_fid: fid,
    })

    if (error) {
      console.error("Error updating streak:", error)
      return NextResponse.json(
        { success: false, error: "Failed to update streak" },
        { status: 500 }
      )
    }

    const result = data?.[0]

    return NextResponse.json({
      success: true,
      streak: {
        current: result?.current_streak || 0,
        freeGenerations: result?.free_generations || 0,
        streakIncreased: result?.streak_increased || false,
        freeGenAwarded: result?.free_gen_awarded || false,
      },
    })
  } catch (error) {
    console.error("Error in /api/user/streak POST:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
