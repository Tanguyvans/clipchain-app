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
    "payload": "eyJkb21haW4iOiJuZXctbWluaS1hcHAtcXVpY2tzdGFydC1uYXZ5LnZlcmNlbC5hcHAifQ",
    "signature": "qksw5ZNipSx75JklmTr8O2kH9eR3jcT8CcF2jZI1f0oUX7/wGz+nDVnnwaBKix9n8mNrcBgA1jCz35luOLYSQhw="
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
} as const;

