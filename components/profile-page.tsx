"use client"

import { ChevronLeft, MoreVertical, CheckCircle2, Play } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface VideoGridItem {
  id: string
  videoUrl: string
  views?: number
  likes?: number
  duration?: string
}

interface ProfilePageProps {
  username?: string
  avatar?: string
  videos?: VideoGridItem[]
  displayName?: string
  verified?: boolean
  videoCount?: number
  recastCount?: number
  currentStreak?: number
  freeGenerations?: number
}

export function ProfilePage({
  username = "tanguyvans",
  avatar,
  videos = [],
  displayName,
  verified = false,
  videoCount = 0,
  recastCount = 0,
  currentStreak = 0,
}: ProfilePageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"videos" | "liked" | "remixes">("videos")

  const displayVideos: VideoGridItem[] = videos.length > 0
    ? videos.map(v => ({
        id: v.id,
        videoUrl: v.videoUrl,
        views: v.views || v.likes || 0,
        duration: v.duration || "0:10"
      }))
    : [
        { id: "1", videoUrl: "", views: 1200, duration: "0:08" },
        { id: "2", videoUrl: "", views: 890, duration: "0:10" },
        { id: "3", videoUrl: "", views: 2300, duration: "0:05" },
        { id: "4", videoUrl: "", views: 456, duration: "0:12" },
        { id: "5", videoUrl: "", views: 1800, duration: "0:09" },
        { id: "6", videoUrl: "", views: 670, duration: "0:15" },
      ]

  const gradients = [
    "bg-gradient-to-br from-purple-600 to-blue-600",
    "bg-gradient-to-br from-orange-600 to-pink-600",
    "bg-gradient-to-br from-green-600 to-teal-600",
    "bg-gradient-to-br from-yellow-600 to-orange-600",
    "bg-gradient-to-br from-pink-600 to-purple-600",
    "bg-gradient-to-br from-blue-600 to-cyan-600",
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1A1A] transition-colors hover:bg-[#2A2A2A]"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1A1A] transition-colors hover:bg-[#2A2A2A]"
          aria-label="More options"
        >
          <MoreVertical className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="px-6 pb-4 text-center">
        <div className="relative mb-3 inline-block">
          <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-1">
            <img
              src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
              alt={displayName || username}
              className="h-full w-full rounded-full border-2 border-[#0A0A0A] object-cover"
              onError={(e) => {
                // Fallback to dicebear if avatar fails to load
                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
              }}
            />
          </div>
        </div>

        <div className="mb-1 flex items-center justify-center gap-1.5">
          <h1 className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-xl font-bold text-transparent">
            {displayName || username}
          </h1>
          {verified && <CheckCircle2 className="h-4 w-4 fill-purple-500 text-white" />}
        </div>
        {displayName && username !== displayName && (
          <p className="text-xs text-gray-500">@{username}</p>
        )}
      </div>

      {/* Stats Grid - 2 Column */}
      <div className="grid grid-cols-2 gap-2 px-6 pb-3">
        {/* Videos */}
        <div className="rounded-lg border border-gray-800 bg-[#1A1A1A] p-3 text-center">
          <div className="text-xl mb-1">🎬</div>
          <p className="text-lg font-bold text-white">{videoCount}</p>
          <p className="text-xs text-gray-400">Videos</p>
        </div>

        {/* Recasts */}
        <div className="rounded-lg border border-gray-800 bg-[#1A1A1A] p-3 text-center">
          <div className="text-xl mb-1">🔄</div>
          <p className="text-lg font-bold text-white">{recastCount}</p>
          <p className="text-xs text-gray-400">Recasts</p>
        </div>
      </div>

      {/* Streak - Full Width */}
      <div className="px-6 pb-4">
        <div className="rounded-lg border border-gray-800 bg-[#1A1A1A] p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">🔥</span>
            <div className="flex items-center gap-1">
              {currentStreak > 0 ? (
                <>
                  {Array.from({ length: Math.min(currentStreak, 5) }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-orange-400" />
                  ))}
                  {currentStreak > 5 && (
                    <span className="text-sm text-orange-400 ml-1">+{currentStreak - 5}</span>
                  )}
                </>
              ) : (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full border border-gray-600" />
                  ))}
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-center text-gray-300">{currentStreak} week{currentStreak !== 1 ? 's' : ''} streak</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-800 px-6 pb-4">
        {[
          { label: "My Videos", key: "videos" as const },
          { label: "Liked", key: "liked" as const },
          { label: "Remixes", key: "remixes" as const },
        ].map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-b-2 border-orange-500 text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Video Grid */}
      {displayVideos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 px-6 pb-20 pt-6">
          {displayVideos.map((video, index) => (
            <div
              key={video.id}
              onClick={() => router.push(`/?videoId=${video.id}`)}
              className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-lg"
            >
              <div className={`h-full w-full ${gradients[index % gradients.length]}`}>
                {video.videoUrl ? (
                  <video
                    src={video.videoUrl}
                    className="h-full w-full object-cover"
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause()
                      e.currentTarget.currentTime = 0
                    }}
                  />
                ) : null}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Play className="h-8 w-8 text-white" fill="white" />
              </div>

              {/* View Count */}
              <div className="absolute bottom-1 left-1 rounded bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                {(video.views || 0) >= 1000 ? `${((video.views || 0) / 1000).toFixed(1)}K` : video.views || 0}
              </div>

              {/* Duration */}
              <div className="absolute top-1 right-1 rounded bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                {video.duration || "0:10"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-800">
            <Play className="h-10 w-10 text-gray-600" />
          </div>
          <p className="mb-2 text-lg text-gray-400">No videos yet</p>
          <button className="mt-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105">
            Create your first video
          </button>
        </div>
      )}
    </div>
  )
}
