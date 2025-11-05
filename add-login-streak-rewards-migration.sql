-- Add Login Streak Rewards System
-- Tracks daily login streaks and awards free videos for 7 consecutive days

-- Add new columns to users table for login streak tracking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_login_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_date DATE,
ADD COLUMN IF NOT EXISTS free_videos_from_login INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_videos_from_generation INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_free_videos_earned INTEGER DEFAULT 0;

-- Create index for login streak queries
CREATE INDEX IF NOT EXISTS idx_users_login_streak
ON users(login_streak DESC);

CREATE INDEX IF NOT EXISTS idx_users_last_login
ON users(last_login_date);

-- Function to update login streak when user logs in
CREATE OR REPLACE FUNCTION update_login_streak(p_user_fid INTEGER)
RETURNS TABLE(
  current_login_streak INTEGER,
  longest_login_streak INTEGER,
  free_video_awarded BOOLEAN,
  streak_continued BOOLEAN,
  streak_broken BOOLEAN
) AS $$
DECLARE
  v_today DATE;
  v_yesterday DATE;
  v_last_login_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_free_videos_from_login INTEGER;
  v_total_free_videos INTEGER;
  v_free_awarded BOOLEAN := FALSE;
  v_streak_continued BOOLEAN := FALSE;
  v_streak_broken BOOLEAN := FALSE;
BEGIN
  v_today := CURRENT_DATE;
  v_yesterday := v_today - INTERVAL '1 day';

  -- Get user's current data
  SELECT
    last_login_date,
    users.login_streak,
    users.longest_login_streak,
    users.free_videos_from_login,
    users.total_free_videos_earned
  INTO
    v_last_login_date,
    v_current_streak,
    v_longest_streak,
    v_free_videos_from_login,
    v_total_free_videos
  FROM users
  WHERE fid = p_user_fid;

  -- Check if user already logged in today
  IF v_last_login_date = v_today THEN
    -- Already logged in today, no changes
    RETURN QUERY
    SELECT
      COALESCE(v_current_streak, 0),
      COALESCE(v_longest_streak, 0),
      FALSE,
      FALSE,
      FALSE;
    RETURN;
  END IF;

  -- Determine new streak
  IF v_last_login_date IS NULL THEN
    -- Brand new user - start streak at 1
    v_current_streak := 1;
    v_streak_continued := TRUE;
  ELSIF v_last_login_date = v_yesterday THEN
    -- Logged in yesterday - continue streak
    v_current_streak := COALESCE(v_current_streak, 0) + 1;
    v_streak_continued := TRUE;

    -- Award free video every 7 consecutive days
    IF v_current_streak % 7 = 0 THEN
      v_free_videos_from_login := COALESCE(v_free_videos_from_login, 0) + 1;
      v_total_free_videos := COALESCE(v_total_free_videos, 0) + 1;
      v_free_awarded := TRUE;
    END IF;
  ELSE
    -- Missed a day - reset streak
    v_current_streak := 1;
    v_streak_broken := TRUE;
  END IF;

  -- Update longest streak
  v_longest_streak := GREATEST(COALESCE(v_longest_streak, 0), v_current_streak);

  -- Update user
  UPDATE users
  SET
    login_streak = v_current_streak,
    longest_login_streak = v_longest_streak,
    last_login_date = v_today,
    free_videos_from_login = v_free_videos_from_login,
    total_free_videos_earned = v_total_free_videos,
    last_active_at = NOW()
  WHERE fid = p_user_fid;

  -- Return results
  RETURN QUERY
  SELECT
    v_current_streak,
    v_longest_streak,
    v_free_awarded,
    v_streak_continued,
    v_streak_broken;
END;
$$ LANGUAGE plpgsql;

-- Function to award free video from generation milestone (every 10 videos)
CREATE OR REPLACE FUNCTION check_generation_milestone(p_user_fid INTEGER, p_total_videos INTEGER)
RETURNS TABLE(
  free_video_awarded BOOLEAN,
  total_free_videos_from_generation INTEGER
) AS $$
DECLARE
  v_free_awarded BOOLEAN := FALSE;
  v_free_videos_from_gen INTEGER;
  v_total_free_videos INTEGER;
BEGIN
  -- Get current free videos count
  SELECT
    free_videos_from_generation,
    total_free_videos_earned
  INTO
    v_free_videos_from_gen,
    v_total_free_videos
  FROM users
  WHERE fid = p_user_fid;

  -- Award free video every 10 videos
  IF p_total_videos > 0 AND p_total_videos % 10 = 0 THEN
    v_free_videos_from_gen := COALESCE(v_free_videos_from_gen, 0) + 1;
    v_total_free_videos := COALESCE(v_total_free_videos, 0) + 1;
    v_free_awarded := TRUE;

    -- Update user
    UPDATE users
    SET
      free_videos_from_generation = v_free_videos_from_gen,
      total_free_videos_earned = v_total_free_videos
    WHERE fid = p_user_fid;

    -- Log credit transaction
    INSERT INTO credit_transactions (
      user_fid,
      amount,
      balance_after,
      type,
      description
    )
    SELECT
      p_user_fid,
      1,
      credit_balance,
      'bonus',
      '🎉 Milestone reward: 10 videos generated! Free video awarded!'
    FROM users
    WHERE fid = p_user_fid;
  END IF;

  -- Return results
  RETURN QUERY
  SELECT v_free_awarded, COALESCE(v_free_videos_from_gen, 0);
END;
$$ LANGUAGE plpgsql;

-- Initialize existing users with default values
UPDATE users
SET
  login_streak = 0,
  longest_login_streak = 0,
  free_videos_from_login = 0,
  free_videos_from_generation = 0,
  total_free_videos_earned = 0
WHERE login_streak IS NULL;
