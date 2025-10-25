import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";

// Configure Fal AI
fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, transactionHash } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Generating video for prompt:", prompt);
    console.log("Payment transaction:", transactionHash);

    // Generate video using Fal AI
    // Using fal-ai/minimax-video - adjust model as needed
    const result = await fal.subscribe("fal-ai/minimax-video", {
      input: {
        prompt: prompt,
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Generation progress:", update.logs);
        }
      },
    });

    console.log("Fal AI result:", result);

    // Extract video URL from result
    const videoUrl = result.data?.video?.url;

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
