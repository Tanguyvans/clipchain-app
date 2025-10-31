-- Add is_official column to video_templates table
-- Run this in Supabase SQL Editor BEFORE running seed-default-templates.sql

-- Step 1: Make video_url nullable (it's required for templates without videos yet)
ALTER TABLE video_templates
ALTER COLUMN video_url DROP NOT NULL;

-- Step 2: Add the is_official column
ALTER TABLE video_templates
ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;

-- Step 3: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_templates_official
ON video_templates(is_official)
WHERE is_official = true;

-- Step 4: Update existing templates where creator_fid = 0 to be official
UPDATE video_templates
SET is_official = true
WHERE creator_fid = 0;

-- Verify the change
SELECT id, creator_fid, generation_type, video_url, is_official, is_featured
FROM video_templates
ORDER BY is_official DESC, created_at DESC
LIMIT 10;
