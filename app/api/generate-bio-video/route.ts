import { NextRequest, NextResponse } from "next/server";
import * as fal from "@fal-ai/serverless-client";
import { requestRefund } from "@/lib/refund";

// Configure Fal AI
fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  let transactionHash = "";
  let userWalletAddress = "";

  try {
    // Check if FAL_KEY is loaded
    if (!process.env.FAL_KEY) {
      console.error("❌ FAL_KEY environment variable is not set!");
      return NextResponse.json(
        { success: false, error: "Server configuration error: FAL_KEY not found" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { imageUrl, bio, displayName, transactionHash: txHash, userWalletAddress: wallet } = body;

    // Store for potential refund
    transactionHash = txHash || "";
    userWalletAddress = wallet || "";

    if (!bio || typeof bio !== "string") {
      return NextResponse.json(
        { success: false, error: "Bio is required" },
        { status: 400 }
      );
    }

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { success: false, error: "Profile image URL is required" },
        { status: 400 }
      );
    }

    // Validate image URL
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      throw new Error(`Invalid image URL format: ${imageUrl}`);
    }

    console.log("=== 🎬 BIO SPEECH PRESENTATION GENERATION REQUEST ===");
    console.log("👤 Display Name:", displayName);
    console.log("📝 Bio:", bio);
    console.log("🖼️  Image URL:", imageUrl);
    console.log("🔑 FAL_KEY present:", !!process.env.FAL_KEY);

    // Create a short summary of the bio (first 100 chars or full bio if shorter)
    const bioSummary = bio.length > 100 ? bio.substring(0, 100) + "..." : bio;

    // Create a presentation-style prompt where the person in the image is giving a speech
    const speechPrompt = `The person in this image is a professional presenter ${displayName ? `named ${displayName}` : ""} giving a confident speech presentation. They are explaining: "${bioSummary}". Professional setting with excellent lighting, engaging body language, animated gesturing while speaking to the audience, expressive facial expressions, dynamic movement, cinematic camera angle, professional video production quality, 8 seconds of compelling presentation.`;

    console.log("🎨 Speech presentation prompt:", speechPrompt);

    // Generate video using Fal AI Sora 2 image-to-video
    console.log("🚀 Starting Fal AI image-to-video generation for bio speech...");

    const result = await fal.subscribe("fal-ai/sora-2/image-to-video", {
      input: {
        image_url: imageUrl,
        prompt: speechPrompt,
        resolution: "720p",
        aspect_ratio: "9:16", // Vertical for mobile
        duration: 8, // 8 seconds for speech presentation
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

    // Request refund if we have payment details
    if (transactionHash && userWalletAddress) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await requestRefund(
        transactionHash,
        userWalletAddress,
        `Bio speech presentation generation failed: ${errorMessage}`
      );
      console.log("💸 Refund requested for transaction:", transactionHash);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate bio speech presentation",
        refundRequested: !!(transactionHash && userWalletAddress),
      },
      { status: 500 }
    );
  }
}
