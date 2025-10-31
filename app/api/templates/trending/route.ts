import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { DEFAULT_TEMPLATES } from "@/lib/default-templates"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const includeDefaults = searchParams.get("includeDefaults") !== "false"

    // Fetch user-created templates from database
    const { data: userTemplates, error } = await supabase
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
        created_at
      `)
      .eq("is_public", true)
      .order("uses_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching templates:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch templates" },
        { status: 500 }
      )
    }

    // Fetch creator info for user templates
    const templatesWithCreators = await Promise.all(
      (userTemplates || []).map(async (template) => {
        // Fetch creator username from Neynar
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
          }
        } catch (error) {
          console.error("Error fetching creator:", error)
          return {
            ...template,
            creator: null,
          }
        }
      })
    )

    // Format default templates to match user template structure
    const formattedDefaults = includeDefaults
      ? DEFAULT_TEMPLATES.map((template) => ({
          id: template.id,
          creator_fid: null,
          video_url: null,
          thumbnail_url: null,
          generation_type: template.generationType,
          prompt: template.prompt,
          settings: template.settings || {},
          cast_hash: null,
          cast_url: null,
          uses_count: 0,
          created_at: new Date().toISOString(),
          creator: null,
          isDefault: true,
          name: template.name,
          description: template.description,
          emoji: template.emoji,
          gradient: template.gradient,
          borderColor: template.borderColor,
          iconBg: template.iconBg,
          iconColor: template.iconColor,
        }))
      : []

    // Combine default templates with user templates
    // Put defaults first, then user templates sorted by trending
    const allTemplates = [...formattedDefaults, ...templatesWithCreators]

    return NextResponse.json({
      success: true,
      templates: allTemplates,
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
