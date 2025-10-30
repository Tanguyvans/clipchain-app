"use client"

import { useEffect, useState } from "react"
import { Coins, Flame } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface CreditsData {
  credits: number
  streak: number
  longestStreak: number
  totalVideos: number
  isNewUser: boolean
}

export function CreditsBadge() {
  const { walletAddress, userData } = useAuth()
  const [credits, setCredits] = useState<CreditsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCredits() {
      if (!walletAddress) {
        setLoading(false)
        return
      }

      try {
        const fid = userData?.fid || 0
        const response = await fetch(`/api/credits?wallet=${walletAddress}&fid=${fid}`)
        const data = await response.json()

        if (data.success) {
          setCredits(data)
        }
      } catch (error) {
        console.error('Error fetching credits:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()
  }, [walletAddress, userData])

  if (!walletAddress || loading) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      {/* Credits */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-4 py-2">
        <Coins className="h-5 w-5 text-yellow-400" />
        <span className="font-semibold text-white">
          {credits?.credits || 0}
        </span>
        <span className="text-xs text-gray-400">credits</span>
      </div>

      {/* Streak */}
      {credits && credits.streak > 0 && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full px-4 py-2">
          <Flame className="h-5 w-5 text-orange-400" />
          <span className="font-semibold text-white">
            {credits.streak}
          </span>
          <span className="text-xs text-gray-400">day streak</span>
        </div>
      )}
    </div>
  )
}
