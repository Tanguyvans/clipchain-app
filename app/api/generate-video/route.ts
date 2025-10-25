import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

// Configure Fal AI
fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check if FAL_KEY is loaded
    if (!process.env.FAL_KEY) {
      console.error("❌ FAL_KEY environment variable is not set!");
      return NextResponse.json(
        { success: false, error: "Server configuration error: FAL_KEY not found" },
        { status: 500 }
      );
    }

    const { prompt, duration, transactionHash } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Validate duration
    const validDuration = duration && [4, 8, 12].includes(duration) ? duration : 4;

    console.log("=== 🎬 VIDEO GENERATION REQUEST ===");
    console.log("📝 Prompt:", prompt);
    console.log("⏱️  Duration:", validDuration, "seconds");
    console.log("💳 Transaction:", transactionHash);
    console.log("🔑 FAL_KEY present:", !!process.env.FAL_KEY);

    // Generate video using Fal AI Sora 2
    console.log("🚀 Starting Fal AI generation...");

    const result = await fal.subscribe("fal-ai/sora-2/text-to-video", {
      input: {
        prompt: prompt,
        resolution: "720p",
        aspect_ratio: "9:16", // Vertical for mobile TikTok-style
        duration: validDuration,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("⏳ Generation progress:", update.logs);
        }
      },
    });

    console.log("✅ Fal AI Sora 2 result:", JSON.stringify(result, null, 2));

    // Extract video URL from result
    // Fal AI returns: { data: { video: { url: "..." } } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultData = result as any;
    const videoUrl = resultData.data?.video?.url || resultData.video?.url || resultData.data?.url;

    console.log("🎥 Extracted video URL:", videoUrl);

    if (!videoUrl) {
      console.error("❌ No video URL found in response:", result);
      console.error("Full result structure:", JSON.stringify(result, null, 2));
      throw new Error("No video URL in Fal AI response");
    }

    // TODO: You might want to:
    // 1. Verify the transaction on Base blockchain
    // 2. Upload video to IPFS for permanent storage
    // 3. Create a frame URL for the video

    return NextResponse.json({
      success: true,
      videoUrl,
      transactionHash,
      prompt,
    });

  } catch (error) {
    console.error("❌ Video generation error:", error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Video generation failed",
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
