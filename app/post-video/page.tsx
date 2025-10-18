"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { toast } from "sonner";
import { Send, Video } from "lucide-react";

export default function PostVideoPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [text, setText] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(true);
  const { composeCast } = useComposeCast();

  const validateUrl = (url: string) => {
    if (!url) return true; // Empty is valid (not required)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    setIsValidUrl(validateUrl(url));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoUrl) {
      toast.error("Please enter a video URL");
      return;
    }

    if (!isValidUrl) {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      // Use MiniKit's composeCast to open native Farcaster compose dialog
      composeCast({
        text: text || "Check out this amazing video!",
        embeds: [videoUrl],
      });

      toast.success("Opening compose dialog...");

      // Optionally clear form after successful submission
      // setVideoUrl("");
      // setText("");
    } catch (error) {
      console.error("Error composing cast:", error);
      toast.error("Failed to open compose dialog");
    }
  };

  const handleQuickFill = () => {
    setVideoUrl("https://v3b.fal.media/files/b/monkey/TvNXEwNfAkR7wUtp0foIV_zugMcRgz.mp4");
    setText("Check out this amazing AI-generated video! 🎥✨");
    toast.success("Example video loaded!");
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-2xl min-h-screen flex flex-col justify-center">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-6 w-6" />
            <CardTitle>Post Video</CardTitle>
          </div>
          <CardDescription>
            Share a video on Farcaster by entering the video URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">
                Video URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="videoUrl"
                type="url"
                value={videoUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com/video.mp4"
                className={!isValidUrl ? "border-red-500" : ""}
                required
              />
              {!isValidUrl && (
                <p className="text-sm text-red-500">Please enter a valid URL</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter the direct URL to your video file (mp4, mov, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">Cast Text (Optional)</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write something about your video..."
                rows={4}
                maxLength={320}
              />
              <p className="text-xs text-muted-foreground text-right">
                {text.length}/320 characters
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={!videoUrl || !isValidUrl}
              >
                <Send className="h-4 w-4 mr-2" />
                Post Video
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleQuickFill}
              >
                Try Example
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {videoUrl && isValidUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Video Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <video
              src={videoUrl}
              className="w-full rounded-lg"
              controls
              playsInline
              onError={() => {
                toast.error("Failed to load video. Check the URL.");
                setIsValidUrl(false);
              }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How it Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ol className="list-decimal list-inside space-y-2">
            <li>Enter the URL of the video you want to share</li>
            <li>Add optional text to describe your video</li>
            <li>Click &quot;Post Video&quot; to open Farcaster&apos;s compose dialog</li>
            <li>Review and edit your post in the native dialog</li>
            <li>Share it with your followers!</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
