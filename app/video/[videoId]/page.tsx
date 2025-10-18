"use client";

import { notFound } from "next/navigation";
import { Heart, MessageCircle, Share2, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mockVideos } from "@/components/video-feed";
import { useState, use } from "react";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    videoId: string;
  }>;
}

export default function VideoPage({ params }: PageProps) {
  const { videoId } = use(params);
  const video = mockVideos.find((v) => v.id === videoId);
  const [isLiked, setIsLiked] = useState(video?.isLiked || false);
  const [likes, setLikes] = useState(video?.likes || 0);

  if (!video) {
    notFound();
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/">
          <Button variant="ghost" size="icon" className="bg-white/20 backdrop-blur-sm hover:bg-white/30">
            <ArrowLeft className="h-6 w-6 text-white" />
          </Button>
        </Link>
      </div>

      {/* Video Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60">
        <video
          src={video.videoUrl}
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          controls
        />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 pb-24">
        <div className="flex items-end justify-between gap-4">
          {/* Left side - User info and description */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage src={video.avatar || "/placeholder.svg"} alt={video.username} />
                <AvatarFallback>{video.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-white text-balance">@{video.username}</span>
            </div>
            <p className="text-sm text-white text-balance leading-relaxed">{video.description}</p>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-1 transition-transform active:scale-90"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  isLiked ? "bg-rose-500" : "bg-white/20 backdrop-blur-sm"
                }`}
              >
                <Heart className={`h-6 w-6 ${isLiked ? "fill-white text-white" : "text-white"}`} />
              </div>
              <span className="text-xs font-semibold text-white">{formatCount(likes)}</span>
            </button>

            <button className="flex flex-col items-center gap-1 transition-transform active:scale-90">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-white">{formatCount(video.comments)}</span>
            </button>

            <button className="flex flex-col items-center gap-1 transition-transform active:scale-90">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-white">{formatCount(video.shares)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
