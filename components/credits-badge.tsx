"use client"

import { Coins, Flame } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export function CreditsBadge() {
  const { userData } = useAuth()

  // Credits are automatically loaded from useAuth hook
  if (!userData) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      {/* Credits */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-4 py-2">
        <Coins className="h-5 w-5 text-yellow-400" />
        <span className="font-semibold text-white">
          {userData.credits || 0}
        </span>
        <span className="text-xs text-gray-400">credits</span>
      </div>

      {/* Streak */}
      {userData.streak && userData.streak > 0 && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full px-4 py-2">
          <Flame className="h-5 w-5 text-orange-400" />
          <span className="font-semibold text-white">
            {userData.streak}
          </span>
          <span className="text-xs text-gray-400">day streak</span>
        </div>
      )}
    </div>
  )
}
