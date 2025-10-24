"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Home, Search, Plus, Trophy, User } from "lucide-react"

export function ClipChainBottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      href: "/",
      label: "Feed",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/discover",
      label: "Discover",
      icon: Search,
      active: pathname === "/discover",
    },
    {
      href: "#",
      label: "Create",
      icon: Plus,
      active: false,
      isFab: true,
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

  const handleCreateClick = () => {
    router.push("/create")
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-800 bg-[#0A0A0A]/95 backdrop-blur-xl pb-safe">
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon

          // FAB Create Button (Center)
          if (item.isFab) {
            return (
              <button
                key={item.href}
                onClick={handleCreateClick}
                className="relative -top-6 flex flex-col items-center gap-1 transition-all active:scale-95"
                aria-label={item.label}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-xl shadow-orange-500/50 border-2 border-[#0A0A0A]">
                  <Icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
              </button>
            )
          }

          // Regular Nav Items
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 transition-colors min-w-[60px]"
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
