import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { DEFAULT_TEMPLATES } from "@/lib/default-templates"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")

    // 1. Get static official templates (no database query needed!)
    const officialTemplates = DEFAULT_TEMPLATES.map(template => ({
      id: template.id,
      creator_fid: 0,
      video_url: null,
      thumbnail_url: null,
      generation_type: template.generationType,
      prompt: template.prompt,
      settings: {
        ...template.settings,
        previewGradient: template.previewGradient,
        accentColor: template.accentColor,
      },
      cast_hash: null,
      cast_url: null,
      uses_count: 0,
      is_featured: true,
      is_official: true,
      created_at: new Date().toISOString(),
      creator: null,
      name: template.name,
      emoji: template.emoji,
      gradient: template.gradient,
    }))

    // 2. Fetch ONLY user-created templates from database
    const { data: userTemplatesData, error } = await supabase
      .from("video_templates")
      .select(`
        id,
        creator_fid,
        video_url,
        thumbnail_url,
        generation_type,
        prompt,
        settings,
        cast_hash,
        cast_url,
        uses_count,
        is_featured,
        is_official,
        created_at
      `)
      .eq("is_public", true)
      .eq("is_official", false)
      .order("uses_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching user templates:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch templates" },
        { status: 500 }
      )
    }

    // 3. Fetch creator info for user templates
    const userTemplates = await Promise.all(
      (userTemplatesData || []).map(async (template) => {
        try {
          const response = await fetch(
            `https://api.neynar.com/v2/farcaster/user/bulk?fids=${template.creator_fid}`,
            {
              headers: {
                accept: "application/json",
                "x-api-key": process.env.NEYNAR_API_KEY || "",
              },
            }
          )
          const data = await response.json()
          const creator = data.users?.[0]

          return {
            ...template,
            creator: creator
              ? {
                  fid: creator.fid,
                  username: creator.username,
                  displayName: creator.display_name,
                  pfpUrl: creator.pfp_url,
                }
              : null,
            name: template.cast_hash ? "Community Template" : "Template",
            emoji: "✨",
            gradient: "from-purple-500/10 to-blue-500/10",
          }
        } catch (error) {
          console.error("Error fetching creator:", error)
          return {
            ...template,
            creator: null,
            name: "Community Template",
            emoji: "✨",
            gradient: "from-purple-500/10 to-blue-500/10",
          }
        }
      })
    )

    // Combine all templates
    const allTemplates = [...officialTemplates, ...userTemplates]

    return NextResponse.json({
      success: true,
      templates: allTemplates,
      officialTemplates,
      userTemplates,
      count: allTemplates.length,
    })
  } catch (error) {
    console.error("Error in /api/templates/trending:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
