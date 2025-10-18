"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { sdk } from "@farcaster/miniapp-sdk";

interface ComposeCastResponse {
  success: boolean;
  message: string;
  data: {
    userFid: string;
    videoUrl: string;
    text: string;
    timestamp: string;
  };
}

interface ComposeCastApiProps {
  videoUrl: string;
  text?: string;
  onSuccess?: (data: ComposeCastResponse) => void;
  onError?: (error: Error) => void;
}

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export function ComposeCastApi({
  videoUrl,
  text = "",
  onSuccess,
  onError,
}: ComposeCastApiProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePostCast = async () => {
    setIsLoading(true);
    try {
      // Get the JWT token from Quick Auth
      const { token: authToken } = await sdk.quickAuth.getToken();

      // Use sdk.quickAuth.fetch to make authenticated requests
      const response = await sdk.quickAuth.fetch(`${BACKEND_ORIGIN}/api/compose-cast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          videoUrl,
          text: text || "Check out this amazing video!",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to compose cast");
      }

      const data = await response.json();
      console.log("Cast composed successfully:", data);
      onSuccess?.(data);
    } catch (error) {
      console.error("Error composing cast:", error);
      onError?.(error instanceof Error ? error : new Error("Failed to compose cast"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePostCast}
      disabled={isLoading}
      variant="secondary"
      size="sm"
      className="flex items-center gap-2"
    >
      <Share2 className="h-4 w-4" />
      {isLoading ? "Posting..." : "Post to Farcaster"}
    </Button>
  );
}
