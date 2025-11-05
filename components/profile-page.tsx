"use client"

import { ChevronLeft, MoreVertical, CheckCircle2, Play, Gift } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginStreakCard } from "./login-streak-card"

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
  userFid?: number
  onStreakUpdate?: (newStreak: number, freeGens: number) => void
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
  userFid,
  onStreakUpdate: _onStreakUpdate,
}: ProfilePageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"videos" | "liked" | "remixes">("videos")
  const [dailyRewardAvailable, setDailyRewardAvailable] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [showRewardNotif, setShowRewardNotif] = useState(false)

  // Calculate progress to next free generation (every 10 videos)
  const progressToNext = currentStreak % 10
  const remaining = 10 - progressToNext

  // Check if daily reward is available
  useEffect(() => {
    const checkDailyReward = async () => {
      if (!userFid) return

      try {
        const response = await fetch(`/api/user/daily?fid=${userFid}`)
        const data = await response.json()

        if (data.success) {
          setDailyRewardAvailable(data.available)
        }
      } catch (error) {
        console.error("Error checking daily reward:", error)
      }
    }

    checkDailyReward()
  }, [userFid])

  const claimDailyReward = async () => {
    if (!userFid || claiming) return

    setClaiming(true)
    try {
      const response = await fetch("/api/user/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fid: userFid }),
      })

      const data = await response.json()

      if (data.success && !data.alreadyClaimed) {
        setDailyRewardAvailable(false)
        setShowRewardNotif(true)
        setTimeout(() => setShowRewardNotif(false), 3000)
      }
    } catch (error) {
      console.error("Error claiming daily reward:", error)
    } finally {
      setClaiming(false)
    }
  }

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
      {/* Header with gradient backdrop */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent h-48" />
        <div className="relative flex items-center justify-between px-6 py-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-all hover:bg-black/60 hover:border-white/20 active:scale-95"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-all hover:bg-black/60 hover:border-white/20 active:scale-95"
            aria-label="More options"
          >
            <MoreVertical className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Profile Section - Enhanced */}
        <div className="relative px-6 py-2 text-center">
          <div className="relative mb-2 inline-block">
            {/* Avatar with animated gradient ring */}
            <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500 p-[3px] shadow-2xl shadow-purple-500/30 animate-pulse">
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
            <h1 className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-lg font-bold text-transparent">
              {displayName || username}
            </h1>
            {verified && <CheckCircle2 className="h-4 w-4 fill-purple-500 text-white drop-shadow-lg" />}
          </div>
          {displayName && username !== displayName && (
            <p className="text-xs text-gray-400 font-medium">@{username}</p>
          )}
        </div>
      </div>

      {/* Enhanced Stats - Single Row */}
      <div className="px-6 pb-2">
        <div className="flex items-center justify-center gap-4 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-violet-500/5 to-blue-500/5 py-2.5 px-4 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20">
              <span className="text-base">🎬</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">{videoCount}</span>
              <span className="text-xs text-gray-400">Videos</span>
            </div>
          </div>
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20">
              <span className="text-base">🔄</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">{recastCount}</span>
              <span className="text-xs text-gray-400">Recasts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Reward - Enhanced */}
      {dailyRewardAvailable && (
        <div className="px-6 pb-2">
          <button
            onClick={claimDailyReward}
            disabled={claiming}
            className="w-full rounded-xl border border-green-500/40 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 py-3 px-4 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/30">
                <Gift className="h-4 w-4 text-green-300" />
              </div>
              <span className="text-sm font-bold text-white">
                {claiming ? "Claiming..." : "Claim Daily Reward (+1 Credit)"}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Reward Notification */}
      {showRewardNotif && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-semibold">
            🎉 Daily Bonus Claimed! +1 Credit
          </div>
        </div>
      )}

      {/* Login Streak Card */}
      <div className="px-6 pb-1.5">
        <LoginStreakCard userFid={userFid} />
      </div>

      {/* Generation Counter - Enhanced */}
      <div className="px-6 pb-2">
        <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-blue-500/10 p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-500/20">
                <span className="text-lg">🎬</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{currentStreak} generated</span>
                <span className="text-xs text-gray-400">Keep creating!</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-purple-400">{remaining} more</span>
              <span className="text-xs text-gray-500">for free gen</span>
            </div>
          </div>
          {/* Enhanced Progress bar */}
          <div className="relative w-full h-2 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/50">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-violet-500 to-blue-500 transition-all duration-500 ease-out shadow-lg shadow-purple-500/50"
              style={{ width: `${(progressToNext / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs - Enhanced */}
      <div className="flex gap-6 border-b border-gray-800/50 px-6 pb-2 pt-3">
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
              className={`relative pb-2 text-sm font-bold transition-all ${
                isActive
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 shadow-lg shadow-orange-500/50" />
              )}
            </button>
          )
        })}
      </div>

      {/* Video Grid - Enhanced */}
      {displayVideos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2.5 px-6 pb-20 pt-4">
          {displayVideos.map((video, index) => (
            <div
              key={video.id}
              onClick={() => router.push(`/?videoId=${video.id}`)}
              className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-xl border border-white/5 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:border-white/10 active:scale-[0.98]"
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

              {/* Hover Overlay with blur */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 transition-all duration-200 group-hover:opacity-100">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                  <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
                </div>
              </div>

              {/* View Count - Enhanced */}
              <div className="absolute bottom-2 left-2 rounded-lg bg-black/70 backdrop-blur-md px-2 py-1 text-xs font-semibold text-white border border-white/10">
                {(video.views || 0) >= 1000 ? `${((video.views || 0) / 1000).toFixed(1)}K` : video.views || 0}
              </div>

              {/* Duration - Enhanced */}
              <div className="absolute top-2 right-2 rounded-lg bg-black/70 backdrop-blur-md px-2 py-1 text-xs font-semibold text-white border border-white/10">
                {video.duration || "0:10"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State - Enhanced
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-xl opacity-20" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-xl">
              <Play className="h-12 w-12 text-gray-500" />
            </div>
          </div>
          <h3 className="mb-2 text-xl font-bold text-white">No videos yet</h3>
          <p className="mb-6 text-sm text-gray-400 max-w-xs">Start creating amazing videos and build your collection!</p>
          <button className="rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 px-8 py-3.5 font-bold text-white shadow-2xl shadow-orange-500/40 transition-all hover:scale-105 hover:shadow-orange-500/60 active:scale-95">
            Create your first video
          </button>
        </div>
      )}
    </div>
  )
}
