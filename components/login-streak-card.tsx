"use client"

import { useState, useEffect } from "react"
import { Flame, Gift, TrendingUp } from "lucide-react"

interface LoginStreakCardProps {
  userFid?: number
  onRewardClaimed?: () => void
}

export function LoginStreakCard({ userFid, onRewardClaimed }: LoginStreakCardProps) {
  const [loginStreak, setLoginStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [daysUntilReward, setDaysUntilReward] = useState(7)
  const [freeVideosEarned, setFreeVideosEarned] = useState(0)
  const [showRewardAnimation, setShowRewardAnimation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [buttonDismissed, setButtonDismissed] = useState(false)

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
          setLongestStreak(data.longestLoginStreak || 0)
          setDaysUntilReward(data.daysUntilReward || 7)
          setFreeVideosEarned(data.freeVideosFromLogin || 0)
        }
      } catch (error) {
        console.error("Error fetching login streak:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStreakData()
  }, [userFid])

  // Record login on mount (only once per day)
  useEffect(() => {
    const recordLogin = async () => {
      if (!userFid) return

      try {
        const response = await fetch("/api/user/login-streak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fid: userFid }),
        })

        const data = await response.json()

        if (data.success) {
          setLoginStreak(data.loginStreak || 0)
          setLongestStreak(data.longestLoginStreak || 0)
          setDaysUntilReward(data.daysUntilReward || 7)

          // Show reward animation if free video was awarded
          if (data.freeVideoAwarded) {
            setShowRewardAnimation(true)
            setFreeVideosEarned(prev => prev + 1)
            setTimeout(() => setShowRewardAnimation(false), 3000)
            onRewardClaimed?.()
          }
        }
      } catch (error) {
        console.error("Error recording login:", error)
      }
    }

    recordLogin()
  }, [userFid, onRewardClaimed])

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-800 bg-[#1A1A1A] py-2 px-3 animate-pulse">
        <div className="h-12 bg-gray-800 rounded"></div>
      </div>
    )
  }

  const progressPercentage = ((7 - daysUntilReward) / 7) * 100

  return (
    <>
      {/* Reward Animation */}
      {showRewardAnimation && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold flex items-center gap-2 text-sm">
            <Flame className="h-4 w-4 animate-pulse" />
            <span>🎉 {loginStreak}-Day Streak! Free Video!</span>
          </div>
        </div>
      )}

      {/* Login Streak Card - Compact */}
      <div className="rounded-lg border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm overflow-hidden">
        {/* Compact Header with Progress */}
        <div className="py-2 px-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  {loginStreak}
                </span>
                <span className="text-xs text-gray-400">day streak</span>
              </div>
            </div>
            <div className="text-right flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-orange-400" />
                <span className="text-gray-400">Best:</span>
                <span className="font-semibold text-white">{longestStreak}</span>
              </div>
              <div className="h-3 w-px bg-gray-600" />
              <div className="flex items-center gap-1">
                <Gift className="h-3 w-3 text-orange-400" />
                <span className="font-semibold text-white">{freeVideosEarned}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">
                {daysUntilReward === 0 ? "🎁 Reward ready!" : `${daysUntilReward} more days`}
              </span>
              <span className="text-xs text-orange-400 font-semibold">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Continue Streak Button - Shows once and disappears after click */}
        {!buttonDismissed && daysUntilReward < 7 && daysUntilReward > 0 && (
          <div className="px-3 pb-2">
            <button
              onClick={() => {
                setButtonDismissed(true)
              }}
              className="w-full rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 py-1.5 px-3 text-xs font-semibold text-orange-300 transition-all hover:bg-orange-500/30 active:scale-95"
            >
              <span className="flex items-center justify-center gap-1.5">
                <Flame className="h-3.5 w-3.5" />
                Continue tomorrow!
              </span>
            </button>
          </div>
        )}

        {daysUntilReward === 0 && (
          <div className="px-3 pb-2">
            <div className="rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 py-1.5 px-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-green-400" />
                <span className="text-xs font-semibold text-green-400">
                  Free video ready!
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
