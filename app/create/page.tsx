"use client"

import { useState, useEffect } from "react"
import { Sparkles, Loader2, X, Plus } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
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

interface TemplateData {
  id: string
  creator_fid: number
  video_url: string | null
  thumbnail_url: string | null
  generation_type: 'profile' | 'bio' | 'text'
  prompt: string
  settings: Record<string, unknown>
  cast_hash: string | null
  cast_url: string | null
  uses_count: number
  is_featured: boolean
  is_official: boolean
  created_at: string
  creator?: {
    fid: number
    username: string
    displayName: string
    pfpUrl: string
  } | null
  name?: string
  emoji?: string
  gradient?: string
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
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [officialTemplates, setOfficialTemplates] = useState<TemplateData[]>([])
  const [userTemplates, setUserTemplates] = useState<TemplateData[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)

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

  // Fetch templates from database
  useEffect(() => {
    const fetchTemplates = async () => {
      setTemplatesLoading(true)
      try {
        const response = await fetch('/api/templates/trending?limit=20')
        const data = await response.json()

        if (data.success) {
          setTemplates(data.templates)
          setOfficialTemplates(data.officialTemplates || [])
          setUserTemplates(data.userTemplates || [])
        }
      } catch (error) {
        console.error("Error fetching templates:", error)
      } finally {
        setTemplatesLoading(false)
      }
    }

    fetchTemplates()
  }, [])

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
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
          <h2 className="text-lg font-bold text-white">Preview Your Video</h2>
          <button
            onClick={() => setGeneratedVideoUrl(null)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Video Preview */}
            <div className="relative aspect-[9/16] max-w-sm mx-auto overflow-hidden rounded-xl bg-black">
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
            <div className="mt-3 rounded-xl border border-gray-800 bg-[#1A1A1A] p-3 max-w-sm mx-auto">
              <p className="text-xs text-gray-400">Generated from:</p>
              <p className="mt-1 text-sm font-medium text-white">
                {selectedType === "profile" ? "Your Profile Picture" : "Your Bio"}
              </p>
              {selectedType === "bio" && userProfile?.bio && (
                <p className="mt-2 text-xs text-gray-400 italic line-clamp-2">
                  &ldquo;{userProfile.bio}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Footer Actions */}
        <div className="shrink-0 border-t border-gray-800 px-4 py-4 bg-[#0A0A0A]">
          <div className="space-y-2 max-w-sm mx-auto">
            <button
              onClick={handlePostVideo}
              className="h-12 w-full rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-base font-bold text-white shadow-xl shadow-orange-500/40 transition-all active:scale-95"
            >
              Share to Farcaster ✨
            </button>
            <button
              onClick={() => setGeneratedVideoUrl(null)}
              className="h-10 w-full rounded-full border-2 border-gray-700 text-sm font-semibold text-gray-300 transition-all hover:border-gray-600 hover:bg-gray-800"
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
            <h1 className="text-xl font-bold text-white">Templates</h1>
            <p className="text-sm text-gray-400">Choose a style to generate</p>
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="pb-32">
        {/* Official Templates Section */}
        {!templatesLoading && officialTemplates.length > 0 && (
          <div className="mb-6">
            <div className="px-4 py-3 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-b border-orange-500/20">
              <h2 className="text-sm font-bold text-orange-400">✨ Official Templates</h2>
            </div>
            <div className="p-2 grid grid-cols-2 gap-2">
              {officialTemplates.map((template) => {
                const videoUrl = template.video_url
                const emoji = template.emoji
                const gradient = template.gradient || 'from-purple-500/10 to-blue-500/10'

                return (
                  <button
                    key={template.id}
                    onClick={() => handlePaymentAndGenerate(template.generation_type)}
                    className="group relative rounded-lg overflow-hidden active:opacity-90 transition-opacity"
                  >
                    {/* Video Thumbnail */}
                    {videoUrl ? (
                      <div className="aspect-[3/4] relative bg-black">
                        <video
                          src={videoUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                      </div>
                    ) : (
                      <div className={`aspect-[3/4] bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                        <div className="absolute inset-0 bg-black/20" />
                        {emoji && <span className="text-7xl z-10 drop-shadow-2xl">{emoji}</span>}
                      </div>
                    )}

                    {/* Title Overlay (bottom) */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                      <h3 className="text-sm font-semibold text-white leading-tight mb-1 line-clamp-2">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{template.uses_count || 0} uses</span>
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* User Templates Section */}
        {!templatesLoading && userTemplates.length > 0 && (
          <div>
            <div className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-purple-500/20">
              <h2 className="text-sm font-bold text-purple-400">🌟 Community Templates</h2>
            </div>
            <div className="p-2 grid grid-cols-2 gap-2">
              {userTemplates.map((template) => {
                const displayName = `${template.name || 'Template'} by @${template.creator?.username || 'user'}`
                const videoUrl = template.video_url
                const emoji = template.emoji
                const gradient = template.gradient || 'from-purple-500/10 to-blue-500/10'

                return (
                  <button
                    key={template.id}
                    onClick={() => handlePaymentAndGenerate(template.generation_type)}
                    className="group relative rounded-lg overflow-hidden active:opacity-90 transition-opacity"
                  >
                    {/* Video Thumbnail */}
                    {videoUrl ? (
                      <div className="aspect-[3/4] relative bg-black">
                        <video
                          src={videoUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                      </div>
                    ) : (
                      <div className={`aspect-[3/4] bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                        <div className="absolute inset-0 bg-black/20" />
                        {emoji && <span className="text-7xl z-10 drop-shadow-2xl">{emoji}</span>}
                      </div>
                    )}

                    {/* Title Overlay (bottom) */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                      <h3 className="text-sm font-semibold text-white leading-tight mb-1 line-clamp-2">
                        {displayName}
                      </h3>
                      <p className="text-xs text-gray-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{template.uses_count || 0} uses</span>
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Loading State */}
        {templatesLoading && (
          <div className="p-2 grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-900 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* No Templates State */}
        {!templatesLoading && templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No templates available yet</p>
            <p className="text-gray-500 text-xs mt-1">Generate and share videos to create templates!</p>
          </div>
        )}
      </div>

      {/* Floating Create Custom Button */}
      <button
        onClick={() => setShowTemplates(true)}
        className="fixed bottom-24 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-xl shadow-orange-500/40 flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
      >
        <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
      </button>

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
