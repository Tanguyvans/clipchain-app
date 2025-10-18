import { Errors, createClient } from "@farcaster/quick-auth";
import { NextRequest, NextResponse } from "next/server";

const client = createClient();

// Helper function to determine the correct domain for JWT verification
function getUrlHost(request: NextRequest): string {
  // First try to get the origin from the Origin header (most reliable for CORS requests)
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      return url.host;
    } catch (error) {
      console.warn("Invalid origin header:", origin, error);
    }
  }

  // Fallback to Host header
  const host = request.headers.get("host");
  if (host) {
    return host;
  }

  // Final fallback to environment variables
  let urlValue: string;
  if (process.env.VERCEL_ENV === "production") {
    urlValue = process.env.NEXT_PUBLIC_URL!;
  } else if (process.env.VERCEL_URL) {
    urlValue = `https://${process.env.VERCEL_URL}`;
  } else {
    urlValue = "http://localhost:3000";
  }

  const url = new URL(urlValue);
  return url.host;
}

export async function POST(request: NextRequest) {
  // Verify authentication
  const authorization = request.headers.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  try {
    // Verify the JWT token
    const payload = await client.verifyJwt({
      token: authorization.split(" ")[1] as string,
      domain: getUrlHost(request),
    });

    // If the token was valid, payload.sub will be the user's Farcaster ID
    const userFid = payload.sub;

    // Parse request body
    const body = await request.json();
    const { videoUrl, text } = body;

    // Validate request body
    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json(
        { message: "Video URL is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(videoUrl);
    } catch {
      return NextResponse.json(
        { message: "Invalid video URL format" },
        { status: 400 }
      );
    }

    // Optional text validation
    const castText = text && typeof text === "string" ? text : "";

    // Here you would integrate with Farcaster's casting API
    // For now, we'll return success with the cast details
    // In production, you would use the Neynar SDK or Farcaster Hub API

    // Example using Neynar SDK (you have @neynar/nodejs-sdk installed):
    // const neynar = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);
    // const cast = await neynar.publishCast({
    //   signerUuid: userSignerUuid,
    //   text: castText,
    //   embeds: [{ url: videoUrl }]
    // });

    return NextResponse.json({
      success: true,
      message: "Cast composed successfully",
      data: {
        userFid,
        videoUrl,
        text: castText,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    if (e instanceof Error) {
      console.error("Error composing cast:", e);
      return NextResponse.json(
        { message: e.message || "Failed to compose cast" },
        { status: 500 }
      );
    }
    throw e;
  }
}
