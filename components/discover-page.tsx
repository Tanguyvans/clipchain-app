"use client"

import { Search, TrendingUp, Play, UserPlus } from "lucide-react"
import { useState } from "react"
import type { VideoData, Creator, Template } from "@/types/clipchain"

export function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<"videos" | "creators" | "templates">("videos")

  const categories = ["Videos", "Creators", "Templates"]

  const trendingHashtags = [
    { tag: "#cyberpunk", count: "1.2K videos" },
    { tag: "#aiart", count: "890 videos" },
    { tag: "#scifi", count: "654 videos" },
    { tag: "#cinematic", count: "432 videos" },
    { tag: "#nature", count: "321 videos" },
  ]

  const mockVideos = [
    {
      id: "1",
      thumbnail: "bg-gradient-to-br from-purple-600 to-blue-600",
      views: "1.2K",
      duration: "0:08",
    },
    {
      id: "2",
      thumbnail: "bg-gradient-to-br from-orange-600 to-pink-600",
      views: "890",
      duration: "0:10",
    },
    {
      id: "3",
      thumbnail: "bg-gradient-to-br from-green-600 to-teal-600",
      views: "2.3K",
      duration: "0:05",
    },
    {
      id: "4",
      thumbnail: "bg-gradient-to-br from-yellow-600 to-orange-600",
      views: "654",
      duration: "0:12",
    },
    {
      id: "5",
      thumbnail: "bg-gradient-to-br from-pink-600 to-purple-600",
      views: "1.8K",
      duration: "0:09",
    },
    {
      id: "6",
      thumbnail: "bg-gradient-to-br from-blue-600 to-cyan-600",
      views: "432",
      duration: "0:15",
    },
  ]

  const mockCreators: Creator[] = [
    {
      id: "1",
      username: "cryptoartist",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=cryptoartist",
      verified: true,
      videoCount: 23,
    },
    {
      id: "2",
      username: "aimaster",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aimaster",
      verified: true,
      videoCount: 18,
    },
    {
      id: "3",
      username: "neonwave",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=neonwave",
      verified: false,
      videoCount: 15,
    },
    {
      id: "4",
      username: "pixelwizard",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pixelwizard",
      verified: true,
      videoCount: 12,
    },
  ]

  const mockTemplates: Template[] = [
    {
      id: "1",
      title: "Cyberpunk Cityscape",
      emoji: "🌃",
      prompt: "A futuristic neon-lit cyberpunk city at night with flying cars",
      useCount: 1234,
    },
    {
      id: "2",
      title: "Epic Movie Scene",
      emoji: "🎬",
      prompt: "A cinematic movie scene with dramatic lighting and camera work",
      useCount: 892,
    },
    {
      id: "3",
      title: "Space Adventure",
      emoji: "🚀",
      prompt: "An epic space scene with planets, stars, and cosmic phenomena",
      useCount: 756,
    },
    {
      id: "4",
      title: "Nature Paradise",
      emoji: "🌊",
      prompt: "A serene natural landscape with waterfalls and lush vegetation",
      useCount: 623,
    },
  ]

  const suggestedSearches = ["cyberpunk", "anime", "nature", "abstract", "cinematic"]

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-20 border-b border-gray-800 bg-[#0A0A0A]/95 p-4 backdrop-blur-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos, creators..."
            className="w-full rounded-full bg-[#1A1A1A] py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
      </div>

      {/* Category Toggle */}
      <div className="flex gap-3 px-4 pb-6 pt-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat.toLowerCase() as any)}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
              activeCategory === cat.toLowerCase()
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                : "bg-[#1A1A1A] text-gray-400 hover:text-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {searchQuery === "" ? (
        <>
          {/* Trending Section */}
          <div className="px-4 pb-6">
            <h2 className="mb-4 text-lg font-bold text-white">🔥 Trending Now</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {trendingHashtags.map((item) => (
                <div
                  key={item.tag}
                  className="min-w-[140px] cursor-pointer rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-4 transition-all hover:scale-105"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-bold text-white">{item.tag}</p>
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                  </div>
                  <p className="text-xs text-gray-400">{item.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Results based on active category */}
          <div className="px-4">
            {activeCategory === "videos" && (
              <div className="grid grid-cols-2 gap-3">
                {mockVideos.map((video) => (
                  <div
                    key={video.id}
                    className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-xl"
                  >
                    <div className={`h-full w-full ${video.thumbnail}`} />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Play className="h-12 w-12 text-white" fill="white" />
                    </div>

                    {/* View Count */}
                    <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                      {video.views}
                    </div>

                    {/* Duration */}
                    <div className="absolute top-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                      {video.duration}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeCategory === "creators" && (
              <div className="space-y-3">
                {mockCreators.map((creator) => (
                  <div
                    key={creator.id}
                    className="flex items-center gap-4 rounded-xl bg-[#1A1A1A] p-4"
                  >
                    <img
                      src={creator.avatar}
                      alt={creator.username}
                      className="h-12 w-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-white">{creator.username}</p>
                        {creator.verified && (
                          <div className="h-4 w-4 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-[10px]">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{creator.videoCount} videos</p>
                    </div>
                    <button className="flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-4 text-sm font-semibold text-white transition-all hover:scale-105">
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeCategory === "templates" && (
              <div className="space-y-4">
                {mockTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="rounded-xl bg-[#1A1A1A] p-4"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-2xl">{template.emoji}</span>
                          <h3 className="font-bold text-white">{template.title}</h3>
                        </div>
                        <p className="text-sm text-gray-400">{template.prompt}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {template.useCount.toLocaleString()} uses
                      </p>
                      <button className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105">
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Empty/Search State */
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-800">
            <Search className="h-10 w-10 text-gray-600" />
          </div>
          <p className="mb-4 text-lg text-gray-400">Search for videos or creators</p>

          {/* Suggested Searches */}
          <div className="flex flex-wrap justify-center gap-2">
            {suggestedSearches.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearchQuery(suggestion)}
                className="rounded-full bg-[#1A1A1A] px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-[#2A2A2A] hover:text-gray-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
