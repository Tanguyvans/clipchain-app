"use client"

import { useState, useEffect } from "react"
import { Sparkles, User, MessageSquare, Loader2, X } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { DEFAULT_TEMPLATES } from "@/lib/default-templates"
import { sdk } from "@farcaster/miniapp-sdk"
import { toast } from "sonner"
import { useAccount, useConnect } from "wagmi"
import { useComposeCast } from "@coinbase/onchainkit/minikit"

// Payment constants
const RECIPIENT_WALLET = "0x2869B9D189a892181E02157f77411E312b9a6Ee6"
const BASE_USDC_TOKEN = "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const GENERATION_COST = "250000" // 0.25 USDC

interface UserProfile {
  username: string
  displayName: string
  avatar: string
  bio: string
}

export default function CreatePage() {
  const { walletAddress, userData: authUserData } = useAuth()
  const { isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { composeCast } = useComposeCast()

  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedType, setSelectedType] = useState<'profile' | 'bio' | 'text' | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMiniKitReady, setIsMiniKitReady] = useState(false)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const [generationPrompt, setGenerationPrompt] = useState<string>("")
  const [, setErrorMessage] = useState<string | null>(null)
  const [, setRefundInfo] = useState<{ txHash: string, refunded: boolean } | null>(null)

  // Fetch user's profile including bio
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true)
      try {
        const queryParam = walletAddress
          ? `address=${walletAddress}`
          : authUserData?.fid
          ? `fid=${authUserData.fid}`
          : authUserData?.username
          ? `username=${authUserData.username}`
          : "username=tanguyvans"

        const response = await fetch(`/api/user?${queryParam}`)
        const data = await response.json()

        if (data.success && data.user) {
          setUserProfile({
            username: data.user.username,
            displayName: data.user.displayName,
            avatar: data.user.avatar,
            bio: data.user.bio || ""
          })
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

  const handlePaymentAndGenerate = async (type: "profile" | "bio" | "text") => {
    if (type === "profile" && !userProfile?.avatar) {
      toast.error("No profile picture found")
      return
    }
    if (type === "bio" && !userProfile?.bio) {
      toast.error("No bio found in your Farcaster profile")
      return
    }

    try {
      setIsGenerating(true)
      setSelectedType(type)
      setErrorMessage(null)
      setRefundInfo(null)

      // Process payment
      const { transactionHash, userWalletAddress } = await processPayment()

      // Build request body
      const baseBody = { imageUrl: userProfile?.avatar, transactionHash, userWalletAddress }
      const profilePrompt = "Animate this profile picture with subtle, natural movement"
      const bioPrompt = `Create a professional speech presentation about: ${userProfile?.bio}`

      const requestBody = type === "profile"
        ? { ...baseBody, prompt: profilePrompt }
        : { ...baseBody, bio: userProfile?.bio, displayName: userProfile?.displayName }

      // Save the prompt for template creation later
      setGenerationPrompt(type === "profile" ? profilePrompt : bioPrompt)

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

  const handlePostVideo = async () => {
    if (!generatedVideoUrl || !selectedType) return

    try {
      // Save template to database
      if (authUserData?.fid && generationPrompt) {
        try {
          const templateResponse = await fetch("/api/templates/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creatorFid: authUserData.fid,
              videoUrl: generatedVideoUrl,
              prompt: generationPrompt,
              generationType: selectedType,
              settings: {
                duration: selectedType === "profile" ? 5 : 10,
                style: selectedType === "profile" ? "dance" : "speech",
              },
            }),
          })

          const templateData = await templateResponse.json()
          if (templateData.success) {
            console.log("✅ Template saved:", templateData.template.id)
          }
        } catch (templateError) {
          console.error("Failed to save template:", templateError)
        }
      }

      // Include video URL in the text for better visibility
      const castText = selectedType === "profile"
        ? `Check out my animated profile! 💃✨\n\n${generatedVideoUrl}\n\nGenerated with @clipchain`
        : `Watch me present my bio! 🎤✨\n\n${generatedVideoUrl}\n\nGenerated with @clipchain`

      // Use OnchainKit's composeCast with channelKey to post to /clipchain
      composeCast({
        text: castText,
        embeds: [generatedVideoUrl],
        channelKey: "clipchain",
      })

      toast.success("Opening Farcaster composer...")
    } catch (error) {
      console.error("Error composing cast:", error)
      toast.error("Failed to open compose dialog")
    }

    // Close modal and reset
    setGeneratedVideoUrl(null)
    setSelectedType(null)
    setGenerationPrompt("")
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  // Show generation loading state
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-16 w-16 animate-spin text-purple-500" />
          <div>
            <p className="text-xl font-semibold text-white">Generating Your Video...</p>
            <p className="text-sm text-gray-400 mt-2">This may take 30-60 seconds</p>
            <p className="text-xs text-gray-500 mt-1">Please don&apos;t close the app</p>
          </div>
        </div>
      </div>
    )
  }

  // Show video preview modal
  if (generatedVideoUrl) {
    return (
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
                {selectedType === "profile" ? "Your Profile Picture" : "Your Bio"}
              </p>
              {selectedType === "bio" && userProfile?.bio && (
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
              Back to Create
            </button>
          </div>
        </div>
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

          {/* Templates Carousel */}
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-3">
              {DEFAULT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handlePaymentAndGenerate(template.generationType)}
                  className={`flex-shrink-0 w-36 rounded-xl bg-gradient-to-br ${template.gradient} border ${template.borderColor} p-4 cursor-pointer hover:scale-105 transition-transform text-left`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${template.iconBg} mb-3`}>
                    <span className="text-2xl">{template.emoji}</span>
                  </div>
                  <p className="text-sm text-white font-semibold mb-1 line-clamp-2">{template.name}</p>
                  <p className="text-[10px] text-gray-400 line-clamp-2">{template.description}</p>
                </button>
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
              onClick={() => handlePaymentAndGenerate('profile')}
              className="w-full rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-5 text-left hover:scale-[1.02] transition-all active:scale-95"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white mb-1">💃 Animate Profile</h3>
                  {userProfile?.avatar && (
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={userProfile.avatar}
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
              onClick={() => handlePaymentAndGenerate('bio')}
              className="w-full rounded-xl bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/30 p-5 text-left hover:scale-[1.02] transition-all active:scale-95"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 flex-shrink-0">
                  <User className="h-6 w-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white mb-1">🎤 Bio Speech</h3>
                  <p className="text-xs text-gray-300 italic mb-1 line-clamp-1">
                    {userProfile?.bio ? `"${userProfile.bio}..."` : "Your Farcaster bio"}
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
              onClick={() => handlePaymentAndGenerate('text')}
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
