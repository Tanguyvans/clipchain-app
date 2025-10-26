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

    const { imageUrl, prompt } = await request.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { success: false, error: "Image URL is required" },
        { status: 400 }
      );
    }

    console.log("=== 🎬 IMAGE-TO-VIDEO GENERATION REQUEST ===");
    console.log("🖼️  Image URL:", imageUrl);
    console.log("📝 Prompt:", prompt || "default animation");
    console.log("🔑 FAL_KEY present:", !!process.env.FAL_KEY);

    // Generate video using Fal AI Sora 2 image-to-video
    console.log("🚀 Starting Fal AI image-to-video generation...");

    const result = await fal.subscribe("fal-ai/sora-2/image-to-video", {
      input: {
        image_url: imageUrl,
        prompt: prompt || "Animate this image with subtle, natural movement",
        resolution: "720p",
        aspect_ratio: "9:16", // Vertical for mobile
        duration: 4, // 4 seconds for profile pic animation
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("⏳ Generation progress:", update.logs);
        }
      },
    });

    console.log("✅ Fal AI Sora 2 image-to-video result:", JSON.stringify(result, null, 2));

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
    console.error("❌ Image-to-video generation failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate video from image",
      },
      { status: 500 }
    );
  }
}
