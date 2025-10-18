"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Trophy, Flame } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      label: "Feed",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      icon: Trophy,
      active: pathname === "/leaderboard",
    },
    {
      href: "/streak",
      label: "Streak",
      icon: Flame,
      active: pathname === "/streak",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-around px-4 py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                item.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  item.active ? "bg-primary/10" : ""
                }`}
              >
                <Icon className={`h-5 w-5 ${item.active ? "fill-primary/20" : ""}`} />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
