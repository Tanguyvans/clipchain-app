"use client";

import { useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Your ClipChain wallet address
const RECIPIENT_WALLET = "0x2869B9D189a892181E02157f77411E312b9a6Ee6";

// Base USDC token address
const BASE_USDC_TOKEN = "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// 0.25 USDC (6 decimals)
const GENERATION_COST = "250000";

type Duration = "4" | "8" | "12";

export default function GenerateVideoPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<Duration>("4");
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"prompt" | "payment" | "generating">("prompt");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      setStep("payment");
      setIsGenerating(true);

      // Request payment via MiniKit sendToken
      toast.info("Opening payment...");

      const paymentResult = await sdk.actions.sendToken({
        token: BASE_USDC_TOKEN,
        amount: GENERATION_COST,
        recipientAddress: RECIPIENT_WALLET,
      });

      if (!paymentResult.success) {
        toast.error("Payment cancelled or failed");
        setIsGenerating(false);
        setStep("prompt");
        return;
      }

      // Payment successful!
      toast.success("Payment confirmed! Generating video...");
      setStep("generating");

      // Call video generation API with duration
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          duration: parseInt(duration),
          transactionHash: paymentResult.send.transaction
        }),
      });

      if (!response.ok) {
        throw new Error("Video generation failed");
      }

      const data = await response.json();
      const videoUrl = data.videoUrl;

      toast.success("Video generated!");

      // Navigate to post-video page
      router.push(
        `/post-video?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(prompt)}`
      );

    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate video");
      setIsGenerating(false);
      setStep("prompt");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] p-4">
      <Card className="w-full max-w-md border-gray-800 bg-[#1A1A1A]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-6 w-6 text-purple-500" />
            Generate Video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "prompt" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">
                  Describe your video
                </label>
                <Textarea
                  placeholder="e.g., A futuristic city at night with neon lights and flying cars..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  maxLength={500}
                  className="min-h-[120px] border-gray-700 bg-[#0A0A0A] text-white placeholder:text-gray-600"
                  disabled={isGenerating}
                />
                <p className="text-right text-xs text-gray-500">{prompt.length}/500</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["4", "8", "12"] as Duration[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`rounded-lg border-2 py-3 text-sm font-semibold transition-all ${
                        duration === d
                          ? "border-purple-500 bg-purple-500 text-white"
                          : "border-gray-700 bg-[#0A0A0A] text-gray-400 hover:border-gray-600"
                      }`}
                      disabled={isGenerating}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
                <p className="text-sm text-purple-300">
                  💰 Cost: <span className="font-bold">0.25 USDC</span>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Payment via Base network (low gas fees)
                </p>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Generate Video
              </Button>
            </>
          )}

          {step === "payment" && (
            <div className="space-y-4 text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-purple-500" />
              <div>
                <p className="font-semibold text-white">Confirming Payment...</p>
                <p className="text-sm text-gray-400">
                  Please confirm the transaction in your wallet
                </p>
              </div>
            </div>
          )}

          {step === "generating" && (
            <div className="space-y-4 text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-purple-500" />
              <div>
                <p className="font-semibold text-white">Generating Your Video...</p>
                <p className="text-sm text-gray-400">
                  This may take 30-60 seconds
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
