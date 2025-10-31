import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateId, userFid, generatedVideoUrl } = body

    // Validate required fields
    if (!templateId || !userFid) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: templateId, userFid" },
        { status: 400 }
      )
    }

    // Track template usage in template_uses table
    const { error: usageError } = await supabase
      .from("template_uses")
      .insert({
        template_id: templateId,
        user_fid: userFid,
        generated_video_url: generatedVideoUrl,
      })

    if (usageError) {
      console.error("Error tracking template usage:", usageError)
      // Don't fail if tracking fails (duplicate, etc)
    }

    // Increment uses_count on the template
    // First fetch current count
    const { data: currentTemplate } = await supabase
      .from("video_templates")
      .select("uses_count")
      .eq("id", templateId)
      .single()

    if (currentTemplate) {
      const { error: incrementError } = await supabase
        .from("video_templates")
        .update({ uses_count: (currentTemplate.uses_count || 0) + 1 })
        .eq("id", templateId)

      if (incrementError) {
        console.error("Error incrementing template uses:", incrementError)
      }
    }

    // Optionally: Update template video_url if it doesn't have one yet
    // This makes the generated video the preview for the template
    const { data: template } = await supabase
      .from("video_templates")
      .select("video_url")
      .eq("id", templateId)
      .single()

    if (template && !template.video_url && generatedVideoUrl) {
      // Template has no preview video yet, use this one
      await supabase
        .from("video_templates")
        .update({ video_url: generatedVideoUrl })
        .eq("id", templateId)

      console.log("✅ Updated template preview video:", templateId)
    }

    return NextResponse.json({
      success: true,
      message: "Template usage tracked successfully",
    })
  } catch (error) {
    console.error("Error in /api/templates/use:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
