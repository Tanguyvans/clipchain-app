"use client"

import { ChevronLeft, MoreVertical, Share2, Settings, CheckCircle2, Play } from "lucide-react"
import { useState } from "react"

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
  bio?: string
  videos?: VideoGridItem[]
  displayName?: string
  verified?: boolean
  followerCount?: number
  followingCount?: number
  videoCount?: number
  recastCount?: number
}

export function ProfilePage({
  username = "tanguyvans",
  avatar,
  bio = "AI enthusiast | Building the future",
  videos = [],
  displayName,
  verified = false,
  followerCount = 0,
  followingCount = 0,
  videoCount = 0,
  recastCount = 0,
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"videos" | "liked" | "remixes">("videos")

  const stats = [
    { label: "Videos", value: videoCount.toString(), color: "text-white" },
    { label: "Recasts", value: recastCount.toString(), color: "text-white" },
  ]

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
      <div className="px-6 pb-6 text-center">
        <div className="relative mb-4 inline-block">
          <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-1">
            <img
              src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
              alt={username}
              className="h-full w-full rounded-full border-2 border-[#0A0A0A]"
            />
          </div>
        </div>

        <div className="mb-1 flex items-center justify-center gap-1.5">
          <h1 className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
            {displayName || username}
          </h1>
          {verified && <CheckCircle2 className="h-5 w-5 fill-purple-500 text-white" />}
        </div>
        {displayName && username !== displayName && (
          <p className="text-sm text-gray-500">@{username}</p>
        )}

        <p className="mx-auto mb-1 max-w-xs text-sm text-gray-400">{bio}</p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span>{followerCount} followers</span>
          <span>•</span>
          <span>{followingCount} following</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 px-6 pb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-800 bg-[#1A1A1A] p-4 text-center"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 px-6 pb-6">
        <button className="flex-1 rounded-xl border-2 border-purple-500/50 py-3 text-center font-semibold text-white transition-colors hover:bg-purple-500/10">
          Edit Profile
        </button>
        <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A1A1A] transition-colors hover:bg-[#2A2A2A]">
          <Share2 className="h-5 w-5 text-white" />
        </button>
        <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A1A1A] transition-colors hover:bg-[#2A2A2A]">
          <Settings className="h-5 w-5 text-white" />
        </button>
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
              className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-lg"
            >
              <div className={`h-full w-full ${gradients[index % gradients.length]}`}>
                {video.videoUrl && (
                  <img
                    src={video.videoUrl}
                    alt="Video thumbnail"
                    className="h-full w-full object-cover"
                  />
                )}
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
