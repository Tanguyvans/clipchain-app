"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Plus, Trophy, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"

export function ClipChainBottomNav() {
  const pathname = usePathname()
  const { userData: authUserData } = useAuth()
  const [freeGenerations, setFreeGenerations] = useState(0)

  // Fetch free generations
  useEffect(() => {
    const fetchFreeGens = async () => {
      if (!authUserData?.fid) return

      try {
        const response = await fetch(`/api/user/streak?fid=${authUserData.fid}`)
        const data = await response.json()

        if (data.success && data.streak) {
          setFreeGenerations(data.streak.freeGenerations || 0)
        }
      } catch (error) {
        console.error("Error fetching free generations:", error)
      }
    }

    fetchFreeGens()
  }, [authUserData?.fid])

  const navItems = [
    {
      href: "/",
      label: "Feed",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/create",
      label: "Create",
      icon: Plus,
      active: pathname === "/create",
    },
    {
      href: "/leaderboard",
      label: "Rankings",
      icon: Trophy,
      active: pathname === "/leaderboard",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      active: pathname === "/profile",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-800 bg-[#0A0A0A]/95 backdrop-blur-xl pb-safe">
      {/* Free Gens Badge - Top Left */}
      {freeGenerations > 0 && (
        <div className="absolute -top-10 left-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 flex items-center gap-1.5">
          <span className="text-base">⚡</span>
          <span className="text-sm font-bold text-yellow-400">{freeGenerations}</span>
          <span className="text-xs text-gray-300">free</span>
        </div>
      )}

      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 transition-colors flex-1"
            >
              <div className={`flex h-6 w-6 items-center justify-center transition-all ${
                item.active ? "text-white" : "text-gray-400"
              }`}>
                <Icon
                  className={`h-6 w-6 ${item.active ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : ""}`}
                  strokeWidth={item.active ? 2.5 : 2}
                />
              </div>
              <span className={`text-xs font-medium transition-colors ${
                item.active ? "text-white" : "text-gray-400"
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
