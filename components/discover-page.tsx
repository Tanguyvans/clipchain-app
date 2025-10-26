"use client"

import { Sparkles, User, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"

export function DiscoverPage() {
  const { userData } = useAuth()
  const [userBio, setUserBio] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user's full profile including bio
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userData?.fid) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/user?fid=${userData.fid}`)
        const data = await response.json()

        if (data.success && data.user.bio) {
          setUserBio(data.user.bio)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [userData?.fid])

  const handleAnimateProfile = async () => {
    if (!userData?.pfpUrl) return
    setIsGenerating(true)
    // TODO: Implement image-to-video generation
    console.log("Animating profile picture:", userData?.pfpUrl)
  }

  const handleBioToVideo = async () => {
    if (!userBio) return
    setIsGenerating(true)
    // TODO: Implement bio-to-video generation
    console.log("Generating video from bio:", userBio)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-gray-800 bg-[#0A0A0A]/95 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-purple-500" />
          <div>
            <h1 className="text-xl font-bold text-white">Discover</h1>
            <p className="text-sm text-gray-400">Generate videos from your profile</p>
          </div>
        </div>
      </div>

      {/* Not Signed In State */}
      {!userData ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-800">
            <User className="h-10 w-10 text-gray-600" />
          </div>
          <p className="text-lg text-gray-300 mb-2">Sign in to discover</p>
          <p className="text-sm text-gray-500">
            Connect your Farcaster account to generate personalized videos
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Animate Profile Picture */}
          <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 flex-shrink-0">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Animate Your Profile Picture</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Transform your profile picture into a dynamic animated video using AI
                </p>
                {userData.pfpUrl && (
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={userData.pfpUrl}
                      alt="Your profile"
                      className="h-16 w-16 rounded-full border-2 border-purple-500/50"
                    />
                    <div className="text-sm text-gray-400">
                      <p className="font-medium text-white">{userData.displayName || userData.username}</p>
                      <p className="text-xs text-gray-500">Will be animated</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              disabled={!userData.pfpUrl || isGenerating}
              onClick={handleAnimateProfile}
              className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                "✨ Animate My Profile"
              )}
            </button>
          </div>

          {/* Bio to Video */}
          <div className="rounded-xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/30 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 flex-shrink-0">
                <User className="h-6 w-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Bio to Video</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Generate a cinematic video based on your Farcaster bio and profile
                </p>
                {userBio ? (
                  <div className="rounded-lg bg-black/30 p-3 border border-orange-500/20 mb-4">
                    <p className="text-sm text-gray-300 italic">&ldquo;{userBio}&rdquo;</p>
                    <p className="text-xs text-gray-500 mt-1">Your bio</p>
                  </div>
                ) : (
                  <div className="rounded-lg bg-black/30 p-3 border border-orange-500/20 mb-4">
                    <p className="text-sm text-gray-400">No bio found</p>
                    <p className="text-xs text-gray-500 mt-1">Add a bio to your Farcaster profile to use this feature</p>
                  </div>
                )}
              </div>
            </div>
            <button
              disabled={!userBio || isGenerating}
              onClick={handleBioToVideo}
              className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                "🎬 Create Bio Video"
              )}
            </button>
          </div>

          {/* Info Card */}
          <div className="rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-4">
            <p className="text-sm text-gray-300 mb-1">💡 How it works</p>
            <p className="text-xs text-gray-400">
              We use your Farcaster profile data to create personalized AI-generated videos.
              Each video is unique and based on your actual profile information.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
