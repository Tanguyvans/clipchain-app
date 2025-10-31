import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Template name mappings for official templates
const TEMPLATE_NAMES: Record<string, { name: string; emoji: string; gradient: string }> = {
  profile: {
    name: "Make Your Profile Dance",
    emoji: "💃",
    gradient: "from-purple-500/10 to-blue-500/10"
  },
  bio: {
    name: "Bio Speech Presentation",
    emoji: "🎤",
    gradient: "from-orange-500/10 to-pink-500/10"
  },
  text: {
    name: "Custom Text Video",
    emoji: "✨",
    gradient: "from-green-500/10 to-teal-500/10"
  },
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")

    // Fetch ALL templates from database (official first, then by usage)
    const { data: templates, error } = await supabase
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
      .order("is_official", { ascending: false })
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

    // Fetch creator info for templates
    const templatesWithCreators = await Promise.all(
      (templates || []).map(async (template) => {
        // Check if this is an official template
        const isOfficial = template.is_official === true
        const templateInfo = TEMPLATE_NAMES[template.generation_type]

        // Fetch creator username from Neynar (skip for official templates)
        if (!isOfficial) {
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
              // Add template info for display
              name: templateInfo?.name,
              emoji: templateInfo?.emoji,
              gradient: templateInfo?.gradient,
            }
          } catch (error) {
            console.error("Error fetching creator:", error)
            return {
              ...template,
              creator: null,
              name: templateInfo?.name,
              emoji: templateInfo?.emoji,
              gradient: templateInfo?.gradient,
            }
          }
        } else {
          // Official template (FID 0)
          return {
            ...template,
            creator: null,
            name: templateInfo?.name || "Official Template",
            emoji: templateInfo?.emoji || "✨",
            gradient: templateInfo?.gradient || "from-purple-500/10 to-blue-500/10",
          }
        }
      })
    )

    // Separate official templates from user templates
    const officialTemplates = templatesWithCreators.filter(t => t.is_official === true)
    const userTemplates = templatesWithCreators.filter(t => t.is_official !== true)

    return NextResponse.json({
      success: true,
      templates: templatesWithCreators, // All templates combined
      officialTemplates,
      userTemplates,
      count: templatesWithCreators.length,
    })
  } catch (error) {
    console.error("Error in /api/templates/trending:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
