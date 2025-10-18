"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useMiniKitQuickAuth } from "@coinbase/onchainkit/minikit";

interface ComposeCastApiProps {
  videoUrl: string;
  text?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function ComposeCastApi({
  videoUrl,
  text = "",
  onSuccess,
  onError,
}: ComposeCastApiProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { fetchAuth } = useMiniKitQuickAuth();

  const handlePostCast = async () => {
    setIsLoading(true);
    try {
      // Use MiniKit's fetchAuth to make authenticated requests
      const response = await fetchAuth("/api/compose-cast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
