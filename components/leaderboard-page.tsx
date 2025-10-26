"use client"

import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

interface LeaderboardEntry {
  rank: number
  username: string
  fid: number
  avatar: string
  likes: number
  recasts: number
  casts: number
  displayName?: string
}

export function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        console.log('🏆 Fetching leaderboard...')
        const response = await fetch('/api/leaderboard')
        const data = await response.json()

        console.log('🏆 Leaderboard response:', data)

        if (data.success) {
          console.log(`✅ Got ${data.leaderboard.length} users in leaderboard`)
          setLeaderboard(data.leaderboard)
        } else {
          console.error('❌ Leaderboard error:', data.error)
          setError(data.error || 'Failed to load leaderboard')
        }
      } catch (err) {
        console.error('❌ Error fetching leaderboard:', err)
        setError('Failed to load leaderboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "👑"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center pb-24">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          <p className="text-white text-sm">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center pb-24 px-6">
        <div className="text-center">
          <p className="text-red-500 mb-2">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-purple-500 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24 overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="mb-2 text-3xl font-bold text-white">🏆 Leaderboard</h1>
        <p className="text-gray-400">Top creators by videos generated</p>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3 px-6">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No videos generated yet</p>
            <p className="text-sm text-gray-500 mt-2">Be the first to create!</p>
          </div>
        ) : (
          leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-[#1A1A1A] p-4"
            >
              {/* Rank Badge with Medal */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-800">
                {entry.rank <= 3 ? (
                  <span className="text-2xl">{getMedalEmoji(entry.rank)}</span>
                ) : (
                  <span className="text-lg font-bold text-gray-400">#{entry.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <img
                src={entry.avatar}
                alt={entry.username}
                className="h-14 w-14 flex-shrink-0 rounded-full border-2 border-gray-700"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">
                  {entry.displayName || entry.username}
                </p>
                <p className="text-sm text-gray-400">@{entry.username}</p>
              </div>

              {/* Stats */}
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-orange-500">{entry.casts}</p>
                <p className="text-xs text-gray-400">videos</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
