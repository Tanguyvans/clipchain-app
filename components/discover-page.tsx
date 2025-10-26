"use client"

import { Sparkles, User, Loader2, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { sdk } from "@farcaster/miniapp-sdk"
import { toast } from "sonner"
import { useAccount, useConnect } from "wagmi"
import { useComposeCast } from "@coinbase/onchainkit/minikit"

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
  const { composeCast } = useComposeCast()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMiniKitReady, setIsMiniKitReady] = useState(false)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const [generationType, setGenerationType] = useState<"profile" | "bio" | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [refundInfo, setRefundInfo] = useState<{ txHash: string, refunded: boolean } | null>(null)

  // Fetch user's profile including bio
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true)
      try {
        // Determine query parameter priority: wallet address > FID > username > default
        const queryParam = walletAddress
          ? `address=${walletAddress}`
          : authUserData?.fid
          ? `fid=${authUserData.fid}`
          : authUserData?.username
          ? `username=${authUserData.username}`
          : "username=tanguyvans"

        console.log("Fetching discover profile:", queryParam)

        const response = await fetch(`/api/user?${queryParam}`)
        const data = await response.json()

        if (data.success && data.user) {
          setUserProfile({
            username: data.user.username,
            displayName: data.user.displayName,
            avatar: data.user.avatar,
            bio: data.user.bio || ""
          })
        } else {
          console.error("Failed to fetch user:", data.error)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [walletAddress, authUserData])

  // Check MiniKit availability and auto-connect wallet
  useEffect(() => {
    const checkMiniKit = async () => {
      try {
        const context = await sdk.context
        if (context && sdk.actions) {
          setIsMiniKitReady(true)
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

  // Process payment and return transaction details
  const processPayment = async (): Promise<{ transactionHash: string; userWalletAddress: string }> => {
    const isDevelopment = process.env.NODE_ENV === 'development'
    let transactionHash = "dev_tx_" + Date.now()
    let userWalletAddress = ""

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
            throw new Error("Payment cancelled or failed")
          }

          transactionHash = paymentResult.send.transaction
          userWalletAddress = walletAddress || authUserData?.address || ""
          console.log("Payment transaction:", transactionHash)
          toast.success("Payment confirmed! Generating video...")
        } catch (paymentError) {
          console.error("Payment error:", paymentError)
          if (!isDevelopment) {
            throw new Error("Payment failed. Please try again.")
          }
          toast.warning("Payment failed - continuing in dev mode")
        }
      }
    } else if (isDevelopment) {
      toast.info("Development mode - skipping payment")
    }

    return { transactionHash, userWalletAddress }
  }

  const handlePaymentAndGenerate = async (type: "profile" | "bio") => {
    if (type === "profile" && !userProfile?.avatar) return
    if (type === "bio" && !userProfile?.bio) return

    try {
      setIsGenerating(true)
      setGenerationType(type)
      setErrorMessage(null)
      setRefundInfo(null)

      // Process payment
      const { transactionHash, userWalletAddress } = await processPayment()

      // Build request body
      const baseBody = { imageUrl: userProfile?.avatar, transactionHash, userWalletAddress }
      const requestBody = type === "profile"
        ? { ...baseBody, prompt: "Animate this profile picture with subtle, natural movement" }
        : { ...baseBody, bio: userProfile?.bio, displayName: userProfile?.displayName }

      // Call generation API
      const apiEndpoint = type === "profile" ? "/api/generate-image-to-video" : "/api/generate-bio-video"
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      // Handle errors with refund info
      if (!response.ok || !data.success) {
        const errorMsg = data.error || "Failed to generate video"
        setErrorMessage(errorMsg)

        if (data.refundRequested) {
          setRefundInfo({ txHash: transactionHash, refunded: true })
          toast.error(`Generation failed. A refund of 0.25 USDC has been requested.`, { duration: 10000 })
          console.log("🔄 Refund requested:", transactionHash, errorMsg)
        } else {
          toast.error(errorMsg, { duration: 5000 })
        }
        return
      }

      // Success
      if (data.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl)
        toast.success("Video generated!")
      }
    } catch (error) {
      console.error("Generation error:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnimateProfile = () => handlePaymentAndGenerate("profile")
  const handleBioToVideo = () => handlePaymentAndGenerate("bio")

  const handlePostVideo = () => {
    if (!generatedVideoUrl) return

    try {
      console.log("📤 Posting video to Farcaster:", generatedVideoUrl)
      console.log("📝 Generation type:", generationType)

      const castText = generationType === "profile"
        ? `Check out my animated profile! 💃✨\n\nGenerated with @clipchain`
        : `Watch me present my bio! 🎤✨\n\nGenerated with @clipchain`

      console.log("🎬 Calling composeCast with:", { text: castText, embeds: [generatedVideoUrl], channelKey: "clipchain" })

      // Use OnchainKit's composeCast with channelKey to post to /clipchain
      composeCast({
        text: castText,
        embeds: [generatedVideoUrl],
        channelKey: "clipchain", // Post to the /clipchain channel
      })

      toast.success("Opening Farcaster composer...")
    } catch (error) {
      console.error("Error composing cast:", error)
      toast.error("Failed to open compose dialog")
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

      {/* Loading State - Show during generation */}
      {isGenerating && (
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="space-y-4 text-center">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-purple-500" />
            <div>
              <p className="text-xl font-semibold text-white">Generating Your Video...</p>
              <p className="text-sm text-gray-400 mt-2">
                This may take 30-60 seconds
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Please don&apos;t close the app
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner - Show if generation failed with refund */}
      {refundInfo && errorMessage && !isGenerating && !generatedVideoUrl && (
        <div className="mx-4 mt-4 mb-2 rounded-xl bg-red-500/10 border border-red-500/30 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-400 mb-1">Generation Failed</h3>
              <p className="text-sm text-red-300 mb-2">{errorMessage}</p>
              <div className="rounded-lg bg-black/30 p-3 border border-red-500/20">
                <p className="text-xs font-medium text-red-200 mb-1">🔄 Refund Requested</p>
                <p className="text-xs text-gray-400">
                  A refund of 0.25 USDC has been requested and will be processed.
                </p>
                <p className="text-xs text-gray-500 mt-2 break-all">
                  Transaction: {refundInfo.txHash}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setErrorMessage(null)
                setRefundInfo(null)
              }}
              className="flex-shrink-0 rounded-full p-1 hover:bg-red-500/20 transition-colors"
            >
              <X className="h-4 w-4 text-red-400" />
            </button>
          </div>
        </div>
      )}

      {/* Content - Hide during generation */}
      {userProfile && !isGenerating && !generatedVideoUrl && (
        <div className="p-4 space-y-4">
          {/* Animate Profile Picture */}
          <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 flex-shrink-0">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Make Your Profile Dance! 💃</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Watch your profile picture come alive with fun dancing moves and energetic animation
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
                <h3 className="text-xl font-bold text-white mb-2">Bio Speech Presentation 🎤</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Watch a professional presenter give a speech about your bio with engaging body language and gestures
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

      {/* Video Preview - Full Screen */}
      {generatedVideoUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0A]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Preview Your Video</h2>
            <button
              onClick={() => setGeneratedVideoUrl(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Video Preview */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto max-w-md">
              <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-black">
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info Card */}
              <div className="mt-4 rounded-xl border border-gray-800 bg-[#1A1A1A] p-4">
                <p className="text-sm text-gray-400">Generated from:</p>
                <p className="mt-1 font-medium text-white">
                  {generationType === "profile" ? "Your Profile Picture" : "Your Bio"}
                </p>
                {generationType === "bio" && userProfile?.bio && (
                  <p className="mt-2 text-sm text-gray-400 italic">
                    &ldquo;{userProfile.bio}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="shrink-0 border-t border-gray-800 px-6 pb-6 pt-4">
            <div className="mx-auto max-w-md space-y-3">
              <button
                onClick={handlePostVideo}
                className="h-14 w-full rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-lg font-bold text-white shadow-xl shadow-orange-500/40 transition-all hover:scale-[1.02] active:scale-95"
              >
                Share to Farcaster ✨
              </button>
              <button
                onClick={() => setGeneratedVideoUrl(null)}
                className="h-12 w-full rounded-full border-2 border-gray-700 text-sm font-semibold text-gray-300 transition-all hover:border-gray-600 hover:bg-gray-800"
              >
                Back to Discover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
