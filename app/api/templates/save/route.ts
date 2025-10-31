import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      creatorFid,
      videoUrl,
      prompt,
      generationType,
      settings = {},
      castHash = null,
      castUrl = null,
      thumbnailUrl = null,
    } = body

    // Validate required fields
    if (!creatorFid || !videoUrl || !prompt || !generationType) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: creatorFid, videoUrl, prompt, generationType",
        },
        { status: 400 }
      )
    }

    // Validate generation type
    if (!["profile", "bio", "text"].includes(generationType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid generationType. Must be 'profile', 'bio', or 'text'",
        },
        { status: 400 }
      )
    }

    // Check if user exists, create if not
    const { data: existingUser } = await supabase
      .from("users")
      .select("fid")
      .eq("fid", creatorFid)
      .single()

    if (!existingUser) {
      // Create user if they don't exist
      const { error: userError } = await supabase
        .from("users")
        .insert({
          fid: creatorFid,
          credit_balance: 3,
          total_credits_earned: 3,
        })

      if (userError) {
        console.error("Error creating user:", userError)
        // Continue anyway - user might already exist from race condition
      }
    }

    // Save the template
    const { data: template, error } = await supabase
      .from("video_templates")
      .insert({
        creator_fid: creatorFid,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        generation_type: generationType,
        prompt: prompt,
        settings: settings,
        cast_hash: castHash,
        cast_url: castUrl,
        is_public: true,
        is_featured: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving template:", error)
      return NextResponse.json(
        { success: false, error: "Failed to save template" },
        { status: 500 }
      )
    }

    console.log("✅ Template saved:", template.id)

    return NextResponse.json({
      success: true,
      template: template,
      message: "Template saved successfully",
    })
  } catch (error) {
    console.error("Error in /api/templates/save:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
