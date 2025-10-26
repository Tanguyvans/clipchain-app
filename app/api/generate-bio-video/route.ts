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

    const { bio, displayName } = await request.json();

    if (!bio || typeof bio !== "string") {
      return NextResponse.json(
        { success: false, error: "Bio is required" },
        { status: 400 }
      );
    }

    console.log("=== 🎬 BIO-TO-VIDEO GENERATION REQUEST ===");
    console.log("👤 Display Name:", displayName);
    console.log("📝 Bio:", bio);
    console.log("🔑 FAL_KEY present:", !!process.env.FAL_KEY);

    // Create a creative prompt based on the bio
    const enhancedPrompt = `Create a cinematic video that visually represents: "${bio}". ${
      displayName ? `This is about ${displayName}. ` : ""
    }Make it creative, engaging, and visually stunning with dynamic camera movements and vibrant colors.`;

    console.log("🎨 Enhanced prompt:", enhancedPrompt);

    // Generate video using Fal AI Sora 2
    console.log("🚀 Starting Fal AI text-to-video generation from bio...");

    const result = await fal.subscribe("fal-ai/sora-2/text-to-video", {
      input: {
        prompt: enhancedPrompt,
        resolution: "720p",
        aspect_ratio: "9:16", // Vertical for mobile
        duration: 4,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultData = result as any;
    const videoUrl = resultData.data?.video?.url || resultData.video?.url || resultData.data?.url;

    console.log("🎥 Extracted video URL:", videoUrl);

    if (!videoUrl) {
      console.error("❌ No video URL found in response:", result);
      console.error("Full result structure:", JSON.stringify(result, null, 2));
      throw new Error("No video URL in Fal AI response");
    }

    return NextResponse.json({
      success: true,
      videoUrl,
    });
  } catch (error) {
    console.error("❌ Bio-to-video generation failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate video from bio",
      },
      { status: 500 }
    );
  }
}
