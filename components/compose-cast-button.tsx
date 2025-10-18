"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useComposeCast } from "@coinbase/onchainkit/minikit";

interface ComposeCastButtonProps {
  videoUrl: string;
  text?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function ComposeCastButton({
  videoUrl,
  text = "",
  onSuccess,
  onError,
}: ComposeCastButtonProps) {
  const { composeCast } = useComposeCast();
  const [isLoading, setIsLoading] = useState(false);

  const handleComposeCast = async () => {
    setIsLoading(true);
    try {
      // Use MiniKit's composeCast hook to open the compose dialog
      composeCast({
        text: text || "Check out this awesome video!",
        embeds: [videoUrl],
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error composing cast:", error);
      onError?.(error instanceof Error ? error : new Error("Failed to compose cast"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleComposeCast}
      disabled={isLoading}
      variant="default"
      size="sm"
      className="flex items-center gap-2"
    >
      <Share2 className="h-4 w-4" />
      {isLoading ? "Sharing..." : "Share Cast"}
    </Button>
  );
}
