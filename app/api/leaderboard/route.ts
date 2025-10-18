import { NextRequest, NextResponse } from "next/server";
import { NeynarAPIClient, FeedType, FilterType } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY || "NEYNAR_API_DOCS");

interface LeaderboardUser {
  rank: number;
  username: string;
  fid: number;
  avatar: string;
  likes: number;
  casts: number;
  displayName?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Fetch trending casts from Neynar
    const feed = await client.fetchFeed({
      feedType: FeedType.Filter,
      filterType: FilterType.GlobalTrending,
      limit: 100, // Get more casts to aggregate users
    });

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
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch leaderboard",
      },
      { status: 500 }
    );
  }
}
