import { NextRequest, NextResponse } from "next/server";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { Cast, User } from "@neynar/nodejs-sdk/build/api";

const apiKey = process.env.NEYNAR_API_KEY || "";
const config = new Configuration({
  apiKey: apiKey,
});
const client = new NeynarAPIClient(config);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fid = searchParams.get("fid");
    const username = searchParams.get("username");

    if (!fid && !username) {
      return NextResponse.json(
        {
          success: false,
          error: "Either fid or username is required",
        },
        { status: 400 }
      );
    }

    let userData: User | undefined;
    let userCasts: Cast[] = [];

    if (fid) {
      // Fetch user by FID
      const response = await client.fetchBulkUsers({ fids: [parseInt(fid)] });
      userData = response.users[0];
    } else if (username) {
      // Fetch user by username
      const response = await client.lookupUserByUsername({ username });
      // Extract user from response - check response structure
      userData = (response as any).user || response;
    }

    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Fetch user's casts
    try {
      const castsResponse = await client.fetchCastsForUser({
        fid: userData.fid,
        limit: 50,
      });
      userCasts = castsResponse.casts || [];
    } catch (err) {
      console.error("Error fetching user casts:", err);
      userCasts = [];
    }

    // Filter for videos with #clipchain
    const videos = userCasts
      .filter((cast) => {
        const hasClipchainTag = cast.text?.toLowerCase().includes("clipchain");
        const hasVideo = cast.embeds?.some((embed) => {
          const embedUrl = "url" in embed ? embed.url : null;
          return embedUrl && typeof embedUrl === "string" && embedUrl.includes(".mp4");
        });
        return hasClipchainTag && hasVideo;
      })
      .map((cast) => {
        // Extract video URL
        let videoUrl = "";
        if (cast.embeds) {
          for (const embed of cast.embeds) {
            const embedUrl = "url" in embed ? embed.url : null;
            if (embedUrl && typeof embedUrl === "string" && embedUrl.includes(".mp4")) {
              videoUrl = embedUrl;
              break;
            }
          }
        }

        return {
          id: cast.hash,
          videoUrl,
          likes: cast.reactions.likes_count || 0,
          comments: cast.replies?.count || 0,
          shares: cast.reactions.recasts_count || 0,
        };
      });

    // Count total recasts
    const totalRecasts = userCasts.reduce(
      (sum, cast) => sum + (cast.reactions.recasts_count || 0),
      0
    );

    // Return formatted user data
    return NextResponse.json({
      success: true,
      user: {
        fid: userData.fid,
        username: userData.username,
        displayName: userData.display_name,
        bio: userData.profile?.bio?.text || "",
        avatar: userData.pfp_url,
        verified: userData.power_badge || false,
        followerCount: userData.follower_count || 0,
        followingCount: userData.following_count || 0,
        videoCount: videos.length,
        recastCount: totalRecasts,
        videos,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user data",
      },
      { status: 500 }
    );
  }
}
