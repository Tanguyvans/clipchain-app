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

    // Get user's current free generations
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("free_generations")
      .eq("fid", fid)
      .single()

    if (fetchError || !user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    if ((user.free_generations || 0) <= 0) {
      return NextResponse.json(
        { success: false, error: "No free generations available" },
        { status: 400 }
      )
    }

    // Decrement free generations
    const { error: updateError } = await supabase
      .from("users")
      .update({ free_generations: user.free_generations - 1 })
      .eq("fid", fid)

    if (updateError) {
      console.error("Error using free generation:", updateError)
      return NextResponse.json(
        { success: false, error: "Failed to use free generation" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      remainingFreeGenerations: user.free_generations - 1,
    })
  } catch (error) {
    console.error("Error in /api/user/use-free-generation:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
