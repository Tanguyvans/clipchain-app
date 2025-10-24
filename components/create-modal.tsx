"use client"

import { X, Sparkles } from "lucide-react"
import { useState } from "react"

interface CreateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateModal({ isOpen, onClose }: CreateModalProps) {
  const [prompt, setPrompt] = useState("")
  const [duration, setDuration] = useState("10s")
  const [style, setStyle] = useState("Realistic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const templates = [
    { emoji: "🌃", label: "Cyberpunk" },
    { emoji: "🎬", label: "Movie Scene" },
    { emoji: "🔮", label: "Sci-Fi" },
    { emoji: "🎨", label: "Abstract" },
    { emoji: "🌊", label: "Nature" },
    { emoji: "🏙️", label: "Urban" },
  ]

  const durations = ["5s", "10s", "15s"]
  const styles = ["Realistic", "Anime", "Cinematic", "3D", "Artistic"]

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setProgress(0)

    // Simulate generation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsGenerating(false)
            setProgress(0)
            onClose()
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleTemplateClick = (template: string) => {
    const prompts: Record<string, string> = {
      "🌃 Cyberpunk": "A futuristic neon-lit cyberpunk city at night with flying cars and holographic billboards",
      "🎬 Movie Scene": "A cinematic movie scene with dramatic lighting and camera angles",
      "🔮 Sci-Fi": "A sci-fi landscape with advanced technology and alien environments",
      "🎨 Abstract": "An abstract artistic composition with flowing colors and shapes",
      "🌊 Nature": "A beautiful natural landscape with stunning scenery",
      "🏙️ Urban": "A modern urban cityscape with skyscrapers and bustling streets",
    }
    setPrompt(prompts[`${template.emoji} ${template.label}`] || "")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm">
      {/* Modal Sheet */}
      <div className="h-[80vh] max-h-[800px] w-full overflow-hidden rounded-t-3xl bg-[#0A0A0A] shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-gray-600" />
        </div>

        {/* Header */}
        <div className="relative border-b border-gray-800 px-6 py-4">
          <h2 className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
            ✨ Generate Video
          </h2>
          <p className="mt-1 text-sm text-gray-400">Transform your idea into AI video</p>
          <button
            onClick={onClose}
            className="absolute right-6 top-4 rounded-full p-2 transition-colors hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
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
              />
              <span className="absolute bottom-2 right-2 text-xs text-gray-500">
                {prompt.length}/500
              </span>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="px-6 pb-4">
            <label className="mb-3 block font-semibold text-white">⚡ Quick Start</label>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {templates.map((template) => (
                <button
                  key={template.label}
                  onClick={() => handleTemplateClick(template)}
                  className="whitespace-nowrap rounded-full bg-[#1A1A1A] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500"
                >
                  {template.emoji} {template.label}
                </button>
              ))}
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
                      ? "border-purple-500 bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                      : "border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Style Selector */}
          <div className="px-6 pb-4">
            <label className="mb-2 block font-semibold text-white">Style</label>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all ${
                    style === s
                      ? "border-purple-500 bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                      : "border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Cost Card */}
          <div className="mx-6 mb-4 rounded-xl border border-purple-500/20 bg-[#1A1A1A] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Cost per video</p>
                <p className="text-2xl font-bold text-orange-500">0.001 USDC</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Balance: 0.05 USDC</p>
                <p className="text-xs text-gray-500">49 videos left</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="border-t border-gray-800 px-6 pb-6 pt-4">
          {isGenerating ? (
            <div className="space-y-2">
              <div className="h-14 overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-400">
                Generating... {progress}%
              </p>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="h-14 w-full rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-lg font-bold text-white shadow-xl shadow-orange-500/40 transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generate Video ✨
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
