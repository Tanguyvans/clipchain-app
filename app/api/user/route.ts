import { NextRequest, NextResponse } from "next/server";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { Cast, User, BulkUsersByAddressResponse } from "@neynar/nodejs-sdk/build/api";

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
    const address = searchParams.get("address");

    if (!fid && !username && !address) {
      return NextResponse.json(
        {
          success: false,
          error: "Either fid, username, or address is required",
        },
        { status: 400 }
      );
    }

    let userData: User | undefined;
    let userCasts: Cast[] = [];

    if (address) {
      // Fetch user by wallet address (ETH or SOL)
      try {
        const response = await client.fetchBulkUsersByEthOrSolAddress({
          addresses: [address]
        });
        // The response is a map of addresses to arrays of users
        const bulkResponse = response as unknown as BulkUsersByAddressResponse;
        const addressKey = address.toLowerCase();
        const users = bulkResponse[addressKey];

        if (users && users.length > 0) {
          userData = users[0];
          console.log("Fetched user by address:", userData?.username, "FID:", userData?.fid);
        } else {
          return NextResponse.json(
            {
              success: false,
              error: `No Farcaster user found for address ${address}`,
            },
            { status: 404 }
          );
        }
      } catch (err) {
        console.error("Error looking up user by address:", err);
        return NextResponse.json(
          {
            success: false,
            error: `No Farcaster user found for address ${address}`,
          },
          { status: 404 }
        );
      }
    } else if (fid) {
      // Fetch user by FID
      const response = await client.fetchBulkUsers({ fids: [parseInt(fid)] });
      userData = response.users[0];
      console.log("Fetched user by FID:", userData?.username);
    } else if (username) {
      // Fetch user by username
      try {
        const response = await client.lookupUserByUsername({ username });
        // Extract user from response - the SDK already handles the unwrapping
        userData = response.user;
        console.log("Fetched user by username:", userData?.username, "FID:", userData?.fid);
      } catch (err) {
        console.error("Error looking up user by username:", err);
        return NextResponse.json(
          {
            success: false,
            error: `User @${username} not found on Farcaster`,
          },
          { status: 404 }
        );
      }
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

    // Fetch user's casts - FASTEST method for user profiles
    try {
      const castsResponse = await client.fetchCastsForUser({
        fid: userData.fid,
        limit: 100,
      });

      // Filter for ClipChain videos (posted to /clipchain channel)
      const allCasts = castsResponse.casts || [];
      userCasts = allCasts.filter(cast => {
        // Check if posted to clipchain channel
        const isInChannel = cast.channel?.id === "clipchain";
        // Or check if has video embed
        const hasVideo = cast.embeds?.some(embed => {
          const embedUrl = "url" in embed ? embed.url : null;
          return embedUrl && typeof embedUrl === "string" && embedUrl.includes(".mp4");
        });
        return isInChannel && hasVideo;
      });

      console.log(`Found ${userCasts.length} ClipChain videos for @${userData.username}`);
    } catch (err) {
      console.error("Error fetching user casts:", err);
      userCasts = [];
    }

    // Map videos
    const videos = userCasts
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
    const responseData = {
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
    };

    console.log("Returning user data:", {
      username: responseData.user.username,
      fid: responseData.user.fid,
      avatar: responseData.user.avatar,
      videoCount: responseData.user.videoCount
    });

    return NextResponse.json(responseData);
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
