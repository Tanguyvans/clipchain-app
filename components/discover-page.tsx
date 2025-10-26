"use client"

import { Sparkles, User, Loader2, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { sdk } from "@farcaster/miniapp-sdk"
import { toast } from "sonner"
import { useAccount, useConnect } from "wagmi"

interface UserProfile {
  username: string
  displayName: string
  avatar: string
  bio: string
}

// Payment constants
const RECIPIENT_WALLET = "0x2869B9D189a892181E02157f77411E312b9a6Ee6"
const BASE_USDC_TOKEN = "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const GENERATION_COST = "250000" // 0.25 USDC

export function DiscoverPage() {
  const { walletAddress, userData: authUserData } = useAuth()
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMiniKitReady, setIsMiniKitReady] = useState(false)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const [generationType, setGenerationType] = useState<"profile" | "bio" | null>(null)

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

  // Check MiniKit availability
  useEffect(() => {
    const checkMiniKit = async () => {
      try {
        const context = await sdk.context
        if (context && sdk.actions) {
          setIsMiniKitReady(true)
          // Auto-connect wallet if not connected
          if (!isConnected && connectors.length > 0) {
            connect({ connector: connectors[0] })
          }
        }
      } catch (error) {
        console.error("MiniKit not available:", error)
        setIsMiniKitReady(false)
      }
    }
    checkMiniKit()
  }, [isConnected, connectors, connect])

  const handlePaymentAndGenerate = async (type: "profile" | "bio") => {
    if (type === "profile" && !userProfile?.avatar) return
    if (type === "bio" && !userProfile?.bio) return

    try {
      setIsGenerating(true)
      setGenerationType(type)

      const isDevelopment = process.env.NODE_ENV === 'development'

      // Handle payment
      if (isMiniKitReady && sdk?.actions) {
        if (!isConnected && connectors.length > 0) {
          toast.info("Connecting wallet...")
          connect({ connector: connectors[0] })
          await new Promise(resolve => setTimeout(resolve, 1500))
        }

        if (isConnected || isDevelopment) {
          toast.info("Opening payment...")

          try {
            const paymentResult = await sdk.actions.sendToken({
              token: BASE_USDC_TOKEN,
              amount: GENERATION_COST,
              recipientAddress: RECIPIENT_WALLET,
            })

            if (!paymentResult.success) {
              toast.error("Payment cancelled or failed")
              setIsGenerating(false)
              return
            }

            // Payment successful
            console.log("Payment transaction:", paymentResult.send.transaction)
            toast.success("Payment confirmed! Generating video...")
          } catch (paymentError) {
            console.error("Payment error:", paymentError)
            if (isDevelopment) {
              toast.warning("Payment failed - continuing in dev mode")
            } else {
              throw new Error("Payment failed. Please try again.")
            }
          }
        }
      } else if (isDevelopment) {
        toast.info("Development mode - skipping payment")
      }

      // Generate video based on type
      const apiEndpoint = type === "profile" ? "/api/generate-image-to-video" : "/api/generate-bio-video"
      const requestBody = type === "profile"
        ? { imageUrl: userProfile?.avatar, prompt: "Animate this profile picture with subtle, natural movement" }
        : { bio: userProfile?.bio, displayName: userProfile?.displayName }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Video generation failed")
      }

      const data = await response.json()

      if (data.success && data.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl)
        toast.success("Video generated!")
      } else {
        throw new Error(data.error || "Failed to generate video")
      }
    } catch (error) {
      console.error("Generation error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to generate video"
      toast.error(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnimateProfile = () => handlePaymentAndGenerate("profile")
  const handleBioToVideo = () => handlePaymentAndGenerate("bio")

  const handlePostVideo = () => {
    if (!generatedVideoUrl) return

    if (sdk?.actions?.composeCast) {
      const castText = generationType === "profile"
        ? `Check out my animated profile! 🎬✨\n\n${generatedVideoUrl}`
        : `Video generated from my bio! 🎬✨\n\n${generatedVideoUrl}`

      sdk.actions.composeCast({
        text: castText,
      })
    }

    // Close modal and reset
    setGeneratedVideoUrl(null)
    setGenerationType(null)
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
              Each video is unique and based on your actual profile information. Cost: 0.25 USDC per video.
            </p>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {generatedVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setGeneratedVideoUrl(null)}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="overflow-hidden rounded-xl bg-[#1A1A1A]">
              <video
                src={generatedVideoUrl}
                controls
                autoPlay
                loop
                className="w-full aspect-[9/16]"
              />
              <div className="p-4">
                <p className="text-sm text-gray-400 mb-3">
                  Your {generationType === "profile" ? "animated profile" : "bio video"} is ready!
                </p>
                <button
                  onClick={handlePostVideo}
                  className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white hover:scale-[1.02] transition-all"
                >
                  Share to Farcaster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
