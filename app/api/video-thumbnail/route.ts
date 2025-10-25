import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const videoUrl = request.nextUrl.searchParams.get("url");

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: "Video URL is required" },
        { status: 400 }
      );
    }

    // For now, return the video URL itself
    // Farcaster clients will extract the first frame
    // In future, you could use a service like Cloudinary or generate thumbnails server-side
    return NextResponse.json({
      success: true,
      thumbnailUrl: videoUrl,
    });

  } catch (error) {
    console.error("❌ Thumbnail generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Thumbnail generation failed"
      },
      { status: 500 }
    );
  }
}
