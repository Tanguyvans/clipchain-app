"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function FrameContent() {
  const searchParams = useSearchParams();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const video = searchParams.get("video");
    if (video) {
      setVideoUrl(decodeURIComponent(video));
    }
  }, [searchParams]);

  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-white">No video URL provided</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md aspect-[9/16]">
        <video
          src={videoUrl}
          className="w-full h-full object-cover"
          controls
          autoPlay
          loop
          playsInline
        />
      </div>
    </div>
  );
}

export default function FramePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        </div>
      }
    >
      <FrameContent />
    </Suspense>
  );
}
