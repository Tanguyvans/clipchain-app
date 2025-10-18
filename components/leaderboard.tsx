"use client"

import { useState } from "react"
import { Trophy, TrendingUp, Clock, Crown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LeaderboardUser {
  rank: number
  username: string
  avatar: string
  votes: number
  videos: number
  trend?: "up" | "down" | "same"
}

const allTimeLeaders: LeaderboardUser[] = [
  { rank: 1, username: "tech_guru", avatar: "/tech-person-avatar.png", votes: 67800, videos: 45 },
  { rank: 2, username: "dance_queen", avatar: "/dancer-avatar.png", votes: 45200, videos: 89 },
  { rank: 3, username: "food_lover", avatar: "/chef-avatar.png", votes: 28900, videos: 67 },
  { rank: 4, username: "creative_alex", avatar: "/diverse-user-avatars.png", votes: 12400, videos: 34 },
  { rank: 5, username: "fitness_pro", avatar: "/placeholder.svg?height=40&width=40", votes: 9800, videos: 56 },
  { rank: 6, username: "music_maker", avatar: "/placeholder.svg?height=40&width=40", votes: 8500, videos: 78 },
  { rank: 7, username: "art_wizard", avatar: "/placeholder.svg?height=40&width=40", votes: 7200, videos: 23 },
  { rank: 8, username: "travel_bug", avatar: "/placeholder.svg?height=40&width=40", votes: 6900, videos: 41 },
]

const weeklyLeaders: LeaderboardUser[] = [
  { rank: 1, username: "dance_queen", avatar: "/dancer-avatar.png", votes: 8900, videos: 12, trend: "up" },
  { rank: 2, username: "tech_guru", avatar: "/tech-person-avatar.png", votes: 7600, videos: 8, trend: "same" },
  {
    rank: 3,
    username: "fitness_pro",
    avatar: "/placeholder.svg?height=40&width=40",
    votes: 5400,
    videos: 15,
    trend: "up",
  },
  { rank: 4, username: "food_lover", avatar: "/chef-avatar.png", votes: 4200, videos: 9, trend: "down" },
  {
    rank: 5,
    username: "music_maker",
    avatar: "/placeholder.svg?height=40&width=40",
    votes: 3800,
    videos: 11,
    trend: "up",
  },
  { rank: 6, username: "creative_alex", avatar: "/diverse-user-avatars.png", votes: 2900, videos: 6, trend: "same" },
  {
    rank: 7,
    username: "travel_bug",
    avatar: "/placeholder.svg?height=40&width=40",
    votes: 2100,
    videos: 7,
    trend: "down",
  },
  {
    rank: 8,
    username: "art_wizard",
    avatar: "/placeholder.svg?height=40&width=40",
    votes: 1800,
    videos: 4,
    trend: "up",
  },
]

const trendingLeaders: LeaderboardUser[] = [
  {
    rank: 1,
    username: "fitness_pro",
    avatar: "/placeholder.svg?height=40&width=40",
    votes: 1200,
    videos: 3,
    trend: "up",
  },
  { rank: 2, username: "dance_queen", avatar: "/dancer-avatar.png", votes: 980, videos: 2, trend: "up" },
  {
    rank: 3,
    username: "music_maker",
    avatar: "/placeholder.svg?height=40&width=40",
    votes: 850,
    videos: 4,
    trend: "up",
  },
  { rank: 4, username: "tech_guru", avatar: "/tech-person-avatar.png", votes: 720, videos: 1, trend: "same" },
  {
    rank: 5,
    username: "art_wizard",
    avatar: "/placeholder.svg?height=40&width=40",
    votes: 650,
    videos: 2,
    trend: "up",
  },
  { rank: 6, username: "food_lover", avatar: "/chef-avatar.png", votes: 540, videos: 1, trend: "down" },
  {
    rank: 7,
    username: "travel_bug",
    avatar: "/placeholder.svg?height=40&width=40",
    votes: 420,
    videos: 2,
    trend: "up",
  },
  { rank: 8, username: "creative_alex", avatar: "/diverse-user-avatars.png", votes: 380, videos: 1, trend: "same" },
]

export function Leaderboard() {
  const [activeTab, setActiveTab] = useState("alltime")

  const formatCount = (count: number) => {
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
          key={user.username}
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
            <p className="text-sm text-muted-foreground">{user.videos} videos</p>
          </div>

          {/* Votes */}
          <div className="text-right">
            <p className={`text-lg font-bold ${user.rank <= 3 ? "text-primary" : "text-foreground"}`}>
              {formatCount(user.votes)}
            </p>
            <p className="text-xs text-muted-foreground">votes</p>
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
            <p className="text-sm text-muted-foreground text-balance">Top creators by votes</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="alltime" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">All Time</span>
              <span className="sm:hidden">All</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="gap-2">
              <Clock className="h-4 w-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trending</span>
              <span className="sm:hidden">Today</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alltime" className="mt-0">
            {renderLeaderboardList(allTimeLeaders)}
          </TabsContent>

          <TabsContent value="weekly" className="mt-0">
            {renderLeaderboardList(weeklyLeaders)}
          </TabsContent>

          <TabsContent value="trending" className="mt-0">
            {renderLeaderboardList(trendingLeaders)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
