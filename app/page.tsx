"use client";
import { useEffect, useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useSearchParams } from "next/navigation";
import { FeedPage } from "@/components/feed-page";
import { Loader2 } from "lucide-react";
import type { VideoData } from "@/types/clipchain";

export default function Home() {
  const { isFrameReady, setFrameReady } = useMiniKit();
  const searchParams = useSearchParams();
  const videoId = searchParams.get("videoId");
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/videos");
        const data = await response.json();

        if (data.success && data.videos) {
          // Add additional metadata for the new UI
          const enrichedVideos = data.videos.map((video: VideoData) => ({
            ...video,
            timestamp: video.timestamp || "2h ago",
            verified: true,
            hashtags: ["#clipchain", "#aiart"],
            prompt: video.description ? `Generated with AI: ${video.description.slice(0, 50)}...` : undefined,
          }));
          setVideos(enrichedVideos);
        } else {
          // Fallback mock data
          setVideos([
            {
              id: "1",
              username: "cryptoartist",
              fid: 12345,
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=cryptoartist",
              description: "Just generated this cyberpunk cityscape with AI! The future is here 🚀",
              likes: 1200,
              comments: 156,
              shares: 89,
              videoUrl: "",
              castUrl: "https://warpcast.com/cryptoartist/0x123",
              castHash: "0x123",
              timestamp: "2h ago",
              verified: true,
              hashtags: ["#clipchain", "#aiart", "#cyberpunk"],
              prompt: "A futuristic neon-lit city at night with flying cars...",
            },
            {
              id: "2",
              username: "aimaster",
              fid: 67890,
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aimaster",
              description: "Creating magic with AI ✨ Check out this animation!",
              likes: 890,
              comments: 92,
              shares: 45,
              videoUrl: "",
              castUrl: "https://warpcast.com/aimaster/0x456",
              castHash: "0x456",
              timestamp: "5h ago",
              verified: true,
              hashtags: ["#clipchain", "#animation"],
              prompt: "An abstract artistic composition with flowing colors",
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
        // Fallback to mock data
        setVideos([
          {
            id: "1",
            username: "cryptoartist",
            fid: 12345,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=cryptoartist",
            description: "Just generated this cyberpunk cityscape with AI! The future is here 🚀",
            likes: 1200,
            comments: 156,
            shares: 89,
            videoUrl: "",
            castUrl: "https://warpcast.com/cryptoartist/0x123",
            castHash: "0x123",
            timestamp: "2h ago",
            verified: true,
            hashtags: ["#clipchain", "#aiart", "#cyberpunk"],
            prompt: "A futuristic neon-lit city at night with flying cars...",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          <p className="text-white text-sm">Loading ClipChain videos...</p>
        </div>
      </div>
    );
  }

  return <FeedPage videos={videos} initialVideoId={videoId} />;
}
