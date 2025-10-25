import { Suspense } from "react";
import { Metadata } from "next";
import { Loader2 } from "lucide-react";

type Props = {
  searchParams: Promise<{ video?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const videoUrl = params.video ? decodeURIComponent(params.video) : "";

  if (!videoUrl) {
    return {
      title: "ClipChain Video",
      description: "AI-generated video on ClipChain",
    };
  }

  // Generate a thumbnail image URL
  const baseUrl = process.env.NEXT_PUBLIC_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
    || "http://localhost:3000";

  const thumbnailUrl = `${baseUrl}/api/og?text=${encodeURIComponent("ClipChain AI Video")}`;

  return {
    title: "ClipChain Video",
    description: "AI-generated video on ClipChain 🎬✨",
    openGraph: {
      title: "ClipChain Video",
      description: "AI-generated video on ClipChain 🎬✨",
      images: [thumbnailUrl],
      videos: [
        {
          url: videoUrl,
          type: "video/mp4",
        }
      ],
    },
    other: {
      // Farcaster Frame video tags (try MP4)
      "fc:frame": "vNext",
      "fc:frame:video": videoUrl,
      "fc:frame:video:type": "video/mp4",
      "fc:frame:image": thumbnailUrl, // Fallback image
      "og:image": thumbnailUrl,
      "og:video": videoUrl,
      "og:video:type": "video/mp4",
      "og:video:width": "720",
      "og:video:height": "1280",
    },
  };
}

function FrameContent({ videoUrl }: { videoUrl: string }) {
  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-white">No video URL provided</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md aspect-[9/16]">
        <video
          src={videoUrl}
          className="w-full h-full object-cover"
          controls
          autoPlay
          loop
          playsInline
        />
      </div>
    </div>
  );
}

export default async function FramePage({ searchParams }: Props) {
  const params = await searchParams;
  const videoUrl = params.video ? decodeURIComponent(params.video) : "";

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-black">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        </div>
      }
    >
      <FrameContent videoUrl={videoUrl} />
    </Suspense>
  );
}
