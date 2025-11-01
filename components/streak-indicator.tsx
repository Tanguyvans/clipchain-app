"use client"

import { Flame, Zap } from "lucide-react"

interface StreakIndicatorProps {
  currentStreak: number
  freeGenerations: number
  compact?: boolean
}

export function StreakIndicator({ currentStreak, freeGenerations, compact = false }: StreakIndicatorProps) {
  // Get streak emoji based on level
  const getStreakEmoji = (streak: number) => {
    if (streak >= 4) return "🔥"
    if (streak === 3) return "3️⃣"
    if (streak === 2) return "2️⃣"
    if (streak === 1) return "1️⃣"
    return "✨"
  }

  // Get streak color
  const getStreakColor = (streak: number) => {
    if (streak >= 4) return "text-orange-500"
    if (streak === 3) return "text-purple-500"
    if (streak === 2) return "text-blue-500"
    if (streak === 1) return "text-green-500"
    return "text-gray-500"
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* Streak indicator */}
        {currentStreak > 0 && (
          <div className="flex items-center gap-1">
            <Flame className={`h-4 w-4 ${getStreakColor(currentStreak)}`} />
            <span className={`text-sm font-semibold ${getStreakColor(currentStreak)}`}>
              {currentStreak}
            </span>
          </div>
        )}

        {/* Free generations */}
        {freeGenerations > 0 && (
          <div className="flex items-center gap-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-2 py-1 rounded-full">
            <Zap className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold text-white">{freeGenerations}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
      {/* Streak Section */}
      <div className="flex flex-col items-center gap-1 flex-1">
        <div className="text-2xl">{getStreakEmoji(currentStreak)}</div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${getStreakColor(currentStreak)}`}>
            {currentStreak}
          </div>
          <div className="text-xs text-gray-400">
            {currentStreak === 1 ? "week" : "weeks"}
          </div>
        </div>
      </div>

      <div className="h-12 w-px bg-white/10" />

      {/* Free Generations Section */}
      <div className="flex flex-col items-center gap-1 flex-1">
        <Zap className="h-6 w-6 text-yellow-400 fill-yellow-400" />
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {freeGenerations}
          </div>
          <div className="text-xs text-gray-400">
            free {freeGenerations === 1 ? "video" : "videos"}
          </div>
        </div>
      </div>
    </div>
  )
}

// Small badge version for top navigation
export function StreakBadge({ currentStreak, freeGenerations }: StreakIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {currentStreak > 0 && (
        <div className="flex items-center gap-0.5 bg-orange-500/20 px-2 py-0.5 rounded-full">
          <Flame className="h-3 w-3 text-orange-400" />
          <span className="text-xs font-semibold text-orange-400">{currentStreak}</span>
        </div>
      )}
      {freeGenerations > 0 && (
        <div className="flex items-center gap-0.5 bg-yellow-500/20 px-2 py-0.5 rounded-full">
          <Zap className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-semibold text-yellow-400">{freeGenerations}</span>
        </div>
      )}
    </div>
  )
}
