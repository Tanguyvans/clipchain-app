"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Plus, Trophy, User } from "lucide-react"

export function ClipChainBottomNav() {
  const pathname = usePathname()

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
