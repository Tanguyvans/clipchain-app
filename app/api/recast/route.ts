import { NextRequest, NextResponse } from "next/server";
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

const apiKey = process.env.NEYNAR_API_KEY || "";
const config = new Configuration({
  apiKey: apiKey,
});
const client = new NeynarAPIClient(config);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { castHash, signerUuid } = body;

    if (!castHash || !signerUuid) {
      return NextResponse.json(
        { success: false, error: "castHash and signerUuid are required" },
        { status: 400 }
      );
    }

    // Recast the cast using Neynar SDK
    const result = await client.publishReaction({
      signerUuid,
      reactionType: "recast",
      target: castHash,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("Error recasting:", error);

    let errorMessage = "Failed to recast";
    let statusCode = 500;

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; statusText?: string; data?: unknown } };
      if (axiosError.response?.status) {
        errorMessage = `API error: ${axiosError.response.status}`;
        statusCode = axiosError.response.status;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}
