"use client"

import { useState, useEffect } from "react"
import { Trophy, Crown, RefreshCw, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface LeaderboardUser {
  rank: number
  username: string
  fid?: number
  avatar: string
  votes?: number
  likes?: number
  recasts?: number
  videos?: number
  casts?: number
  trend?: "up" | "down" | "same"
  displayName?: string
  castUrls?: string[]
}



export function Leaderboard() {
  const [trendingLeaders, setTrendingLeaders] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch trending users from Neynar API
  const fetchTrendingLeaders = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/leaderboard")
      const data = await response.json()

      if (data.success && data.leaderboard) {
        setTrendingLeaders(data.leaderboard)
      } else {
        setError(data.error || "Failed to fetch leaderboard")
      }
    } catch (err) {
      console.error("Error fetching trending leaders:", err)
      setError("Failed to fetch leaderboard data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Fetch on mount
    fetchTrendingLeaders()
  }, [])

  const formatCount = (count?: number) => {
    if (!count) return "0"
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }


  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500" />
    if (rank === 2) return <Trophy className="h-5 w-5 text-slate-400 fill-slate-400" />
    if (rank === 3) return <Trophy className="h-5 w-5 text-amber-700 fill-amber-700" />
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
  }

  const renderLeaderboardList = (leaders: LeaderboardUser[]) => (
    <div className="space-y-2">
      {leaders.map((user) => (
        <div
          key={user.fid || user.username}
          className={`flex items-center gap-4 rounded-xl p-4 transition-colors ${
            user.rank <= 3 ? "bg-gradient-to-r from-primary/5 to-transparent" : "bg-muted/30"
          }`}
        >
          {/* Rank */}
          <div className="flex w-10 items-center justify-center">{getRankBadge(user.rank)}</div>

          {/* Avatar */}
          <Avatar className={`h-12 w-12 ${user.rank <= 3 ? "ring-2 ring-primary/50" : ""}`}>
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">@{user.username}</p>
              {user.trend && (
                <span
                  className={`text-xs ${
                    user.trend === "up"
                      ? "text-green-500"
                      : user.trend === "down"
                        ? "text-red-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {user.trend === "up" ? "↑" : user.trend === "down" ? "↓" : "−"}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {user.casts || user.videos || 0} {user.casts ? "casts" : "videos"}
            </p>
            {user.castUrls && user.castUrls.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {user.castUrls.slice(0, 3).map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Cast {idx + 1}
                  </a>
                ))}
                {user.castUrls.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{user.castUrls.length - 3} more</span>
                )}
              </div>
            )}
          </div>

          {/* Recasts/Engagement */}
          <div className="text-right">
            <p className={`text-lg font-bold ${user.rank <= 3 ? "text-primary" : "text-foreground"}`}>
              {formatCount(user.recasts || user.votes || 0)}
            </p>
            <p className="text-xs text-muted-foreground">recasts</p>
            {user.likes && user.likes > 0 && (
              <p className="text-xs text-muted-foreground mt-1">{formatCount(user.likes)} likes</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Trophy className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground text-balance">Leaderboard</h1>
            <p className="text-sm text-muted-foreground text-balance">Top creators by recasts</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading trending creators from Farcaster...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button onClick={fetchTrendingLeaders} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : trendingLeaders.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Live data from Farcaster via Neynar API
              </p>
              <Button onClick={fetchTrendingLeaders} variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {renderLeaderboardList(trendingLeaders)}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No trending data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
