const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  "accountAssociation": {
    "header": "eyJmaWQiOjUwNjQyMCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDAxMTIyNGZFOWU3NTJkNDRiREExNzIxQTRmQUZkRGQ4NjhiYzRCMkQifQ",
    "payload": "eyJkb21haW4iOiJuZXctbWluaS1hcHAtcXVpY2tzdGFydC1waS1uaW5lLnZlcmNlbC5hcHAifQ",
    "signature": "ZuM/2UAQNaPFrdnDEyW7hz/RtAuXpfV0+yH+WSepLfFhtV5Ug3/otPjblcyD4uNGe43Rn/l+zQQ5DCzAISiT1hw="
  },
  miniapp: {
    version: "1",
    name: "ClipChain",
    subtitle: "AI video generation platform",
    description: "Create stunning AI-powered videos from text prompts, animate your profile picture with dancing moves, or generate professional bio presentations. Share your creations in the /clipchain channel!",
    screenshotUrls: [`${ROOT_URL}/portrait.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/banner.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["ai", "video", "content-creation", "social"],
    heroImageUrl: `${ROOT_URL}/banner.png`,
    tagline: "AI-powered video creation",
    ogTitle: "ClipChain - AI Video Generation",
    ogDescription: "Create stunning AI-powered videos with ClipChain. Animate your profile, generate bio presentations, and share on Farcaster.",
    ogImageUrl: `${ROOT_URL}/banner.png`,
  },
  "baseBuilder": {
    "ownerAddress": "0x09692Bda327C8b7346f8e320Ab2793bE00D75481"
  }
} as const;

