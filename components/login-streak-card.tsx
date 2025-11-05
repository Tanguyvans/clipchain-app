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
      <div className="rounded-lg border border-gray-800 bg-[#1A1A1A] py-4 px-4 animate-pulse">
        <div className="h-20 bg-gray-800 rounded"></div>
      </div>
    )
  }

  const progressPercentage = ((7 - daysUntilReward) / 7) * 100

  return (
    <>
      {/* Reward Animation */}
      {showRewardAnimation && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-lg font-semibold flex items-center gap-2">
            <Flame className="h-5 w-5 animate-pulse" />
            <span>🎉 {loginStreak}-Day Streak! Free Video Unlocked!</span>
          </div>
        </div>
      )}

      {/* Login Streak Card */}
      <div className="rounded-lg border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="py-3 px-4 border-b border-orange-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Daily Login Streak</h3>
                <p className="text-xs text-gray-400">Keep it going!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {loginStreak}
              </div>
              <div className="text-xs text-gray-400">days</div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="py-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-300">
              {daysUntilReward === 0 ? "🎁 Reward ready!" : `${daysUntilReward} days until free video`}
            </span>
            <span className="text-xs text-orange-400 font-semibold">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Milestone Dots */}
          <div className="flex justify-between mt-1 px-0.5">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  i < (7 - daysUntilReward)
                    ? "bg-gradient-to-r from-orange-500 to-red-500 scale-125"
                    : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-2 px-4 bg-black/20 border-t border-orange-500/10">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-gray-400">Best streak:</span>
              <span className="font-semibold text-white">{longestStreak} days</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gift className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-gray-400">Earned:</span>
              <span className="font-semibold text-white">{freeVideosEarned} free videos</span>
            </div>
          </div>
        </div>

        {/* Continue Streak Button */}
        {daysUntilReward < 7 && daysUntilReward > 0 && (
          <div className="py-3 px-4 border-t border-orange-500/10">
            <button
              onClick={() => {
                // This button is informational - the streak is already being tracked
                // Could navigate to generation page or show a tooltip
              }}
              className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-2.5 px-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <Flame className="h-4 w-4" />
                Come back tomorrow to continue your streak!
              </span>
            </button>
          </div>
        )}

        {daysUntilReward === 0 && (
          <div className="py-3 px-4 border-t border-orange-500/10">
            <div className="rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 py-2.5 px-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Gift className="h-4 w-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">
                  Free video ready! Generate now to claim!
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
