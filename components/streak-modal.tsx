"use client"

import { X, Flame, Zap, Trophy, Info } from "lucide-react"

interface StreakModalProps {
  isOpen: boolean
  onClose: () => void
  currentStreak: number
  longestStreak: number
  freeGenerations: number
  lastActivityDate: string | null
}

export function StreakModal({
  isOpen,
  onClose,
  currentStreak,
  longestStreak,
  freeGenerations,
}: StreakModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Bottom Sheet */}
      <div className="w-full max-w-lg bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] rounded-t-3xl border-t border-x border-purple-500/20 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Your Streak</h2>
              <p className="text-sm text-gray-400">Keep generating to earn rewards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Stats */}
          <div className="grid grid-cols-3 gap-4">
            {/* Current Streak */}
            <div className="bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-2xl p-4 text-center">
              <Flame className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-orange-400">{currentStreak}</div>
              <div className="text-xs text-gray-400 mt-1">
                {currentStreak === 1 ? "week" : "weeks"}
              </div>
            </div>

            {/* Free Generations */}
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4 text-center">
              <Zap className="h-8 w-8 text-yellow-400 fill-yellow-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-yellow-400">{freeGenerations}</div>
              <div className="text-xs text-gray-400 mt-1">free</div>
            </div>

            {/* Longest Streak */}
            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-4 text-center">
              <Trophy className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-purple-400">{longestStreak}</div>
              <div className="text-xs text-gray-400 mt-1">best</div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 shrink-0">
                <Info className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">How Streaks Work</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 shrink-0">🔥</span>
                    <span>Generate at least 1 video per week to maintain your streak</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 shrink-0">⚡</span>
                    <span>Earn 1 free generation each week you stay active</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 shrink-0">💎</span>
                    <span>Save up to 3 free generations (max)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 shrink-0">🏆</span>
                    <span>Your longest streak is saved forever!</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Motivational Message */}
          {currentStreak > 0 && (
            <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-2xl p-5 text-center">
              <p className="text-lg font-semibold text-white mb-2">
                {currentStreak === 1 && "Great start! 🎉"}
                {currentStreak === 2 && "2 weeks strong! 💪"}
                {currentStreak === 3 && "3 week streak! 🔥"}
                {currentStreak >= 4 && currentStreak < 8 && "On fire! 🚀"}
                {currentStreak >= 8 && "Legendary! 👑"}
              </p>
              <p className="text-sm text-gray-400">
                Keep generating to maintain your streak!
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold shadow-xl shadow-orange-500/30 transition-all active:scale-95"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
