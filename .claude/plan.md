# ClipChain Development Plan

## 🎯 Project Overview
ClipChain is a Farcaster mini app for AI video generation with a TikTok-style feed, user-generated templates, credits system, and social features.

---

## 🗂️ Current Architecture

### Database (Supabase)
**Tables:**
- `users` - FID (primary key), wallet_address, credits, streaks, stats
- `video_templates` - User-generated templates for discovery
- `credit_transactions` - Audit trail of all credit changes
- `template_uses` - Track when users remix templates

**Authentication:**
- Farcaster Quick Auth (FID-based)
- Auto-creates users with 3 free credits on first app open
- No manual sign-in required

### Credit System
- **Free Credits:** 3 credits on signup
- **Streak Bonuses:**
  - 3 days = +1 credit
  - 7 days = +2 credits
  - 30 days = +5 credits
- **Share Bonus:** +1 credit when sharing to Farcaster
- **Cost:** 1 credit per video generation (or 0.25 USDC payment option)

### Creator Monetization (Future)
- Track template usage count in database
- Template creators earn USDC when others use their templates
- Payment distribution happens automatically based on `uses_count`
- Example: 0.05 USDC per template use → creator earns passive income

### Current Pages
1. **Feed** - TikTok-style vertical video feed from /clipchain channel
2. **Discover** - User's own profile generation (profile pic animation, bio video)
3. **Create** - Text prompt to video generation
4. **Leaderboard** - Top creators by videos, likes, engagement
5. **Profile** - User's videos and stats

---

## 🚀 Planned Features & Improvements

### Priority 1: Template System (HIGH IMPACT)

#### Problem
- No way for users to discover and reuse popular video styles
- Templates are hardcoded, not user-generated
- Missing viral/social sharing loop

#### Solution: User-Generated Templates

**Template Creation Flow:**
```
User generates video → Shares to Farcaster → Auto-saves as template
                                   ↓
Template appears in:
  - Discover Tab (Browse templates)
  - Feed (Use Template button)
  - Create Tab (Quick templates section)
```

**What Gets Saved:**
- Video URL (preview)
- Prompt used
- Generation type (profile/bio/text)
- Settings/parameters
- Creator FID
- Cast hash/URL

**What Others Get:**
- Copy the prompt
- Copy the settings
- Use THEIR OWN data (profile/bio)
- Generate NEW video with same style

**Database Integration:**
```typescript
// When sharing to Farcaster
await saveVideoTemplate(
  creatorFid: number,
  videoUrl: string,
  prompt: string,
  generationType: 'profile' | 'bio' | 'text',
  settings: Record<string, unknown>,
  castHash?: string,
  castUrl?: string
)

// When someone uses template
await trackTemplateUse(
  templateId: string,
  userFid: number,
  generatedVideoUrl?: string
)
// Auto-increments template.uses_count via DB trigger
```

---

### Priority 2: Navigation Refactor

#### Current Structure (Confusing)
- Discover = Your own profile generation
- Create = Text prompt

#### New Structure (Clear Purpose)

**1. Discover Tab → Template Browser**
```
┌─────────────────────────────────────────┐
│ 🔍 Discover                             │
│ Find trending AI video templates        │
├─────────────────────────────────────────┤
│ [Trending] [Recent] [Most Used]         │
│                                          │
│ ┌──────────┐ ┌──────────┐              │
│ │ [VIDEO]  │ │ [VIDEO]  │  2-col grid  │
│ │ Preview  │ │ Preview  │  Auto-play   │
│ ├──────────┤ ├──────────┤              │
│ │ 🎭 Dance │ │ 🎤 Talk  │              │
│ │ @tanguy  │ │ @alice   │              │
│ │ 🔥 1.2k  │ │ 🔥 856   │              │
│ │ [Use]    │ │ [Use]    │              │
│ └──────────┘ └──────────┘              │
│                                          │
│ (Infinite scroll for more)              │
└─────────────────────────────────────────┘
```

**Features:**
- Video grid (2 columns, vertical scroll)
- Auto-playing previews (muted)
- Filter tabs: Trending / Recent / Most Used
- Creator attribution + avatar
- Use count with fire emoji
- "Use This" button → takes to Create tab

