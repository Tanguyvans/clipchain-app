"use client"

import { useState, useEffect } from "react"
import { Sparkles, Loader2, X, Plus } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { sdk } from "@farcaster/miniapp-sdk"
import { toast } from "sonner"
import { useAccount, useConnect } from "wagmi"
import { useComposeCast } from "@coinbase/onchainkit/minikit"
import { StreakIndicator } from "@/components/streak-indicator"
import { StreakModal } from "@/components/streak-modal"

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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [, setErrorMessage] = useState<string | null>(null)
  const [, setRefundInfo] = useState<{ txHash: string, refunded: boolean } | null>(null)
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [officialTemplates, setOfficialTemplates] = useState<TemplateData[]>([])
  const [userTemplates, setUserTemplates] = useState<TemplateData[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [streakData, setStreakData] = useState<{
    current: number
    longest: number
    freeGenerations: number
    lastActivity: string | null
  }>({ current: 0, longest: 0, freeGenerations: 0, lastActivity: null })
  const [showStreakModal, setShowStreakModal] = useState(false)

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

  // Fetch user's streak data
  useEffect(() => {
    const fetchStreak = async () => {
      if (!authUserData?.fid) return

      try {
        const response = await fetch(`/api/user/streak?fid=${authUserData.fid}`)
        const data = await response.json()

        if (data.success && data.streak) {
          setStreakData({
            current: data.streak.current || 0,
            longest: data.streak.longest || 0,
            freeGenerations: data.streak.freeGenerations || 0,
            lastActivity: data.streak.lastActivity || null,
          })
        }
      } catch (error) {
        console.error("Error fetching streak:", error)
      }
    }

    fetchStreak()
  }, [authUserData?.fid])

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
  const processPayment = async (): Promise<{ transactionHash: string; userWalletAddress: string; usedFreeGen: boolean }> => {
    const isDevelopment = process.env.NODE_ENV === 'development'
    let transactionHash = "dev_tx_" + Date.now()
    let userWalletAddress = ""
    let usedFreeGen = false

    // Check if user has free generations available
    if (streakData.freeGenerations > 0 && authUserData?.fid) {
      try {
        const response = await fetch('/api/user/use-free-generation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fid: authUserData.fid }),
        })
        const data = await response.json()

        if (data.success) {
          usedFreeGen = true
          transactionHash = "free_gen_" + Date.now()
          userWalletAddress = walletAddress || authUserData?.address || ""

          // Update local state
          setStreakData(prev => ({
            ...prev,
            freeGenerations: data.remainingFreeGenerations,
          }))

          toast.success(`✨ Using free generation! ${data.remainingFreeGenerations} left`)
          return { transactionHash, userWalletAddress, usedFreeGen }
        }
      } catch (error) {
        console.error("Error using free generation:", error)
        // Fall through to normal payment
      }
    }

    // Normal payment flow
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

    return { transactionHash, userWalletAddress, usedFreeGen }
  }

  const handlePaymentAndGenerate = async (type: "profile" | "bio" | "text", templateId?: string) => {
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
      setSelectedTemplateId(templateId || null)
      setErrorMessage(null)
      setRefundInfo(null)

      // Process payment
      const { transactionHash, userWalletAddress, usedFreeGen } = await processPayment()

      // Get the prompt from the selected template if available
      let promptToUse = "Animate this profile picture with subtle, natural movement" // default fallback
      if (templateId) {
        const selectedTemplate = [...officialTemplates, ...userTemplates].find(t => t.id === templateId)
        if (selectedTemplate?.prompt) {
          promptToUse = selectedTemplate.prompt
        }
      }

      // Build request body
      const baseBody = { imageUrl: userProfile?.avatar, transactionHash, userWalletAddress }

      const requestBody = type === "profile"
        ? { ...baseBody, prompt: promptToUse }
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
        } else {
          toast.error(errorMsg, { duration: 5000 })
        }
        return
      }

      // Success
      if (data.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl)
        toast.success("Video generated!")

        // Update streak after successful generation (only if paid, not free gen)
        if (!usedFreeGen && authUserData?.fid) {
          try {
            const streakResponse = await fetch('/api/user/streak', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fid: authUserData.fid }),
            })
            const streakData = await streakResponse.json()

            if (streakData.success) {
              setStreakData({
                current: streakData.streak.current || 0,
                longest: streakData.streak.longest || 0,
                freeGenerations: streakData.streak.freeGenerations || 0,
                lastActivity: new Date().toISOString(),
              })

              // Show notification if streak increased or free gen awarded
              if (streakData.streak.streakIncreased) {
                toast.success(`🔥 Streak: ${streakData.streak.current} weeks!`, { duration: 3000 })
              }
              if (streakData.streak.freeGenAwarded) {
                toast.success(`✨ Free generation earned!`, { duration: 3000 })
              }
            }
          } catch (error) {
            console.error("Error updating streak:", error)
          }
        }
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
      // If user used an existing template, track the usage
      if (selectedTemplateId && authUserData?.fid) {
        try {
          const trackResponse = await fetch("/api/templates/use", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              templateId: selectedTemplateId,
              userFid: authUserData.fid,
              generatedVideoUrl: generatedVideoUrl,
            }),
          })

          const trackData = await trackResponse.json()
          if (trackData.success) {
            console.log("✅ Template usage tracked")
          }
        } catch (trackError) {
          console.error("Failed to track template usage:", trackError)
        }
      }
      // If user did NOT use a template, they created something custom
      // In the future, we'll save custom videos as new community templates
      // For now, we only track usage of existing templates

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

        {/* Video Preview - Centered and Compact */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative w-64 aspect-[9/16] overflow-hidden rounded-2xl bg-black shadow-2xl">
            <video
              src={generatedVideoUrl}
              controls
              autoPlay
              loop
              playsInline
              className="h-full w-full object-cover"
            />
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
      <div className="sticky top-0 z-20 border-b border-gray-800 bg-[#0A0A0A]/95 p-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/30">
              <Sparkles className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Create Video</h1>
              <p className="text-xs text-gray-400">Choose a template or create your own</p>
            </div>
          </div>
          <button
            onClick={() => setShowStreakModal(true)}
            className="transition-transform active:scale-95"
          >
            <StreakIndicator
              currentStreak={streakData.current}
              freeGenerations={streakData.freeGenerations}
              compact
            />
          </button>
        </div>
      </div>

      {/* Streak Modal - Only header badge opens it */}
      <StreakModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        currentStreak={streakData.current}
        longestStreak={streakData.longest}
        freeGenerations={streakData.freeGenerations}
        lastActivityDate={streakData.lastActivity}
      />

      {/* Templates Section */}
      <div className="pb-32">
        {/* Official Templates Section */}
        {!templatesLoading && officialTemplates.length > 0 && (
          <div className="mb-8">
            <div className="px-4 py-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-b border-orange-500/20">
              <h2 className="text-base font-bold text-orange-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Official Templates
              </h2>
              <p className="text-xs text-gray-400 mt-1">Professional templates crafted by ClipChain</p>
            </div>
            <div className="p-3 grid grid-cols-2 gap-3">
              {officialTemplates.map((template) => {
                const videoUrl = template.video_url
                const emoji = template.emoji
                const gradient = template.gradient || 'from-purple-500/10 to-blue-500/10'

                return (
                  <button
                    key={template.id}
                    onClick={() => handlePaymentAndGenerate(template.generation_type, template.id)}
                    className="group relative rounded-xl overflow-hidden active:opacity-90 transition-all hover:scale-[1.02] shadow-lg"
                  >
                    {/* Video Thumbnail */}
                    {videoUrl ? (
                      <div className="aspect-[3/4] relative bg-black">
                        <video
                          src={videoUrl}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                      </div>
                    ) : (
                      <div className={`aspect-[3/4] bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                        {emoji && <span className="text-7xl z-10 drop-shadow-2xl group-hover:scale-110 transition-transform">{emoji}</span>}
                      </div>
                    )}

                    {/* Title Overlay (bottom) */}
                    <div className="absolute bottom-0 left-0 right-0 p-3.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
                      <h3 className="text-sm font-bold text-white leading-tight mb-1.5 line-clamp-2">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-300 flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3 h-3 text-orange-400" />
                        <span className="font-medium">{template.uses_count || 0} uses</span>
                      </p>
                    </div>

                    {/* Official Badge */}
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-orange-500/90 backdrop-blur-sm">
                      <span className="text-xs font-bold text-white">Official</span>
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
            <div className="px-4 py-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-purple-500/20">
              <h2 className="text-base font-bold text-purple-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Community Templates
              </h2>
              <p className="text-xs text-gray-400 mt-1">Created by the ClipChain community</p>
            </div>
            <div className="p-3 grid grid-cols-2 gap-3">
              {userTemplates.map((template) => {
                const displayName = template.name || 'Template'
                const creatorName = template.creator?.username || 'user'
                const videoUrl = template.video_url
                const emoji = template.emoji
                const gradient = template.gradient || 'from-purple-500/10 to-blue-500/10'
                const pfpUrl = template.creator?.pfpUrl

                return (
                  <button
                    key={template.id}
                    onClick={() => handlePaymentAndGenerate(template.generation_type, template.id)}
                    className="group relative rounded-xl overflow-hidden active:opacity-90 transition-all hover:scale-[1.02] shadow-lg"
                  >
                    {/* Video Thumbnail */}
                    {videoUrl ? (
                      <div className="aspect-[3/4] relative bg-black">
                        <video
                          src={videoUrl}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                      </div>
                    ) : (
                      <div className={`aspect-[3/4] bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                        {emoji && <span className="text-7xl z-10 drop-shadow-2xl group-hover:scale-110 transition-transform">{emoji}</span>}
                      </div>
                    )}

                    {/* Title Overlay (bottom) */}
                    <div className="absolute bottom-0 left-0 right-0 p-3.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
                      <h3 className="text-sm font-bold text-white leading-tight mb-1.5 line-clamp-2">
                        {displayName}
                      </h3>
                      <div className="flex items-center gap-1.5 mb-1">
                        {pfpUrl && (
                          <img
                            src={pfpUrl}
                            alt={creatorName}
                            className="w-4 h-4 rounded-full border border-white/20"
                          />
                        )}
                        <p className="text-xs text-gray-300 truncate">
                          @{creatorName}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span className="font-medium">{template.uses_count || 0} uses</span>
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
          <div className="p-3 space-y-6">
            {/* Official Templates Skeleton */}
            <div>
              <div className="px-4 py-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-b border-orange-500/20 mb-3">
                <div className="h-4 w-32 bg-orange-500/20 rounded animate-pulse mb-2" />
                <div className="h-3 w-48 bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-900 rounded-xl animate-pulse shadow-lg" />
                ))}
              </div>
            </div>
            {/* Community Templates Skeleton */}
            <div>
              <div className="px-4 py-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-purple-500/20 mb-3">
                <div className="h-4 w-36 bg-purple-500/20 rounded animate-pulse mb-2" />
                <div className="h-3 w-52 bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-900 rounded-xl animate-pulse shadow-lg" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Templates State */}
        {!templatesLoading && templates.length === 0 && (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-300 text-base font-semibold mb-1">No templates yet</p>
            <p className="text-gray-500 text-sm">Generate and share videos to create templates!</p>
          </div>
        )}
      </div>

      {/* Floating Create Custom Button */}
      <button
        onClick={() => setShowTemplates(true)}
        className="fixed bottom-24 right-6 z-30 w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 shadow-2xl shadow-orange-500/50 flex items-center justify-center hover:scale-110 hover:shadow-orange-500/60 transition-all active:scale-95"
      >
        <Plus className="w-8 h-8 text-white" strokeWidth={3} />
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
