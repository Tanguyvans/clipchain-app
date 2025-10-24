"use client"

import { Heart, MessageCircle, Repeat2, Share2, Sparkles, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import type { VideoData } from "@/types/clipchain"

interface FeedPageProps {
  videos: VideoData[]
}

export function FeedPage({ videos }: FeedPageProps) {
  return (
    <div className="h-screen overflow-hidden bg-[#0A0A0A]">
      <div className="h-screen snap-y snap-mandatory overflow-y-scroll scrollbar-hide">
        {videos.map((video, index) => (
          <VideoCard key={video.id} video={video} index={index} />
        ))}
      </div>
    </div>
  )
}

function VideoCard({ video, index }: { video: VideoData; index: number }) {
  const [liked, setLiked] = useState(false)
  const [recasted, setRecasted] = useState(false)

  // Mock gradient backgrounds for demo
  const gradients = [
    "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900",
    "bg-gradient-to-br from-orange-900 via-red-900 to-pink-900",
    "bg-gradient-to-br from-green-900 via-teal-900 to-blue-900",
    "bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900",
  ]

  const bgGradient = gradients[index % gradients.length]

  return (
    <div className="relative min-h-screen snap-start">
      {/* Video Container */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Background - Video or Image would go here */}
        <div className={`absolute inset-0 ${bgGradient}`}>
          {video.videoUrl ? (
            <video
              src={video.videoUrl}
              className="h-full w-full object-cover"
              loop
              muted
              playsInline
              autoPlay
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-white/20">
                <Sparkles className="mx-auto h-24 w-24 mb-4" />
                <p className="text-sm">AI Generated Video</p>
              </div>
            </div>
          )}
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />

        {/* Top Left - User Info */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
          <img
            src={video.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.username}`}
            alt={video.username}
            className="h-12 w-12 rounded-full border-2 border-white/30 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white">{video.username}</span>
              {video.verified && (
                <CheckCircle2 className="h-4 w-4 fill-purple-500 text-white" />
              )}
            </div>
            <span className="text-xs text-gray-300">{video.timestamp || "2h ago"}</span>
          </div>
        </div>

        {/* Bottom Caption Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black via-black/90 to-transparent p-6 pt-20">
          <p className="mb-2 line-clamp-2 text-base font-medium text-white">
            {video.description}
          </p>

          {/* Hashtags */}
          {video.hashtags && video.hashtags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {video.hashtags.map((tag, i) => (
                <span key={i} className="text-sm font-semibold text-orange-500">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Prompt */}
          {video.prompt && (
            <p className="truncate text-xs italic text-gray-400">
              Prompt: {video.prompt}
            </p>
          )}
        </div>

        {/* Right Side Action Buttons */}
        <div className="absolute right-4 bottom-36 z-20 flex flex-col gap-4">
          {/* Like Button */}
          <button
            onClick={() => setLiked(!liked)}
            className={`flex h-12 w-12 flex-col items-center justify-center rounded-full border backdrop-blur-md transition-all ${
              liked
                ? "border-red-500 bg-red-500/20"
                : "border-white/10 bg-black/40 hover:scale-110"
            }`}
            aria-label="Like"
          >
            <Heart
              className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : "text-white"}`}
            />
            <span className="mt-0.5 text-[10px] font-bold text-white">
              {(liked ? video.likes + 1 : video.likes) >= 1000
                ? `${((liked ? video.likes + 1 : video.likes) / 1000).toFixed(1)}K`
                : liked ? video.likes + 1 : video.likes}
            </span>
          </button>

          {/* Recast Button */}
          <button
            onClick={() => setRecasted(!recasted)}
            className={`flex h-12 w-12 flex-col items-center justify-center rounded-full border backdrop-blur-md transition-all ${
              recasted
                ? "border-green-500 bg-green-500/20"
                : "border-white/10 bg-black/40 hover:scale-110"
            }`}
            aria-label="Recast"
          >
            <Repeat2
              className={`h-5 w-5 ${recasted ? "text-green-500" : "text-white"}`}
            />
            <span className="mt-0.5 text-[10px] font-bold text-white">
              {recasted ? video.shares + 1 : video.shares}
            </span>
          </button>

          {/* Comment Button */}
          <button
            className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-md transition-all hover:scale-110"
            aria-label="Comment"
          >
            <MessageCircle className="h-5 w-5 text-white" />
            <span className="mt-0.5 text-[10px] font-bold text-white">{video.comments}</span>
          </button>

          {/* Share Button */}
          <button
            className="flex h-12 w-12 flex-col items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-md transition-all hover:scale-110"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Generate Button */}
        <button
          className="absolute bottom-28 right-4 z-20 flex items-center gap-1.5 rounded-full border border-orange-400/50 bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 shadow-lg shadow-orange-500/40 transition-all hover:scale-105 active:scale-95"
          aria-label="Generate similar"
        >
          <Sparkles className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">Generate</span>
        </button>
      </div>
    </div>
  )
}
