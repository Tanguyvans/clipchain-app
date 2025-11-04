"use client"

import { Loader2, RefreshCw, Trophy, TrendingUp } from "lucide-react"
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

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
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const getMedalIcon = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="relative">
          <Trophy className="h-7 w-7 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
          <div className="absolute -top-1 -right-1 text-xs">👑</div>
        </div>
      )
    }
    if (rank === 2) {
      return <Trophy className="h-6 w-6 text-gray-300 fill-gray-300 drop-shadow-[0_0_6px_rgba(209,213,219,0.4)]" />
    }
    if (rank === 3) {
      return <Trophy className="h-6 w-6 text-amber-600 fill-amber-600 drop-shadow-[0_0_6px_rgba(217,119,6,0.4)]" />
    }
    return <span className="text-lg font-bold text-gray-500">#{rank}</span>
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getCardGradient = (rank: number) => {
    if (rank === 1) return "from-yellow-500/20 via-orange-500/10 to-transparent"
    if (rank === 2) return "from-gray-400/15 via-gray-500/8 to-transparent"
    if (rank === 3) return "from-amber-600/15 via-amber-700/8 to-transparent"
    return "from-gray-800/30 to-transparent"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#0F0511] to-[#0A0A0A] flex items-center justify-center pb-24">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
            <div className="absolute inset-0 h-12 w-12 animate-ping text-purple-500/20">
              <Loader2 className="h-12 w-12" />
            </div>
          </div>
          <p className="text-white text-sm font-medium">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#0F0511] to-[#0A0A0A] flex items-center justify-center pb-24 px-6">
        <div className="text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={() => fetchLeaderboard()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#0F0511] to-[#0A0A0A] pb-24 overflow-y-auto">
      {/* Header */}
      <div className="relative px-6 pt-8 pb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-8 w-8 text-yellow-400 fill-yellow-400" />
              <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
            </div>
            <p className="text-gray-400">Top creators by videos generated</p>
          </div>
          <button
            onClick={() => fetchLeaderboard(true)}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3 px-6">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="text-6xl opacity-50">🎬</div>
            <p className="text-gray-400 font-medium">No videos generated yet</p>
            <p className="text-sm text-gray-500">Be the first to create!</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <div
              key={entry.rank}
              className={`
                group relative flex items-center gap-4 rounded-xl border p-4 transition-all duration-300
                hover:scale-[1.02] hover:shadow-xl
                ${entry.rank <= 3
                  ? 'border-gray-700/50 bg-gradient-to-r ' + getCardGradient(entry.rank)
                  : 'border-gray-800 bg-gradient-to-r from-[#1A1A1A] to-[#141414]'
                }
              `}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: 'fadeSlideIn 0.4s ease-out forwards',
                opacity: 0
              }}
            >
              {entry.rank <= 3 && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}

              {/* Rank Badge with Medal */}
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 group-hover:border-gray-600 transition-colors">
                {getMedalIcon(entry.rank)}
              </div>

              {/* Avatar */}
              <div className="relative">
                <img
                  src={entry.avatar}
                  alt={entry.username}
                  className={`h-16 w-16 flex-shrink-0 rounded-full border-2 transition-all duration-300
                    ${entry.rank === 1 ? 'border-yellow-400/50 group-hover:border-yellow-400' : ''}
                    ${entry.rank === 2 ? 'border-gray-300/50 group-hover:border-gray-300' : ''}
                    ${entry.rank === 3 ? 'border-amber-600/50 group-hover:border-amber-600' : ''}
                    ${entry.rank > 3 ? 'border-gray-700 group-hover:border-gray-600' : ''}
                  `}
                />
                {entry.rank <= 3 && (
                  <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 border border-gray-700">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate text-lg">
                  {entry.displayName || entry.username}
                </p>
                <p className="text-sm text-gray-400">@{entry.username}</p>
                {(entry.likes > 0 || entry.recasts > 0) && (
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    {entry.likes > 0 && <span>❤️ {formatNumber(entry.likes)}</span>}
                    {entry.recasts > 0 && <span>🔄 {formatNumber(entry.recasts)}</span>}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="text-right flex-shrink-0">
                <p className={`text-3xl font-bold transition-colors
                  ${entry.rank === 1 ? 'text-yellow-400' : ''}
                  ${entry.rank === 2 ? 'text-gray-300' : ''}
                  ${entry.rank === 3 ? 'text-amber-600' : ''}
                  ${entry.rank > 3 ? 'text-orange-500' : ''}
                `}>
                  {entry.casts}
                </p>
                <p className="text-xs text-gray-400 font-medium">videos</p>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
