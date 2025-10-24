"use client"

import { CheckCircle2, ArrowRight } from "lucide-react"
import { useState } from "react"
import type { LeaderboardEntry } from "@/types/clipchain"

export function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState("This Week")
  const [category, setCategory] = useState("Spenders")

  const timeFilters = ["Today", "This Week", "This Month", "All Time"]
  const categories = [
    { emoji: "🎬", label: "Videos" },
    { emoji: "👥", label: "Creators" },
    { emoji: "💰", label: "Spenders" },
  ]

  const topThree: LeaderboardEntry[] = [
    {
      rank: 1,
      username: "symbiotech",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=symbiotech",
      stat: "$1.63",
      subStat: "13 gens",
      verified: true,
    },
    {
      rank: 2,
      username: "cryptoartist",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=cryptoartist",
      stat: "$1.42",
      subStat: "11 gens",
      verified: true,
    },
    {
      rank: 3,
      username: "aimaster",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aimaster",
      stat: "$1.28",
      subStat: "10 gens",
      verified: false,
    },
  ]

  const rankedList: LeaderboardEntry[] = [
    {
      rank: 4,
      username: "mxjxn",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mxjxn",
      stat: "$1.13",
      subStat: "9 gens",
      trend: "↑ 12%",
    },
    {
      rank: 5,
      username: "neonwave",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=neonwave",
      stat: "$0.98",
      subStat: "8 gens",
      trend: "↑ 8%",
    },
    {
      rank: 6,
      username: "pixelwizard",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pixelwizard",
      stat: "$0.85",
      subStat: "7 gens",
      trend: "↓ 3%",
    },
    {
      rank: 7,
      username: "dreamforge",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dreamforge",
      stat: "$0.72",
      subStat: "6 gens",
      trend: "↑ 15%",
    },
    {
      rank: 8,
      username: "visiondev",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=visiondev",
      stat: "$0.61",
      subStat: "5 gens",
      trend: "↑ 5%",
    },
    {
      rank: 9,
      username: "artsynth",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=artsynth",
      stat: "$0.54",
      subStat: "4 gens",
      trend: "↓ 2%",
    },
    {
      rank: 10,
      username: "cybercreator",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=cybercreator",
      stat: "$0.48",
      subStat: "4 gens",
      trend: "↑ 10%",
    },
  ]

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "👑"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return null
  }

  const getBorderColor = (rank: number) => {
    if (rank === 1) return "border-yellow-400 shadow-lg shadow-yellow-500/50"
    if (rank === 2) return "border-gray-300 shadow-lg shadow-gray-300/50"
    if (rank === 3) return "border-orange-700 shadow-lg shadow-orange-700/50"
    return ""
  }

  const getAvatarSize = (rank: number) => {
    if (rank === 1) return "h-20 w-20"
    return "h-16 w-16"
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24 overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="mb-2 text-3xl font-bold text-white">🏆 Leaderboard</h1>
        <p className="text-gray-400">Top creators this week</p>
      </div>

      {/* Time Filters */}
      <div className="flex gap-2 overflow-x-auto px-6 pb-4 scrollbar-hide">
        {timeFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-semibold transition-all ${
              timeFilter === filter
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                : "bg-[#1A1A1A] text-gray-400 hover:text-gray-300"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-3 px-6 pb-6">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setCategory(cat.label)}
            className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
              category === cat.label
                ? "bg-[#1A1A1A] text-white"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 px-6 pb-8">
        {/* #2 - Left */}
        <div className="flex flex-col items-center">
          <div className="mb-2 text-3xl">{getMedalEmoji(2)}</div>
          <img
            src={topThree[1].avatar}
            alt={topThree[1].username}
            className={`${getAvatarSize(2)} rounded-full border-4 ${getBorderColor(2)} mb-2`}
          />
          <p className="mb-1 text-sm font-bold text-white">{topThree[1].username}</p>
          <p className="mb-0.5 font-bold text-orange-500">{topThree[1].stat}</p>
          <p className="text-xs text-gray-400">{topThree[1].subStat}</p>
        </div>

        {/* #1 - Center (Elevated) */}
        <div className="flex flex-col items-center -mt-4">
          <div className="mb-2 text-4xl">{getMedalEmoji(1)}</div>
          <img
            src={topThree[0].avatar}
            alt={topThree[0].username}
            className={`${getAvatarSize(1)} rounded-full border-4 ${getBorderColor(1)} mb-2`}
          />
          <div className="mb-1 flex items-center gap-1">
            <p className="text-sm font-bold text-white">{topThree[0].username}</p>
            {topThree[0].verified && (
              <CheckCircle2 className="h-4 w-4 fill-purple-500 text-white" />
            )}
          </div>
          <p className="mb-0.5 text-lg font-bold text-orange-500">{topThree[0].stat}</p>
          <p className="text-xs text-gray-400">{topThree[0].subStat}</p>
        </div>

        {/* #3 - Right */}
        <div className="flex flex-col items-center">
          <div className="mb-2 text-3xl">{getMedalEmoji(3)}</div>
          <img
            src={topThree[2].avatar}
            alt={topThree[2].username}
            className={`${getAvatarSize(3)} rounded-full border-4 ${getBorderColor(3)} mb-2`}
          />
          <p className="mb-1 text-sm font-bold text-white">{topThree[2].username}</p>
          <p className="mb-0.5 font-bold text-orange-500">{topThree[2].stat}</p>
          <p className="text-xs text-gray-400">{topThree[2].subStat}</p>
        </div>
      </div>

      {/* Ranked List */}
      <div className="space-y-3 px-6">
        {rankedList.map((entry) => (
          <div
            key={entry.rank}
            className="flex items-center gap-4 rounded-xl border border-gray-800 bg-[#1A1A1A] p-4"
          >
            {/* Rank Badge */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
              <span className="text-lg font-bold text-gray-400">#{entry.rank}</span>
            </div>

            {/* Avatar */}
            <img
              src={entry.avatar}
              alt={entry.username}
              className="h-12 w-12 rounded-full"
            />

            {/* Info */}
            <div className="flex-1">
              <p className="font-semibold text-white">{entry.username}</p>
              <p className="text-sm text-gray-400">{entry.subStat}</p>
            </div>

            {/* Stats */}
            <div className="text-right">
              <p className="text-xl font-bold text-white">{entry.stat}</p>
              {entry.trend && (
                <p
                  className={`text-xs ${
                    entry.trend.startsWith("↑") ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {entry.trend}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Your Rank Sticky Footer */}
      <div className="fixed bottom-20 left-4 right-4 z-10 rounded-xl border border-purple-500/30 bg-[#1A1A1A]/95 p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Your Rank</p>
            <p className="text-xl font-bold text-white">#42</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-400">$0.05</p>
              <p className="text-xs text-gray-500">1 gen</p>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
              <ArrowRight className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
