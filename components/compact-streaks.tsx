"use client"

import { useState, useEffect } from "react"
import { Flame, TrendingUp } from "lucide-react"

interface CompactStreaksProps {
  userFid?: number
  videoCount?: number
}

export function CompactStreaks({ userFid, videoCount = 0 }: CompactStreaksProps) {
  const [loginStreak, setLoginStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch login streak data
  useEffect(() => {
    const fetchStreakData = async () => {
      if (!userFid) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/user/login-streak?fid=${userFid}`)
        const data = await response.json()

        if (data.success) {
          setLoginStreak(data.loginStreak || 0)
        }
      } catch (error) {
        console.error("Error fetching login streak:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStreakData()
  }, [userFid])

  if (loading) {
    return null // Or a very minimal skeleton
  }

  const loginDaysRemaining = 7 - (loginStreak % 7)
  const videoRemaining = 10 - (videoCount % 10)

  return (
    <div className="rounded-lg border border-gray-800 bg-[#1A1A1A] py-2 px-3">
      <div className="flex items-center justify-between gap-4">
        {/* Login Streak */}
        <div className="flex items-center gap-2 flex-1">
          <Flame className="h-4 w-4 text-orange-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold text-white">{loginStreak}</span>
              <span className="text-xs text-gray-400">day streak</span>
            </div>
            <div className="text-xs text-gray-500">+1 free at {loginStreak + loginDaysRemaining}</div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-700 flex-shrink-0" />

        {/* Video Count */}
        <div className="flex items-center gap-2 flex-1">
          <TrendingUp className="h-4 w-4 text-purple-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold text-white">{videoCount}</span>
              <span className="text-xs text-gray-400">videos</span>
            </div>
            <div className="text-xs text-gray-500">+1 free at {videoCount + videoRemaining}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
