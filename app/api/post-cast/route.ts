import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { frameUrl, prompt, signer_uuid } = await request.json();

    if (!frameUrl) {
      return NextResponse.json(
        { success: false, error: "Frame URL is required" },
        { status: 400 }
      );
    }

    if (!signer_uuid) {
      return NextResponse.json(
        { success: false, error: "Signer UUID is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "NEYNAR_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Create cast text
    const castText = prompt
      ? `${prompt}\n\nGenerated with ClipChain 🎬✨`
      : "Check out my AI-generated video! 🎬✨\n\nGenerated with ClipChain";

    console.log("📝 Posting cast to Farcaster...");
    console.log("Text:", castText);
    console.log("Frame URL:", frameUrl);

    // Post cast to Farcaster via Neynar API
    const response = await fetch("https://api.neynar.com/v2/farcaster/cast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": apiKey,
      },
      body: JSON.stringify({
        signer_uuid: signer_uuid,
        text: castText,
        embeds: [{ url: frameUrl }],
        channel_id: "clipchain", // Post to /clipchain channel
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Neynar API error:", errorData);
      throw new Error(errorData.message || "Failed to post cast");
    }

    const data = await response.json();
    console.log("✅ Cast posted successfully:", data);

    return NextResponse.json({
      success: true,
      cast: data.cast,
      castHash: data.cast?.hash,
    });

  } catch (error) {
    console.error("❌ Post cast error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to post cast"
      },
      { status: 500 }
    );
  }
}
