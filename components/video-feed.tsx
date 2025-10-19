"use client"

import { useState, useRef, useEffect } from "react"
import { Repeat, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import sdk from "@farcaster/miniapp-sdk"

export interface Video {
  id: string
  username: string
  fid?: number
  avatar: string
  description: string
  likes: number
  comments: number
  shares: number
  videoUrl: string
  castUrl?: string
  castHash?: string
  isLiked?: boolean
}

export const mockVideos: Video[] = [
  {
    id: "TvNXEwNfAkR7wUtp0foIV_zugMcRgz",
    username: "creative_monkey",
    avatar: "/diverse-user-avatars.png",
    description: "Check out this amazing video! 🎬 #creative #viral",
    likes: 12400,
    comments: 234,
    shares: 89,
    videoUrl: "https://v3b.fal.media/files/b/monkey/TvNXEwNfAkR7wUtp0foIV_zugMcRgz.mp4",
    isLiked: false,
  },
  {
    id: "49AK4V5zO6RkFNfI-wiHc_ype2StUS",
    username: "tiger_studio",
    avatar: "/dancer-avatar.png",
    description: "Epic content alert! 🐯 #trending #amazing",
    likes: 45200,
    comments: 892,
    shares: 234,
    videoUrl: "https://v3b.fal.media/files/b/tiger/49AK4V5zO6RkFNfI-wiHc_ype2StUS.mp4",
    isLiked: false,
  },
  {
    id: "49AK4V5zO6RkFNfI-wiHc_ype2StUS-2",
    username: "viral_creator",
    avatar: "/chef-avatar.png",
    description: "You won't believe this! 🔥 #mustwatch #viral",
    likes: 28900,
    comments: 456,
    shares: 167,
    videoUrl: "https://v3b.fal.media/files/b/tiger/49AK4V5zO6RkFNfI-wiHc_ype2StUS.mp4",
    isLiked: false,
  },
]

export function VideoFeed() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/videos")
        const data = await response.json()

        if (data.success && data.videos) {
          setVideos(data.videos)
        } else {
          setError(data.error || "Failed to fetch videos")
          // Fallback to mock data if API fails
          setVideos(mockVideos)
        }
      } catch (err) {
        console.error("Error fetching videos:", err)
        setError("Failed to load videos")
        // Fallback to mock data on error
        setVideos(mockVideos)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideos()
  }, [])

  const handleRecast = async (video: Video) => {
    // Use Farcaster SDK directly for better compatibility with Coinbase app
    try {
      await sdk.actions.composeCast({
        text: `Check out this #clipchain video!`,
        embeds: video.castUrl ? [video.castUrl] : [],
      })
    } catch (error) {
      console.error("Error composing cast:", error)
    }
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


  if (isLoading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
          <p className="text-white text-sm">Loading ClipChain videos...</p>
        </div>
      </div>
    )
  }

  if (error && videos.length === 0) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <p className="text-white text-lg">No videos found</p>
          <p className="text-gray-400 text-sm">Post a video with #clipchain to appear here!</p>
        </div>
      </div>
    )
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
            <video
              src={video.videoUrl}
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
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

              {/* Right side - Action button */}
              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={() => handleRecast(video)}
                  className="flex flex-col items-center gap-1 transition-transform active:scale-90"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
                    <Repeat className="h-6 w-6 text-white" />
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
