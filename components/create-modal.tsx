"use client"

import { X, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { sdk } from "@farcaster/miniapp-sdk"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface CreateModalProps {
  isOpen: boolean
  onClose: () => void
}

type Duration = "4" | "8" | "12"

// Your ClipChain wallet address
const RECIPIENT_WALLET = "0x2869B9D189a892181E02157f77411E312b9a6Ee6"
// Base USDC token address
const BASE_USDC_TOKEN = "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
// 0.25 USDC (6 decimals)
const GENERATION_COST = "250000"

export function CreateModal({ isOpen, onClose }: CreateModalProps) {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [duration, setDuration] = useState<Duration>("4")
  const [isGenerating, setIsGenerating] = useState(false)
  const [step, setStep] = useState<"prompt" | "payment" | "generating">("prompt")
  const [isMiniKitReady, setIsMiniKitReady] = useState(false)

  const durations: Duration[] = ["4", "8", "12"]

  useEffect(() => {
    // Check if MiniKit SDK is available
    const checkMiniKit = async () => {
      try {
        // The SDK is available if we're in the Farcaster app
        if (sdk && typeof sdk.actions !== 'undefined') {
          setIsMiniKitReady(true)
        }
      } catch (error) {
        console.error("MiniKit not available:", error)
        setIsMiniKitReady(false)
      }
    }
    checkMiniKit()
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    try {
      setStep("payment")
      setIsGenerating(true)

      // Check if SDK is ready
      if (!isMiniKitReady || !sdk) {
        throw new Error(
          "Please open this app in the Farcaster mobile app to make payments"
        )
      }

      // Request payment via MiniKit sendToken
      toast.info("Opening payment...")

      const paymentResult = await sdk.actions.sendToken({
        token: BASE_USDC_TOKEN,
        amount: GENERATION_COST,
        recipientAddress: RECIPIENT_WALLET,
      })

      console.log("Payment result:", paymentResult)

      if (!paymentResult.success) {
        toast.error("Payment cancelled or failed")
        setIsGenerating(false)
        setStep("prompt")
        return
      }

      // Payment successful!
      toast.success("Payment confirmed! Generating video...")
      setStep("generating")

      // Get transaction hash
      const transactionHash = paymentResult.send.transaction

      // Call video generation API with duration
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          duration: parseInt(duration),
          transactionHash,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Video generation failed")
      }

      const data = await response.json()
      const videoUrl = data.videoUrl

      if (!videoUrl) {
        throw new Error("No video URL received")
      }

      toast.success("Video generated!")

      // Navigate to post-video page
      router.push(
        `/post-video?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(prompt)}`
      )

      onClose()
    } catch (error) {
      console.error("Generation error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to generate video"
      toast.error(errorMessage)
      setIsGenerating(false)
      setStep("prompt")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm">
      {/* Modal Sheet */}
      <div className="flex h-[85vh] max-h-[800px] w-full flex-col overflow-hidden rounded-t-3xl bg-[#0A0A0A] shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-gray-600" />
        </div>

        {/* Header */}
        <div className="relative border-b border-gray-800 px-6 py-4">
          <h2 className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-2xl font-bold text-transparent">
            ✨ Generate Video
          </h2>
          <button
            onClick={onClose}
            className="absolute right-6 top-4 rounded-full p-2 transition-colors hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-4">
          {step === "prompt" && (
            <>
              {/* Prompt Input */}
              <div className="p-6">
                <label className="mb-2 block font-semibold text-white">Describe your video</label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                    rows={5}
                    placeholder="A futuristic city at night with neon lights and flying cars..."
                    className="w-full rounded-xl border-2 border-gray-800 bg-[#1A1A1A] p-4 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    disabled={isGenerating}
                  />
                  <span className="absolute bottom-2 right-2 text-xs text-gray-500">
                    {prompt.length}/500
                  </span>
                </div>
              </div>

              {/* Duration Selector */}
              <div className="px-6 pb-4">
                <label className="mb-2 block font-semibold text-white">Duration</label>
                <div className="flex gap-2">
                  {durations.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 rounded-lg border-2 px-6 py-2 text-sm font-semibold transition-all ${
                        duration === d
                          ? "border-orange-500 bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                          : "border-gray-700 text-gray-400 hover:border-gray-600"
                      }`}
                      disabled={isGenerating}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Card */}
              <div className="mx-6 mb-4 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
                <p className="text-sm text-orange-300">
                  💰 Cost: <span className="font-bold">0.25 USDC</span>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Payment via Base network (low gas fees)
                </p>
              </div>
            </>
          )}

          {step === "payment" && (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="space-y-4 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-500" />
                <div>
                  <p className="font-semibold text-white">Confirming Payment...</p>
                  <p className="text-sm text-gray-400">
                    Please confirm the transaction in your wallet
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "generating" && (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="space-y-4 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-500" />
                <div>
                  <p className="font-semibold text-white">Generating Your Video...</p>
                  <p className="text-sm text-gray-400">
                    This may take 30-60 seconds
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="shrink-0 border-t border-gray-800 px-6 pb-6 pt-4">
          {step === "prompt" && (
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="h-14 w-full rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-lg font-bold text-white shadow-xl shadow-orange-500/40 transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generate for 0.25 USDC ✨
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
