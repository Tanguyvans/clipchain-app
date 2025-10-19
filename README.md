# ClipChain - AI Video Generation Mini App

**ClipChain is a Base mini app that generates AI-powered videos from your prompts using advanced video generation models. Compete on the leaderboard by creating the most shareable content, ranked by total recasts on Farcaster.**

## What is ClipChain?

ClipChain transforms your ideas into viral AI-generated videos instantly within the Base App. Users can:

- **Generate AI Videos**: Create videos from text prompts using AI video generation
- **Share on Farcaster**: Post your videos with #clipchain to the Farcaster network
- **Compete on Leaderboard**: Climb the rankings as your videos get recasted
- **Discover Viral Content**: Browse a TikTok-style feed of AI-generated videos from the community

The app features:

- 🎬 AI video generation and upload
- 📱 Vertical video feed with infinite scroll
- 🏆 Leaderboard ranked by recast count
- 🔄 Native Farcaster integration via Minikit (recast, compose cast)
- 📊 Real-time engagement metrics from Farcaster

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Farcaster Integration**: OnchainKit Minikit SDK
- **Data Source**: Neynar API (Farcaster data)
- **Deployment**: Vercel

## Prerequisites

Before getting started, make sure you have:

- Node.js 18+ installed
- A [Farcaster](https://farcaster.xyz/) account
- [Neynar API Key](https://neynar.com) (free tier works, paid tier unlocks search)
- [Vercel](https://vercel.com/) account for deployment (optional)

## Getting Started

### 1. Clone this repository

```bash
git clone https://github.com/your-repo/clipchain.git
cd clipchain
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```bash
# Required: Your production URL (leave empty for local development)
NEXT_PUBLIC_URL=

# Required: Neynar API Key for Farcaster data
# Get yours at https://neynar.com
NEYNAR_API_KEY=your_neynar_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## How It Works

ClipChain uses the [#clipchain](https://warpcast.com/~/search?q=%23clipchain) hashtag to track and rank content:

1. **Video Feed**: Searches Farcaster for casts with `#clipchain` hashtag containing `.mp4` video URLs
2. **Leaderboard**: Aggregates all videos by user and ranks by total recast count
3. **Native Actions**: Users can recast videos directly in the app using Minikit's `composeCast` hook
4. **Real-time Data**: Powered by Neynar API for live engagement metrics (likes, recasts, comments)

**Note**: The search functionality requires a paid Neynar plan ($9/month). Free tier supports basic API access but not `searchCasts()`.

## Customization

### Update Manifest Configuration

The [minikit.config.ts](minikit.config.ts) file configures your manifest located at [app/.well-known/farcaster.json](app/.well-known/farcaster.json).

**Skip the `accountAssociation` object for now.**

To personalize your app:

1. Update the `name`, `subtitle`, and `description` fields
2. Add custom images to the `/public` folder (app logo, hero image, icon)
3. Update the image URLs in the config file
4. Modify the `tags` array to match your app's category

## Deployment

### 1. Deploy to Vercel

```bash
vercel --prod
```

You should have a URL deployed to a domain similar to: `https://your-vercel-project-name.vercel.app/`

### 2. Update environment variables

Add your production URL to your local `.env.local` file:

```bash
NEXT_PUBLIC_URL=https://your-vercel-project-name.vercel.app/
NEYNAR_API_KEY=your_neynar_api_key_here
```

### 3. Upload environment variables to Vercel

Add environment variables to your production environment:

```bash
vercel env add NEXT_PUBLIC_URL production
vercel env add NEYNAR_API_KEY production
```

## Account Association

### 1. Sign Your Manifest

1. Navigate to [Farcaster Manifest tool](https://farcaster.xyz/~/developers/mini-apps/manifest)
2. Paste your domain in the form field (ex: `your-vercel-project-name.vercel.app`)
3. Click the `Generate account association` button and follow the on-screen instructions for signing with your Farcaster wallet
4. Copy the `accountAssociation` object

### 2. Update Configuration

Update your [minikit.config.ts](minikit.config.ts) file to include the `accountAssociation` object:

```ts
export const minikitConfig = {
    accountAssociation: {
        "header": "your-header-here",
        "payload": "your-payload-here",
        "signature": "your-signature-here"
    },
    frame: {
        // ... rest of your frame configuration
    },
}
```

### 3. Deploy Updates

```bash
vercel --prod
```

## Testing and Publishing

### 1. Preview Your App

Go to [base.dev/preview](https://base.dev/preview) to validate your app:

1. Add your app URL to view the embeds and click the launch button to verify the app launches as expected
2. Use the "Account association" tab to verify the association credentials were created correctly
3. Use the "Metadata" tab to see the metadata added from the manifest and identify any missing fields

### 2. Publish to Base App

To publish your app, create a post in the Base app with your app's URL.

### 3. Start Posting with #clipchain

For your videos to appear in the feed and leaderboard:

1. Create a cast on Farcaster with your video URL (must end in `.mp4`)
2. Include the `#clipchain` hashtag in your cast text
3. Videos will automatically appear in the ClipChain feed
4. Leaderboard rankings update based on total recasts across all your #clipchain videos

## API Routes

ClipChain includes the following API endpoints:

- `GET /api/videos` - Fetches all #clipchain casts containing .mp4 videos
- `GET /api/leaderboard` - Aggregates users by total recasts on #clipchain videos
- `POST /api/compose-cast` - Server-side endpoint for composing casts (authentication required)

## Learn More

- [Create a Mini App tutorial](https://docs.base.org/docs/mini-apps/quickstart/create-new-miniapp/) - Base documentation
- [OnchainKit Minikit](https://onchainkit.xyz/minikit/introduction) - Minikit SDK documentation
- [Neynar API](https://docs.neynar.com/) - Farcaster data API
- [Farcaster](https://www.farcaster.xyz/) - Decentralized social protocol
