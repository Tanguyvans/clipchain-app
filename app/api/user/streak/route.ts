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

    // Get actual video count from total_videos_created
    const { data: user, error } = await supabase
      .from("users")
      .select("total_videos_created, free_generations, free_videos_from_generation")
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
      count: user.total_videos_created || 0,
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

    // Get current count (using total_videos_created)
    const { data: user } = await supabase
      .from("users")
      .select("total_videos_created, free_generations, free_videos_from_generation")
      .eq("fid", fid)
      .single()

    if (!user) {
      // Create user
      await supabase.from("users").insert({
        fid: fid,
        credit_balance: 3,
        total_videos_created: 1,
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
    const newCount = (user.total_videos_created || 0) + 1
    let freeGens = user.free_generations || 0
    let awarded = false

    // Award free gen every 10 videos
    if (newCount % 10 === 0) {
      freeGens += 1
      awarded = true

      // Also update free_videos_from_generation counter
      const currentFreeFromGen = user.free_videos_from_generation || 0
      await supabase
        .from("users")
        .update({
          free_videos_from_generation: currentFreeFromGen + 1,
        })
        .eq("fid", fid)

      // Log milestone reward
      await supabase.from("credit_transactions").insert({
        user_fid: fid,
        amount: 1,
        balance_after: freeGens,
        type: "bonus",
        description: `🎉 Milestone reward: ${newCount} videos generated! Free video awarded!`,
      })
    }

    // Update user
    await supabase
      .from("users")
      .update({
        total_videos_created: newCount,
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
