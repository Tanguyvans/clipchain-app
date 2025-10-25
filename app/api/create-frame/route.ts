import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, prompt } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: "Video URL is required" },
        { status: 400 }
      );
    }

    // Create frame URL that will display the video
    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const frameUrl = `${baseUrl}/frame?video=${encodeURIComponent(videoUrl)}`;

    console.log("📦 Created frame URL:", frameUrl);

    return NextResponse.json({
      success: true,
      frameUrl,
      videoUrl,
      prompt,
    });

  } catch (error) {
    console.error("❌ Frame creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Frame creation failed"
      },
      { status: 500 }
    );
  }
}
