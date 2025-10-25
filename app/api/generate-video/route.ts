import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

// Configure Fal AI
fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, duration, transactionHash } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Validate duration
    const validDuration = duration && [4, 8, 12].includes(duration) ? duration : 4;

    console.log("Generating video for prompt:", prompt);
    console.log("Duration:", validDuration, "seconds");
    console.log("Payment transaction:", transactionHash);

    // Generate video using Fal AI Sora 2
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
          console.log("Generation progress:", update.logs);
        }
      },
    });

    console.log("Fal AI Sora 2 result:", result);

    // Extract video URL from result
    const resultData = result as { data?: { video?: { url?: string } } };
    const videoUrl = resultData.data?.video?.url;

    if (!videoUrl) {
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
    console.error("Video generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Video generation failed"
      },
      { status: 500 }
    );
  }
}
