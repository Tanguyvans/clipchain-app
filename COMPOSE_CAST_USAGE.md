# Compose Cast Feature - Usage Guide

This guide explains how to use the new compose cast functionality to post videos on behalf of users.

## Features

1. **POST API Endpoint**: `/api/compose-cast` - Server-side endpoint for posting casts
2. **ComposeCastButton**: Component using MiniKit's native compose dialog
3. **ComposeCastApi**: Component for programmatic cast posting via API

## API Endpoint

### POST `/api/compose-cast`

Posts a cast with a video URL on behalf of an authenticated user.

**Authentication**: Requires Bearer token in Authorization header

**Request Body**:
```json
{
  "videoUrl": "https://example.com/video.mp4",
  "text": "Optional cast text"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Cast composed successfully",
  "data": {
    "userFid": "12345",
    "videoUrl": "https://example.com/video.mp4",
    "text": "Optional cast text",
    "timestamp": "2025-10-18T12:00:00.000Z"
  }
}
```

**Error Responses**:
- `401`: Missing or invalid authentication token
- `400`: Invalid request body or video URL
- `500`: Server error

## Usage Examples

### Option 1: Using MiniKit's Native Compose Dialog (Recommended)

This approach opens Farcaster's native compose dialog, allowing users to edit the cast before posting.

```tsx
import { ComposeCastButton } from "@/components/compose-cast-button";

export default function VideoPage() {
  const videoUrl = "https://example.com/video.mp4";

  return (
    <ComposeCastButton
      videoUrl={videoUrl}
      text="Check out this awesome video!"
      onSuccess={() => console.log("Cast dialog opened")}
      onError={(error) => console.error("Error:", error)}
    />
  );
}
```

### Option 2: Programmatic Posting via API

This approach posts directly to your backend API, which can then publish to Farcaster.

```tsx
import { ComposeCastApi } from "@/components/compose-cast-api";

export default function VideoPage() {
  const videoUrl = "https://example.com/video.mp4";

  return (
    <ComposeCastApi
      videoUrl={videoUrl}
      text="Amazing video content!"
      onSuccess={(data) => console.log("Posted:", data)}
      onError={(error) => console.error("Error:", error)}
    />
  );
}
```

### Integration with Video Page

Add the share button to your video page:

```tsx
// app/video/[videoId]/page.tsx

import { ComposeCastButton } from "@/components/compose-cast-button";

export default function VideoPage({ params }: PageProps) {
  const { videoId } = use(params);
  const video = mockVideos.find((v) => v.id === videoId);

  // ... existing code ...

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* ... existing video content ... */}

      <div className="absolute top-4 right-4 z-50">
        <ComposeCastButton
          videoUrl={video.videoUrl}
          text={`Check out this video by @${video.username}! ${video.description}`}
          onSuccess={() => {
            // Show success toast
            console.log("Share dialog opened!");
          }}
          onError={(error) => {
            // Show error toast
            console.error("Failed to share:", error);
          }}
        />
      </div>
    </div>
  );
}
```

## Setting up Neynar Integration (Optional)

To actually publish casts programmatically, you need to integrate with Neynar:

1. Get a Neynar API key from [neynar.com](https://neynar.com)
2. Add to `.env.local`:
   ```
   NEYNAR_API_KEY=your_api_key_here
   ```

3. Update `/api/compose-cast/route.ts`:

```typescript
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

const neynar = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

// Inside the POST handler, replace the placeholder code:
const cast = await neynar.publishCast({
  signerUuid: userSignerUuid, // You'll need to manage signer UUIDs per user
  text: castText,
  embeds: [{ url: videoUrl }]
});

return NextResponse.json({
  success: true,
  message: "Cast published successfully",
  data: {
    castHash: cast.hash,
    castUrl: `https://warpcast.com/${cast.author.username}/${cast.hash}`,
    ...
  },
});
```

## Best Practices

1. **Use Native Compose**: Prefer `ComposeCastButton` for better UX - users can review before posting
2. **Add Context**: Include meaningful text that describes the video
3. **Handle Errors**: Always implement error handling and show user feedback
4. **Strategic Moments**: Trigger sharing after achievements, likes, or meaningful interactions
5. **Avoid Spam**: Don't auto-post without user consent

## Example: Complete Video Share Flow

```tsx
"use client";

import { useState } from "react";
import { ComposeCastButton } from "@/components/compose-cast-button";
import { toast } from "sonner";

export default function VideoShareExample() {
  const [hasShared, setHasShared] = useState(false);

  return (
    <div className="space-y-4">
      {!hasShared && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm mb-2">Love this video? Share it with your followers!</p>
          <ComposeCastButton
            videoUrl="https://example.com/video.mp4"
            text="Just discovered this amazing video! 🎥"
            onSuccess={() => {
              setHasShared(true);
              toast.success("Share dialog opened!");
            }}
            onError={(error) => {
              toast.error("Failed to open share dialog");
              console.error(error);
            }}
          />
        </div>
      )}
    </div>
  );
}
```

## Testing

Test the endpoint using curl:

```bash
# Get auth token first (from your app's auth flow)
TOKEN="your_jwt_token_here"

# Post a cast
curl -X POST http://localhost:3000/api/compose-cast \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://example.com/video.mp4",
    "text": "Check out this video!"
  }'
```

## Troubleshooting

**401 Unauthorized**:
- Make sure user is authenticated with MiniKit QuickAuth
- Check that the token is valid and not expired

**400 Bad Request**:
- Verify videoUrl is a valid URL
- Check that Content-Type is application/json

**500 Server Error**:
- Check server logs for detailed error messages
- Verify Neynar API key if using programmatic posting
