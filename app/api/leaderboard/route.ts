import { NextRequest, NextResponse } from "next/server";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { Cast } from "@neynar/nodejs-sdk/build/api";

// Debug: Check if API key is loaded
const apiKey = process.env.NEYNAR_API_KEY || "";
console.log("NEYNAR_API_KEY loaded:", apiKey ? "Yes (length: " + apiKey.length + ")" : "No");

if (!process.env.NEYNAR_API_KEY) {
  console.error("ERROR: NEYNAR_API_KEY is not set in environment variables!");
}

// Initialize client with Configuration
const config = new Configuration({
  apiKey: apiKey,
});
const client = new NeynarAPIClient(config);

interface LeaderboardUser {
  rank: number;
  username: string;
  fid: number;
  avatar: string;
  likes: number;
  casts: number;
  displayName?: string;
  castUrls?: string[];
}

export async function GET(_request: NextRequest) {
  try {
    // Search for casts mentioning #clipchain
    const searchResults = await client.searchCasts({
      q: "#clipchain",
      limit: 100, // Get more results to have better data
    });

    console.log(`Found ${searchResults.result.casts.length} casts mentioning #clipchain`);

    // Aggregate users by total likes across their casts
    const userLikesMap = new Map<number, {
      username: string;
      fid: number;
      avatar: string;
      totalLikes: number;
      castCount: number;
      displayName?: string;
      castUrls: string[];
    }>();

    searchResults.result.casts.forEach((cast: Cast) => {
      // Check if cast has a .mp4 video URL
      const hasMP4Video = cast.embeds?.some((embed: any) => {
        return embed.url && typeof embed.url === 'string' && embed.url.includes('.mp4');
      }) || cast.text?.includes('.mp4');

      // Skip casts without .mp4 videos
      if (!hasMP4Video) {
        return;
      }

      const author = cast.author;
      const fid = author.fid;
      const likes = cast.reactions.likes_count || 0;
      const castUrl = `https://warpcast.com/${author.username}/${cast.hash.slice(0, 10)}`;

      // Only count casts with likes
      if (likes === 0) {
        return;
      }

      if (userLikesMap.has(fid)) {
        const user = userLikesMap.get(fid)!;
        user.totalLikes += likes;
        user.castCount += 1;
        user.castUrls.push(castUrl);
      } else {
        userLikesMap.set(fid, {
          username: author.username,
          fid: fid,
          avatar: author.pfp_url || "",
          totalLikes: likes,
          castCount: 1,
          displayName: author.display_name || author.username,
          castUrls: [castUrl],
        });
      }
    });

    // Convert to array and sort by total likes
    const leaderboard: LeaderboardUser[] = Array.from(userLikesMap.values())
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .slice(0, 10) // Top 10 users
      .map((user, index) => ({
        rank: index + 1,
        username: user.username,
        fid: user.fid,
        avatar: user.avatar,
        likes: user.totalLikes,
        casts: user.castCount,
        displayName: user.displayName,
        castUrls: user.castUrls,
      }));

    return NextResponse.json({
      success: true,
      leaderboard,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);

    // Log full error details for debugging
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; statusText?: string; data?: any } };
      console.error("Response status:", axiosError.response?.status);
      console.error("Response data:", axiosError.response?.data);
    }

    // Provide helpful error message for 402 (Payment Required)
    let errorMessage = "Failed to fetch leaderboard";
    let statusCode = 500;

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; statusText?: string; data?: any } };
      if (axiosError.response?.status === 402) {
        errorMessage = "Search API requires a paid Neynar plan. Current API key has limited access.";
        statusCode = 402;
      } else if (axiosError.response?.status) {
        errorMessage = `API error: ${axiosError.response.status} - ${axiosError.response.statusText || 'Unknown error'}`;
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