**2. Create Tab → Template + Custom Generation**
```
┌─────────────────────────────────────────┐
│ ✨ Create                               │
├─────────────────────────────────────────┤
│ 📚 Quick Templates (NEW)                │
│ ┌────────────────────────────────────┐ │
│ │ [💃 Dancing] [🎤 Speech] [🎨...]   │ │
│ │  Horizontal scroll carousel        │ │
│ └────────────────────────────────────┘ │
│                                          │
│ ─────────────────────────────────────── │
│                                          │
│ ✨ Custom Creation                      │
│ ┌────────────────────────────────────┐ │
│ │ 💃 Animate My Profile              │ │
│ │ [Generate for 0.25 USDC]           │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ 🎤 Bio Speech Video                │ │
│ │ [Generate for 0.25 USDC]           │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ 🎨 Text to Video                   │ │
│ │ [Type prompt...]                   │ │
│ │ [Generate for 0.25 USDC]           │ │
│ └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Features:**
- Quick templates carousel at top
- Custom creation options below
- Templates show preview + use count
- One-tap to use template

---

### Priority 3: Feed "Use Template" Button

**Current Feed:**
- Right side action buttons: Like, Recast, Comment, Share, Generate (✨)
- Generate button exists but not wired up

**Enhancement:**
Wire up existing Generate/Sparkles button to open template modal

**Template Modal UI:**
```
┌─────────────────────────────────────────┐
│ Use This Template               [X]     │
├─────────────────────────────────────────┤
│ 🎭 Dancing Profile Animation            │
│ Created by @tanguy                       │
│ 🔥 1,234 people used this                │
│                                          │
│ 💬 Prompt:                               │
│ "Make profile dance with disco moves"    │
│                                          │
│ ──────────────────────────────────────  │
│                                          │
│ Choose your input:                       │
│ ○ Use My Profile Picture                │
│ ○ Use My Bio                             │
│ ○ Custom Text                            │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ Generate for 0.25 USDC             │  │
│ └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Implementation:**
```typescript
// In feed-page.tsx VideoCard
const handleUseTemplate = () => {
  // Fetch template details
  const template = await fetch(`/api/templates/${video.castHash}`)

  // Show modal with template info
  setSelectedTemplate(template)
  setShowTemplateModal(true)
}
```

---

### Priority 4: Streak System Integration

**Current State:**
- Streak functions exist in `lib/credits.ts`
- Not integrated into generation flow
- No UI feedback

**Implementation:**

**1. Check Streak on Generation:**
```typescript
// In generate API routes
const streakResult = await checkDailyStreak(userFid)

if (streakResult.bonusCredits > 0) {
  // Award bonus credits (3/7/30 day milestones)
  return {
    success: true,
    videoUrl,
    streakBonus: {
      credits: streakResult.bonusCredits,
      streak: streakResult.newStreak
    }
  }
}
```

**2. Show Streak Celebration:**
```
┌─────────────────────────────────────────┐
│ 🔥 STREAK BONUS! 🔥                     │
│                                          │
│ You're on a 7-day streak!                │
│ +2 bonus credits earned!                 │
│                                          │
│ Current Balance: 8 credits               │
│                                          │
│ Next milestone: 30 days = +5 credits     │
└─────────────────────────────────────────┘
```

**3. Display Streak in UI:**
- Header: Show current streak with fire emoji
- Profile: Show longest streak stat
- Credits badge: Already implemented

---

### Priority 5: Leaderboard Time Periods

**Current State:**
- Shows all-time stats only
- No time-based filtering

**Enhancement:**
Add period selector with filters

**UI Update:**
```
┌─────────────────────────────────────────┐
│ 🏆 Leaderboard                          │
├─────────────────────────────────────────┤
│ [Today] [Week] [Month] [All Time]      │ ← NEW
│                                          │
│ 1. @tanguy  ────────────── 1.2K videos  │
│ 2. @alice   ────────────── 856 videos   │
│ ...                                      │
└─────────────────────────────────────────┘
```

**API Update:**
```typescript
// /api/leaderboard?period=week
export async function GET(request: NextRequest) {
  const period = searchParams.get('period') || 'all'

  let dateFilter = ''
  if (period === 'today') dateFilter = "created_at >= NOW() - INTERVAL '1 day'"
  if (period === 'week') dateFilter = "created_at >= NOW() - INTERVAL '7 days'"
  if (period === 'month') dateFilter = "created_at >= NOW() - INTERVAL '30 days'"

  // Apply filter to queries
}
```

**Database Schema Addition:**
```sql
-- Add indexes for time-based queries
CREATE INDEX idx_videos_created_at ON video_templates(created_at DESC);
CREATE INDEX idx_transactions_created_at ON credit_transactions(created_at DESC);
```

---

### Priority 6: Frame Posting Improvements

**Current Issue:**
- Videos posted to Farcaster show video URL directly
- No thumbnail preview in feed
- Poor engagement

**Solution:**
Extract first frame as thumbnail image

**Implementation:**

