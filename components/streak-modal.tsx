"use client"

import { X, Flame, Zap, Calendar, Trophy, Info } from "lucide-react"

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
  lastActivityDate,
}: StreakModalProps) {
  if (!isOpen) return null

  // Calculate if user was active this week
  const wasActiveThisWeek = lastActivityDate
    ? isThisWeek(new Date(lastActivityDate))
    : false

  // Get days of current week (Mon-Sun)
  const weekDays = getWeekDays()
  const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.

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
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
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

          {/* This Week Activity */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-white">This Week</h3>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => {
                const dayNum = (index + 1) % 7 // Convert to JS day (0=Sun)
                const isPast = dayNum < today || (today === 0 && dayNum !== 0)
                const isToday = dayNum === today
                const isActive = wasActiveThisWeek && (isPast || isToday)

                return (
                  <div key={day} className="text-center">
                    <div className="text-xs text-gray-500 mb-2">{day}</div>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto transition-all ${
                        isActive
                          ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50"
                          : isToday
                          ? "bg-gray-700 border-2 border-orange-500 text-gray-300"
                          : isPast
                          ? "bg-gray-800 text-gray-600"
                          : "bg-gray-800/50 text-gray-600"
                      }`}
                    >
                      {isActive ? "✓" : ""}
                    </div>
                  </div>
                )
              })}
            </div>
            {wasActiveThisWeek ? (
              <div className="mt-4 text-center">
                <p className="text-sm text-green-400">✓ Active this week! Keep it up!</p>
              </div>
            ) : (
              <div className="mt-4 text-center">
                <p className="text-sm text-orange-400">⚡ Generate a video this week to continue your streak</p>
              </div>
            )}
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-3">
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
                {wasActiveThisWeek
                  ? "Come back next week to keep your streak alive!"
                  : "Generate a video this week to continue!"}
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
            {freeGenerations > 0 ? `Use ${freeGenerations} Free Generation${freeGenerations > 1 ? 's' : ''}` : 'Got it!'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper function to check if a date is in the current week (Monday-Sunday)
function isThisWeek(date: Date): boolean {
  const now = new Date()
  const weekStart = getMonday(now)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return date >= weekStart && date <= weekEnd
}

// Get Monday of the current week
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

// Get week day labels
function getWeekDays(): string[] {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
}
