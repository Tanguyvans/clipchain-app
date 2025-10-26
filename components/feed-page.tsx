"use client"

import { Heart, MessageCircle, Repeat2, Share2, Sparkles, CheckCircle2, Volume2, VolumeX } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import type { VideoData } from "@/types/clipchain"

interface FeedPageProps {
  videos: VideoData[]
  initialVideoId?: string | null
}

export function FeedPage({ videos, initialVideoId }: FeedPageProps) {
  const [isMuted, setIsMuted] = useState(false) // Start unmuted
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-enable interaction on mount (after a small delay to ensure everything is loaded)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🎬 Auto-enabling sound on page load')
      setHasInteracted(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Detect first user interaction (scroll also counts as interaction)
  useEffect(() => {
    const handleInteraction = (event: Event) => {
      console.log(`🎯 User interaction detected via ${event.type}!`)
      setHasInteracted(true)
      // Enable sound for current video immediately
      if (currentVideoId) {
        const video = videoRefs.current.get(currentVideoId)
        if (video && !isMuted) {
          video.muted = false
          console.log('🔊 Unmuted current video after interaction')
        }
      }
    }

    const events = ['click', 'touchstart', 'scroll', 'touchmove', 'wheel']
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true, passive: true })
      // Also listen on the container
      if (containerRef.current) {
        containerRef.current.addEventListener(event, handleInteraction, { once: true, passive: true })
      }
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction)
        if (containerRef.current) {
          containerRef.current.removeEventListener(event, handleInteraction)
        }
      })
    }
  }, [currentVideoId, isMuted])

  // Scroll to initial video if specified
  useEffect(() => {
    if (initialVideoId && containerRef.current) {
      const videoIndex = videos.findIndex(v => v.id === initialVideoId)
      if (videoIndex !== -1) {
        // Scroll to the video
        const videoElement = containerRef.current.children[videoIndex] as HTMLElement
        if (videoElement) {
          videoElement.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }, [initialVideoId, videos])

  // Manage video playback based on visibility
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = entry.target.getAttribute('data-video-id')
          const videoElement = videoId ? videoRefs.current.get(videoId) : null

          if (entry.isIntersecting && videoElement) {
            // Video is in view - play it
            console.log(`📹 Video ${videoId} is in view`)
            setCurrentVideoId(videoId)

            // Always start muted to allow autoplay
            videoElement.muted = true
            videoElement.play()
              .then(() => {
                console.log(`✅ Video ${videoId} playing`)
                // Successfully playing, now unmute if user has interacted and wants sound
                if (hasInteracted && !isMuted) {
                  // Small delay to ensure video is playing before unmuting
                  setTimeout(() => {
                    videoElement.muted = false
                    console.log(`🔊 Unmuted video ${videoId}, hasInteracted: ${hasInteracted}, isMuted: ${isMuted}`)
                  }, 100)
                }
              })
              .catch(err => console.warn(`Play failed for ${videoId}:`, err))
          } else if (videoElement) {
            // Video is out of view - pause and mute it
            console.log(`📹 Video ${videoId} is out of view`)
            videoElement.pause()
            videoElement.currentTime = 0
          }
        })
      },
      {
        root: containerRef.current,
        threshold: 0.5, // Video must be 50% visible
      }
    )

    // Observe all video containers
    const videoContainers = containerRef.current.querySelectorAll('[data-video-id]')
    videoContainers.forEach((container) => observer.observe(container))

    return () => observer.disconnect()
  }, [isMuted, videos, hasInteracted])

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    console.log(`🔊 Toggling mute to: ${newMutedState ? 'muted' : 'unmuted'}`)

    // Update only the currently playing video
    if (currentVideoId) {
      const video = videoRefs.current.get(currentVideoId)
      if (video) {
        video.muted = newMutedState
        video.volume = 1.0
      }
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#0A0A0A]">
      {/* Global Mute/Unmute Button - Top Right */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          console.log('🔘 Mute button clicked')
          toggleMute()
        }}
        className="fixed top-6 right-4 z-[9999] h-9 w-9 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 flex items-center justify-center transition-all active:scale-95"
        style={{ pointerEvents: 'auto' }}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4 text-white/90" />
        ) : (
          <Volume2 className="h-4 w-4 text-white/90" />
        )}
      </button>

      <div ref={containerRef} className="h-screen snap-y snap-mandatory overflow-y-scroll scrollbar-hide">
        {videos.map((video, index) => (
          <VideoCard key={video.id} video={video} index={index} isMuted={isMuted} videoRefs={videoRefs} />
        ))}
      </div>
    </div>
  )
}

