"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function PostVideoContent() {
  const searchParams = useSearchParams();
  const { composeCast } = useComposeCast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const videoUrl = searchParams.get("url");
    const text = searchParams.get("text");

    if (videoUrl) {
      try {
        // Decode the URL in case it's encoded
        const decodedUrl = decodeURIComponent(videoUrl);
        const decodedText = text ? decodeURIComponent(text) : "Check out my ClipChain video! 🎬";

        // Auto-open compose dialog with /clipchain channel
        composeCast({
          text: decodedText,
          embeds: [decodedUrl],
          channelKey: "clipchain", // Post to the /clipchain channel
        });

        toast.success("Posting to /clipchain channel...");
        setStatus("success");
      } catch (error) {
        console.error("Error composing cast:", error);
        toast.error("Failed to open compose dialog");
        setStatus("error");
      }
    } else {
      toast.error("No video URL provided");
      setStatus("error");
    }
  }, [searchParams, composeCast]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {status === "loading" && (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="text-lg font-medium">Preparing your post...</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <p className="text-lg font-medium">Compose dialog opened!</p>
                <p className="text-sm text-muted-foreground">
                  Complete your post in the Farcaster compose dialog
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="h-12 w-12 mx-auto text-red-500" />
                <p className="text-lg font-medium">Failed to open compose dialog</p>
                <p className="text-sm text-muted-foreground">
                  Make sure you provided a valid video URL
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Usage: /post-video?url=VIDEO_URL&text=YOUR_TEXT
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PostVideoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen p-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <PostVideoContent />
    </Suspense>
  );
}
