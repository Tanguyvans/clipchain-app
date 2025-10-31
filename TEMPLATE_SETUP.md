# Template System Setup Guide

## ✅ What's Been Done

### 1. Database Schema
- `video_templates` table exists in Supabase
- Tracks: video_url, creator_fid, prompt, uses_count, is_featured, etc.

### 2. API Endpoints
- **GET /api/templates/trending** - Fetches all templates from database
  - Sorts by: featured first, then usage count, then created date
  - Adds template names/emojis/gradients for display
  - Fetches creator info from Neynar for user templates

- **POST /api/templates/save** - Saves new templates when users share videos

### 3. Frontend (Create Page)
- TikTok-style 2-column grid
- Shows video previews OR emoji+gradient fallback
- Displays template name, creator, and usage count
- Loading skeletons while fetching
- Floating + button for custom creation

### 4. Auto-Save Templates
- When users share videos to Farcaster, they auto-save as templates
- Tracks prompt, generation type, and settings

---

## 🚀 Next Step: Add Default Templates to Database

### Run this SQL in Supabase:

```sql
-- Located in: seed-default-templates.sql
```

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Open `seed-default-templates.sql` from this project
4. Run the SQL script
5. Verify 3 templates were created

This will create:
- Make Your Profile Dance (profile template)
- Bio Speech Presentation (bio template)
- Custom Text Video (text template)

All marked as `is_featured = true` and `creator_fid = 0` (official)

---

## 📝 How It Works

### Template Creation Flow:
1. User generates video (profile/bio/text)
2. User shares to Farcaster
3. Template auto-saves to database with:
   - video_url (the generated video)
   - prompt (what was used to generate it)
   - generation_type (profile/bio/text)
   - creator_fid (the user who created it)
   - uses_count = 0

### Template Usage Flow:
1. User opens Create page
2. Sees all templates (official + community)
3. Clicks a template
4. Generates video using template's prompt BUT their own data
5. Template's uses_count increments in database

### Preview Logic:
- If template has `video_url` → show video preview
- If no video → show emoji + gradient background
- Official templates (FID 0) show as "Template Name"
- User templates show as "Template Name by @username"

---

## 🎯 Current Status

**Working:**
- ✅ Database schema
- ✅ API endpoints
- ✅ Frontend display
- ✅ Auto-save on share
- ✅ Usage count tracking

**To Do:**
- ⏳ Run SQL to seed default templates
- ⏳ Generate example videos for default templates (optional)
- ⏳ Implement + button custom creation page

---

## 🔧 Future Enhancements

1. **Auto-update template preview**: When someone uses a template, randomly pick their generated video as the new preview
2. **Template analytics**: Track which templates are most popular
3. **Template categories**: Filter by profile/bio/text
4. **Search templates**: Search by creator or keywords
5. **Featured section**: Highlight trending templates
