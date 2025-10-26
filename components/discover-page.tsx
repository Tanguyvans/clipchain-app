"use client"

import { Sparkles, User, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"

interface UserProfile {
  username: string
  displayName: string
  avatar: string
  bio: string
}

export function DiscoverPage() {
  const { walletAddress, userData: authUserData } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user's full profile including bio - similar to profile page
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true)
      try {
        let queryParam = ""

        // Try to use wallet address first (from Base app)
        if (walletAddress) {
          queryParam = `address=${walletAddress}`
          console.log("Fetching discover profile by wallet address:", walletAddress)
        }
        // Fallback to FID from auth context
        else if (authUserData?.fid) {
          queryParam = `fid=${authUserData.fid}`
          console.log("Fetching discover profile by FID:", authUserData.fid)
        }
        // Fallback to username from auth context
        else if (authUserData?.username) {
          queryParam = `username=${authUserData.username}`
          console.log("Fetching discover profile by username:", authUserData.username)
        }
        // Last resort: use default username
        else {
          queryParam = "username=tanguyvans"
          console.log("Using default username for discover: tanguyvans")
        }

        const response = await fetch(`/api/user?${queryParam}`)
        const data = await response.json()

        if (data.success && data.user) {
          console.log("Discover user data received:", data.user)
          setUserProfile({
            username: data.user.username,
            displayName: data.user.displayName,
            avatar: data.user.avatar,
            bio: data.user.bio || ""
          })
        } else {
          console.error("Failed to fetch user for discover:", data.error)
        }
      } catch (error) {
        console.error("Error fetching user profile for discover:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [walletAddress, authUserData])

  const handleAnimateProfile = async () => {
    if (!userProfile?.avatar) return
    setIsGenerating(true)
    // TODO: Implement image-to-video generation
    console.log("Animating profile picture:", userProfile?.avatar)
  }

  const handleBioToVideo = async () => {
    if (!userProfile?.bio) return
    setIsGenerating(true)
    // TODO: Implement bio-to-video generation
    console.log("Generating video from bio:", userProfile?.bio)
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

      {/* Content */}
      {userProfile && (
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
                {userProfile.avatar && (
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={userProfile.avatar}
                      alt="Your profile"
                      className="h-16 w-16 rounded-full border-2 border-purple-500/50"
                    />
                    <div className="text-sm text-gray-400">
                      <p className="font-medium text-white">{userProfile.displayName || userProfile.username}</p>
                      <p className="text-xs text-gray-500">Will be animated</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              disabled={!userProfile.avatar || isGenerating}
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
                {userProfile.bio ? (
                  <div className="rounded-lg bg-black/30 p-3 border border-orange-500/20 mb-4">
                    <p className="text-sm text-gray-300 italic">&ldquo;{userProfile.bio}&rdquo;</p>
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
              disabled={!userProfile.bio || isGenerating}
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
