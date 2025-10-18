"use client"

import { useState } from "react"
import { Flame, Coins, Gift, Calendar, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DayReward {
  day: number
  credits: number
  claimed: boolean
  isToday: boolean
}

export function StreakRewards() {
  const [currentStreak, setCurrentStreak] = useState(5)
  const [totalCredits, setTotalCredits] = useState(850)
  const [canClaim, setCanClaim] = useState(true)

  const weekRewards: DayReward[] = [
    { day: 1, credits: 10, claimed: true, isToday: false },
    { day: 2, credits: 15, claimed: true, isToday: false },
    { day: 3, credits: 20, claimed: true, isToday: false },
    { day: 4, credits: 25, claimed: true, isToday: false },
    { day: 5, credits: 30, claimed: true, isToday: false },
    { day: 6, credits: 40, claimed: false, isToday: true },
    { day: 7, credits: 100, claimed: false, isToday: false },
  ]

  const handleClaimReward = () => {
    if (!canClaim) return

    const todayReward = weekRewards.find((r) => r.isToday)
    if (todayReward) {
      setTotalCredits((prev) => prev + todayReward.credits)
      setCurrentStreak((prev) => prev + 1)
      setCanClaim(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Streak Info */}
      <div className="bg-gradient-to-br from-orange-500/20 via-red-500/10 to-transparent px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500">
              <Flame className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground text-balance">Daily Streak</h1>
              <p className="text-sm text-muted-foreground text-balance">Keep your streak alive!</p>
            </div>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Current Streak</p>
              <p className="text-4xl font-bold">{currentStreak} Days</p>
            </div>
            <Flame className="h-16 w-16 opacity-20" />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 backdrop-blur-sm">
            <Coins className="h-5 w-5" />
            <span className="font-semibold">{totalCredits} Credits</span>
          </div>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="px-6 py-6">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">This Week</h2>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekRewards.map((reward) => (
            <div key={reward.day} className="flex flex-col items-center gap-2">
              <div
                className={`relative flex h-16 w-full flex-col items-center justify-center rounded-xl border-2 transition-all ${
                  reward.claimed
                    ? "border-green-500/50 bg-green-500/10"
                    : reward.isToday
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "border-muted bg-muted/30"
                }`}
              >
                {reward.claimed && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                {reward.day === 7 && (
                  <div className="absolute -right-1 -top-1">
                    <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                )}
                <Coins
                  className={`h-5 w-5 ${
                    reward.claimed ? "text-green-500" : reward.isToday ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-xs font-bold ${
                    reward.claimed ? "text-green-500" : reward.isToday ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  +{reward.credits}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">Day {reward.day}</span>
            </div>
          ))}
        </div>

        {/* Claim Button */}
        {canClaim && (
          <Button
            onClick={handleClaimReward}
            size="lg"
            className="mt-6 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
          >
            <Gift className="mr-2 h-5 w-5" />
            Claim Today's Reward
          </Button>
        )}

        {!canClaim && (
          <div className="mt-6 rounded-xl bg-muted/50 p-4 text-center">
            <Check className="mx-auto h-8 w-8 text-green-500" />
            <p className="mt-2 font-semibold text-foreground">Reward Claimed!</p>
            <p className="text-sm text-muted-foreground">Come back tomorrow for more credits</p>
          </div>
        )}
      </div>

      {/* Rewards Info */}
      <div className="px-6 py-4">
        <div className="rounded-xl bg-gradient-to-br from-primary/5 to-transparent p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Streak Rewards
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Days 1-3</span>
              <span className="font-semibold text-foreground">10-20 credits/day</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Days 4-6</span>
              <span className="font-semibold text-foreground">25-40 credits/day</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Day 7 Bonus</span>
              <span className="font-bold text-primary">100 credits!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
