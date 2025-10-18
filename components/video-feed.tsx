"use client"

import { useState, useRef } from "react"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Video {
  id: string
  username: string
  avatar: string
  description: string
  likes: number
  comments: number
  shares: number
  videoUrl: string
  isLiked: boolean
}

const mockVideos: Video[] = [
  {
    id: "1",
    username: "creative_alex",
    avatar: "/diverse-user-avatars.png",
    description: "Check out this amazing sunset! 🌅 #nature #beautiful",
    likes: 12400,
    comments: 234,
    shares: 89,
    videoUrl: "/sunset-beach-video.jpg",
    isLiked: false,
  },
  {
    id: "2",
    username: "dance_queen",
    avatar: "/dancer-avatar.png",
    description: "New dance routine! Who can do this? 💃 #dance #challenge",
    likes: 45200,
    comments: 892,
    shares: 234,
    videoUrl: "/dance-studio-video.jpg",
    isLiked: false,
  },
  {
    id: "3",
    username: "food_lover",
    avatar: "/chef-avatar.png",
    description: "Perfect pasta recipe 🍝 #cooking #foodie",
    likes: 28900,
    comments: 456,
    shares: 167,
    videoUrl: "/cooking-pasta-video.jpg",
    isLiked: false,
  },
  {
    id: "4",
    username: "tech_guru",
    avatar: "/tech-person-avatar.png",
    description: "Mind-blowing tech hack! 🚀 #tech #innovation",
    likes: 67800,
    comments: 1203,
    shares: 445,
    videoUrl: "/technology-gadget-video.jpg",
    isLiked: false,
  },
]

export function VideoFeed() {
  const [videos, setVideos] = useState<Video[]>(mockVideos)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleLike = (videoId: string) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? {
              ...video,
              isLiked: !video.isLiked,
              likes: video.isLiked ? video.likes - 1 : video.likes + 1,
            }
          : video,
      ),
    )
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }


  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {videos.map((video, index) => (
        <div
          key={video.id}
          className="relative h-screen w-full snap-start snap-always flex items-center justify-center"
        >
          {/* Video Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60">
            <img
              src={video.videoUrl || "/placeholder.svg"}
              alt={video.description}
              className="h-full w-full object-cover"
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
                  onClick={() => handleLike(video.id)}
                  className="flex flex-col items-center gap-1 transition-transform active:scale-90"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      video.isLiked ? "bg-rose-500" : "bg-white/20 backdrop-blur-sm"
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${video.isLiked ? "fill-white text-white" : "text-white"}`} />
                  </div>
                  <span className="text-xs font-semibold text-white">{formatCount(video.likes)}</span>
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

          {/* Scroll indicator */}
          {index === 0 && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 animate-bounce">
              <div className="flex flex-col items-center gap-1">
                <div className="h-8 w-0.5 bg-white/60 rounded-full" />
                <div className="h-2 w-2 rounded-full bg-white/60" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
