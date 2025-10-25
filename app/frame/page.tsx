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

  return {
    title: "ClipChain Video",
    description: "AI-generated video on ClipChain 🎬✨",
    openGraph: {
      title: "ClipChain Video",
      description: "AI-generated video on ClipChain 🎬✨",
      images: [videoUrl], // Fallback image (will use first frame of video)
    },
    other: {
      // Farcaster Frame video tags
      "fc:frame": "vNext",
      "fc:frame:video": videoUrl,
      "fc:frame:video:type": "video/mp4",
      "fc:frame:image": videoUrl, // Fallback image
      "og:image": videoUrl, // Fallback for OpenGraph
      "og:video": videoUrl,
      "og:video:type": "video/mp4",
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
