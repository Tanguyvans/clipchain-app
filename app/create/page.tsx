"use client"

import { useState } from "react"
import { Sparkles, User, MessageSquare, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { DiscoverPage } from "@/components/discover-page"

export default function CreatePage() {
  const { userData } = useAuth()
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedType, setSelectedType] = useState<'profile' | 'bio' | 'text' | null>(null)

  // If user selects a generation type, show the existing Discover modal
  if (selectedType) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <DiscoverPage />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-gray-800 bg-[#0A0A0A]/95 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-orange-500" />
          <div>
            <h1 className="text-xl font-bold text-white">Create</h1>
            <p className="text-sm text-gray-400">Generate AI videos</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Trending Templates Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">🔥 Trending Templates</h2>
              <p className="text-xs text-gray-400">Popular styles to remix with your data</p>
            </div>
          </div>

          {/* Templates Carousel - Placeholder for now */}
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-32 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-3 cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="aspect-[9/16] bg-gray-800 rounded-lg mb-2 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-gray-600" />
                  </div>
                  <p className="text-xs text-white font-medium truncate">Template {i}</p>
                  <p className="text-[10px] text-gray-400">🔥 {Math.floor(Math.random() * 1000)}+ uses</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowTemplates(true)}
            className="w-full text-sm text-orange-400 hover:text-orange-300 transition-colors mt-2"
          >
            See All Templates →
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800" />

        {/* Make Your Own Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white">✨ Make Your Own</h2>
            <p className="text-xs text-gray-400">Create from scratch</p>
          </div>

          <div className="space-y-3">
            {/* Profile Picture Card */}
            <button
              onClick={() => setSelectedType('profile')}
              className="w-full rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-5 text-left hover:scale-[1.02] transition-all active:scale-95"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white mb-1">💃 Animate Profile</h3>
                  {userData?.pfpUrl && (
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={userData.pfpUrl}
                        alt="Your profile"
                        className="h-8 w-8 rounded-full border border-purple-500/50"
                      />
                      <span className="text-xs text-gray-400">Your avatar</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400">Make your profile picture dance and move!</p>
                </div>
                <div className="text-xs text-orange-400 font-medium whitespace-nowrap">
                  Generate →
                </div>
              </div>
            </button>

            {/* Bio Speech Card */}
            <button
              onClick={() => setSelectedType('bio')}
              className="w-full rounded-xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/30 p-5 text-left hover:scale-[1.02] transition-all active:scale-95"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 flex-shrink-0">
                  <User className="h-6 w-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white mb-1">🎤 Bio Speech</h3>
                  <p className="text-xs text-gray-300 italic mb-1 line-clamp-1">
                    {userData?.displayName ? `"${userData.displayName}..."` : "Your Farcaster bio"}
                  </p>
                  <p className="text-xs text-gray-400">Turn your bio into a professional presentation</p>
                </div>
                <div className="text-xs text-orange-400 font-medium whitespace-nowrap">
                  Generate →
                </div>
              </div>
            </button>

            {/* Custom Prompt Card */}
            <button
              onClick={() => setSelectedType('text')}
              className="w-full rounded-xl bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/30 p-5 text-left hover:scale-[1.02] transition-all active:scale-95"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white mb-1">🎨 Custom Prompt</h3>
                  <p className="text-xs text-gray-400 mb-1">Describe your video idea...</p>
                  <p className="text-xs text-gray-400">Full creative control - type anything!</p>
                </div>
                <div className="text-xs text-orange-400 font-medium whitespace-nowrap">
                  Generate →
                </div>
              </div>
            </button>
          </div>

          {/* Info Card */}
          <div className="mt-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-4">
            <p className="text-sm text-gray-300 mb-1">💡 How it works</p>
            <p className="text-xs text-gray-400">
              Choose your input type, generate your video, and share it to Farcaster.
              Each generation costs 0.25 USDC or 1 credit.
            </p>
          </div>
        </div>
      </div>

      {/* Template Browser Modal - Coming Soon */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-2">Coming Soon! 🚀</h3>
            <p className="text-sm text-gray-400 mb-4">
              Template browser is being built. You&apos;ll be able to browse and use templates created by the community.
            </p>
            <button
              onClick={() => setShowTemplates(false)}
              className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