**1. Generate Thumbnail:**
```typescript
// New function in /lib/video-utils.ts
export async function extractFirstFrame(videoUrl: string): Promise<string> {
  // Option A: Use fal.ai thumbnail extraction
  const response = await fal.subscribe("fal-ai/video-thumbnail", {
    input: { video_url: videoUrl, timestamp: 0 }
  })
  return response.thumbnail_url

  // Option B: Use canvas API (client-side)
  // Option C: Use FFmpeg serverless function
}
```

**2. Update Compose Cast:**
```typescript
// In handlePostVideo()
const thumbnailUrl = await extractFirstFrame(generatedVideoUrl)

composeCast({
  text: castText,
  embeds: [
    thumbnailUrl,        // Image preview (shows in feed)
    generatedVideoUrl    // Video link (click to play)
  ],
  channelKey: "clipchain"
})
```

**Frame Format:**
```
┌─────────────────────────────────────────┐
│ Check out my animated profile! 💃✨     │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │    [THUMBNAIL IMAGE PREVIEW]        │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ 🎬 Watch video: [generatedVideoUrl]     │
│                                          │
│ Generated with @clipchain                │
└─────────────────────────────────────────┘
```

---

## 📋 Implementation Roadmap

### Week 1: Template System
- [x] Database schema (already done)
- [ ] `/api/templates/trending` endpoint
- [ ] Save template on Farcaster share
- [ ] New Discover tab (template browser)
- [ ] Update Create tab (add templates section)
- [ ] Wire up Feed "Use Template" button

### Week 2: Engagement Features
- [ ] Streak checking on generation
- [ ] Streak celebration UI
- [ ] Leaderboard time periods
- [ ] Trending indicators

### Week 3: Polish & Viral Features
- [ ] Frame posting with thumbnails
- [ ] Template search/filtering
- [ ] Creator profiles
- [ ] Share analytics

---

## 🎨 Design System

### Colors
```css
Background: #0A0A0A (dark)
Cards: Gradient borders (purple/orange/blue)
Text Primary: White
Text Secondary: Gray-400
Accent CTA: Orange-500
Success: Green-500
Warning: Red-500
```

### Card Styles
```css
rounded-xl corners
Subtle gradient backgrounds
Blur backdrop effects
Hover: scale-[1.02]
Active: scale-95
```

### Typography
```css
Headers: Bold, white
Body: Regular, gray-400
Stats: Small, with emoji icons
```

---

## 🔧 Technical Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TailwindCSS
- Farcaster Mini App SDK
- OnchainKit (Coinbase)

**Backend:**
- Next.js API Routes
- Supabase (Postgres)
- Fal.ai (Video Generation)

**Authentication:**
- Farcaster Quick Auth
- FID-based user identification

**Payments:**
- Base USDC (0.25 per generation)
- MiniKit sendToken

---

## 🐛 Known Issues & Fixes

### Issue 1: Feed Video Skipping ✅ FIXED
**Problem:** When scrolling feed, videos skip/don't play
**Solution:**
- Use intersection ratio to find most visible video
- Multiple thresholds [0, 0.1, 0.2, ..., 1.0]
- `scroll-snap-stop: always` for reliable snapping

### Issue 2: TypeScript Build Errors ✅ FIXED
**Problem:** `any` type causing ESLint errors
**Solution:** Replace `Record<string, any>` with `Record<string, unknown>`

### Issue 3: Credits Not Auto-Loading ✅ FIXED
**Problem:** Users had to manually sign in
**Solution:** Auto-fetch user + credits from Farcaster context on app load

---

## 📊 Success Metrics

### User Engagement
- Daily Active Users (DAU)
- Videos generated per user
- Template usage rate
- Streak retention (7-day, 30-day)

### Viral Growth
- Share rate (videos posted to Farcaster)
- Template remix rate
- Discovery → Generation conversion
- Feed → Template usage rate

### Monetization
- Credits purchased
- USDC payment volume
- Average credits per user

---

## 🎯 Next Steps

**Immediate (This Week):**
1. Create `/api/templates/trending` endpoint
2. Update `handlePostVideo()` to save templates
3. Build Discover tab template browser
4. Add Quick Templates section to Create tab
5. Wire up Feed "Use Template" button

**Short Term (Next 2 Weeks):**
6. Implement streak checking on generation
7. Add leaderboard time periods
8. Frame posting with thumbnails
9. Template search/filtering

**Long Term (Month 2+):**
10. Creator analytics dashboard
11. Premium templates (paid)
12. Collaborative templates
13. Template categories/tags
14. Remix chains (see who remixed what)

---

## 📝 Notes

- All templates are user-generated (no hardcoded templates)
- Templates save prompt + settings, NOT the video itself
- Users generate new videos with their own data
- Credits auto-create on first app open (no signup flow)
- Streak bonuses drive daily retention
- Template discovery drives viral growth
- Feed integration increases template usage