function VideoCard({
  video,
  index,
  isMuted,
  videoRefs
}: {
  video: VideoData
  index: number
  isMuted: boolean
  videoRefs: { current: Map<string, HTMLVideoElement> }
}) {
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
    <div className="relative min-h-screen snap-start" data-video-id={video.id}>
      {/* Video Container */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Background - Video or Image would go here */}
        <div className={`absolute inset-0 ${bgGradient}`}>
          {video.videoUrl ? (
            <video
              ref={(el) => {
                if (el) {
                  videoRefs.current.set(video.id, el)
                  el.volume = 1.0
                  el.muted = true // Start muted, IntersectionObserver will unmute if needed
                }
              }}
              src={video.videoUrl}
              className="h-full w-full object-cover"
              loop
              playsInline
              preload="auto"
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

        {/* Top Left - User Info */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
          <img
            src={video.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.username}`}
            alt={video.username}
            className="h-12 w-12 rounded-full border-2 border-white/30 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white drop-shadow-lg">{video.username}</span>
              {video.verified && (
                <CheckCircle2 className="h-4 w-4 fill-purple-500 text-white" />
              )}
            </div>
            <span className="text-xs text-gray-300 drop-shadow-lg">{video.timestamp || "2h ago"}</span>
          </div>
        </div>

        {/* Bottom Caption Overlay */}
        <div className="absolute bottom-0 left-0 right-20 z-10 p-6 pb-24">
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
        <div className="absolute right-3 bottom-32 z-20 flex flex-col gap-3">
          {/* Like Button */}
          <button
            onClick={() => setLiked(!liked)}
            className={`flex h-11 w-11 flex-col items-center justify-center rounded-full border backdrop-blur-md transition-all ${
              liked
                ? "border-red-500 bg-red-500/20"
                : "border-white/10 bg-black/40 hover:scale-110"
            }`}
            aria-label="Like"
          >
            <Heart
              className={`h-[18px] w-[18px] ${liked ? "fill-red-500 text-red-500" : "text-white"}`}
            />
            <span className="text-[9px] font-bold text-white">
              {(liked ? video.likes + 1 : video.likes) >= 1000
                ? `${((liked ? video.likes + 1 : video.likes) / 1000).toFixed(1)}K`
                : liked ? video.likes + 1 : video.likes}
            </span>
          </button>

          {/* Recast Button */}
          <button
            onClick={() => setRecasted(!recasted)}
            className={`flex h-11 w-11 flex-col items-center justify-center rounded-full border backdrop-blur-md transition-all ${
              recasted
                ? "border-green-500 bg-green-500/20"
                : "border-white/10 bg-black/40 hover:scale-110"
            }`}
            aria-label="Recast"
          >
            <Repeat2
              className={`h-[18px] w-[18px] ${recasted ? "text-green-500" : "text-white"}`}
            />
            <span className="text-[9px] font-bold text-white">
              {recasted ? video.shares + 1 : video.shares}
            </span>
          </button>

          {/* Comment Button */}
          <button
            className="flex h-11 w-11 flex-col items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-md transition-all hover:scale-110"
            aria-label="Comment"
          >
            <MessageCircle className="h-[18px] w-[18px] text-white" />
            <span className="text-[9px] font-bold text-white">{video.comments}</span>
          </button>

          {/* Share Button */}
          <button
            className="flex h-11 w-11 flex-col items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-md transition-all hover:scale-110"
            aria-label="Share"
          >
            <Share2 className="h-[18px] w-[18px] text-white" />
          </button>

          {/* Generate Button */}
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border border-orange-400/50 bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/50 transition-all hover:scale-110 active:scale-95"
            aria-label="Generate similar"
          >
            <Sparkles className="h-[18px] w-[18px] text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
