import { NextRequest, NextResponse } from "next/server";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { Cast } from "@neynar/nodejs-sdk/build/api";

const apiKey = process.env.NEYNAR_API_KEY || "";
const config = new Configuration({
  apiKey: apiKey,
});
const client = new NeynarAPIClient(config);

export interface VideoData {
  id: string;
  username: string;
  fid: number;
  avatar: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  videoUrl: string;
  castUrl: string;
  castHash: string;
}

export async function GET(_request: NextRequest) {
  try {
    // Fetch all videos from the /clipchain channel - FAST!
    const channelFeed = await client.fetchFeedByChannelIds({
      channelIds: ["clipchain"],
      limit: 100,
      withRecasts: false,
    });

    const casts = channelFeed.casts || [];
    console.log(`Found ${casts.length} casts in /clipchain channel`);

    // Extract videos with .mp4 URLs
    const videos: VideoData[] = [];

    casts.forEach((cast: Cast) => {
      // Find .mp4 video URL in embeds
      let videoUrl = "";

      if (cast.embeds) {
        for (const embed of cast.embeds) {
          const embedUrl = 'url' in embed ? embed.url : null;
          if (embedUrl && typeof embedUrl === 'string' && embedUrl.includes('.mp4')) {
            videoUrl = embedUrl;
            break;
          }
        }
      }

      // If not in embeds, check text for .mp4 URLs
      if (!videoUrl && cast.text) {
        const urlMatch = cast.text.match(/(https?:\/\/[^\s]+\.mp4)/);
        if (urlMatch) {
          videoUrl = urlMatch[1];
        }
      }

      // Skip if no video URL found
      if (!videoUrl) {
        return;
      }

      const author = cast.author;
      const castUrl = `https://warpcast.com/${author.username}/${cast.hash.slice(0, 10)}`;

      // Remove URLs from description to keep UI clean
      let cleanDescription = cast.text || "";
      // Remove all URLs (http/https)
      cleanDescription = cleanDescription.replace(/https?:\/\/[^\s]+/g, '').trim();

      videos.push({
        id: cast.hash,
        username: author.username,
        fid: author.fid,
        avatar: author.pfp_url || "/placeholder.svg",
        description: cleanDescription,
        likes: cast.reactions.likes_count || 0,
        comments: cast.replies?.count || 0,
        shares: cast.reactions.recasts_count || 0,
        videoUrl: videoUrl,
        castUrl: castUrl,
        castHash: cast.hash,
      });
    });

    // Sort by likes (most engaging first)
    videos.sort((a, b) => b.likes - a.likes);

    console.log(`Extracted ${videos.length} videos with .mp4 URLs`);

    return NextResponse.json({
      success: true,
      videos,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error fetching videos:", error);

    let errorMessage = "Failed to fetch videos";
    let statusCode = 500;

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; statusText?: string; data?: unknown } };
      if (axiosError.response?.status === 402) {
        errorMessage = "Search API requires a paid Neynar plan.";
        statusCode = 402;
      } else if (axiosError.response?.status) {
        errorMessage = `API error: ${axiosError.response.status}`;
        statusCode = axiosError.response.status;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}
