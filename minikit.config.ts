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
    name: "Sora-AI",
    subtitle: "Your AI Ad Companion",
    description: "Ads",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["marketing", "ads", "quickstart", "waitlist"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`,
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
  "baseBuilder": {
    "ownerAddress": "0x09692Bda327C8b7346f8e320Ab2793bE00D75481"
  }
} as const;

