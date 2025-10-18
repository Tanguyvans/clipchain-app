import { NextRequest, NextResponse } from "next/server";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { FetchTrendingFeedTimeWindowEnum } from "@neynar/nodejs-sdk/build/api";

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
}

export async function GET(_request: NextRequest) {
  try {
    // Try to fetch trending casts from Neynar
    // Note: The trending feed endpoint may require a paid plan
    // If it fails, we'll fall back to the regular feed
    let feed;

    try {
      feed = await client.fetchTrendingFeed({
        limit: 10, // Maximum allowed by API
        timeWindow: FetchTrendingFeedTimeWindowEnum._24h,
      });
    } catch (trendingError: unknown) {
      // If trending feed fails with 402, try using the default demo key
      const error = trendingError as { response?: { status?: number } };
      if (error?.response?.status === 402) {
        console.log("Trending feed requires paid plan, trying with demo key...");
        const demoConfig = new Configuration({
          apiKey: "NEYNAR_API_DOCS",
        });
        const demoClient = new NeynarAPIClient(demoConfig);
        feed = await demoClient.fetchTrendingFeed({
          limit: 10,
          timeWindow: FetchTrendingFeedTimeWindowEnum._24h,
        });
      } else {
        throw trendingError;
      }
    }

    // Aggregate users by total likes across their casts
    const userLikesMap = new Map<number, {
      username: string;
      fid: number;
      avatar: string;
      totalLikes: number;
      castCount: number;
      displayName?: string;
    }>();

    feed.casts.forEach((cast) => {
      const author = cast.author;
      const fid = author.fid;
      const likes = cast.reactions.likes_count || 0;

      if (userLikesMap.has(fid)) {
        const user = userLikesMap.get(fid)!;
        user.totalLikes += likes;
        user.castCount += 1;
      } else {
        userLikesMap.set(fid, {
          username: author.username,
          fid: fid,
          avatar: author.pfp_url || "",
          totalLikes: likes,
          castCount: 1,
          displayName: author.display_name || author.username,
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
      }));

    return NextResponse.json({
      success: true,
      leaderboard,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);

    // Provide helpful error message for 402 (Payment Required)
    let errorMessage = "Failed to fetch leaderboard";
    let statusCode = 500;

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; statusText?: string } };
      if (axiosError.response?.status === 402) {
        errorMessage = "Neynar API key required. Please add NEYNAR_API_KEY to your environment variables. Get a free key at https://neynar.com";
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
