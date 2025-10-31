-- Seed Default Templates for ClipChain
-- Run this in Supabase SQL Editor to add the 3 core templates

-- First, ensure we have a ClipChain system user (FID 0 = system/official)
INSERT INTO users (fid, credit_balance, total_credits_earned)
VALUES (0, 999999, 999999)
ON CONFLICT (fid) DO NOTHING;

-- Insert the 3 default templates
-- NOTE: video_url is NULL initially - it will be populated with an example video
-- Each time a user generates using this template, it goes to template_uses table
-- We can optionally update video_url to show one of the generated videos as preview
INSERT INTO video_templates (
  creator_fid,
  video_url,
  thumbnail_url,
  generation_type,
  prompt,
  settings,
  uses_count,
  is_public,
  is_featured,
  is_official
) VALUES
  -- Template 1: Profile Dance
  (
    0, -- Official ClipChain template
    NULL, -- Preview video - will show emoji until we add an example
    NULL,
    'profile',
    'Animate this profile picture with subtle, natural movement',
    '{"duration": 5, "style": "dance"}'::jsonb,
    0,
    true,
    true,
    true -- is_official
  ),
  -- Template 2: Bio Speech
  (
    0, -- Official ClipChain template
    NULL, -- Preview video - will show emoji until we add an example
    NULL,
    'bio',
    'Create a professional speech presentation about this bio',
    '{"duration": 10, "style": "speech"}'::jsonb,
    0,
    true,
    true,
    true -- is_official
  ),
  -- Template 3: Custom Text
  (
    0, -- Official ClipChain template
    NULL, -- Preview video - will show emoji until we add an example
    NULL,
    'text',
    'Generate a creative video based on custom text input',
    '{"duration": 5, "style": "creative"}'::jsonb,
    0,
    true,
    true,
    true -- is_official
  )
ON CONFLICT DO NOTHING;

-- Verify the templates were created
SELECT
  id,
  generation_type,
  prompt,
  uses_count,
  is_featured,
  created_at
FROM video_templates
WHERE creator_fid = 0
ORDER BY created_at DESC;
