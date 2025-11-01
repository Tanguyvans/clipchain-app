-- Add Streak and Free Generation System
-- This migration adds streak tracking and free generation credits

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS streak_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS free_generations INTEGER DEFAULT 1; -- Start with 1 free generation

-- Create index for streak queries
CREATE INDEX IF NOT EXISTS idx_users_streak
ON users(current_streak DESC, last_activity_date);

-- Add comments
COMMENT ON COLUMN users.current_streak IS 'Current consecutive week streak';
COMMENT ON COLUMN users.longest_streak IS 'Longest streak ever achieved';
COMMENT ON COLUMN users.last_activity_date IS 'Last time user generated a video';
COMMENT ON COLUMN users.streak_updated_at IS 'Last time streak was updated/checked';
COMMENT ON COLUMN users.free_generations IS 'Number of free generations available (max 3)';

-- Create a streak_history table to track weekly activity
CREATE TABLE IF NOT EXISTS streak_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_fid INTEGER NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- Monday of that week
  activity_count INTEGER DEFAULT 1,
  free_generation_awarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_fid, week_start)
);

-- Create index for streak history
CREATE INDEX IF NOT EXISTS idx_streak_history_user_week
ON streak_history(user_fid, week_start DESC);

-- Function to calculate current week's Monday
CREATE OR REPLACE FUNCTION get_week_start(check_date TIMESTAMP WITH TIME ZONE)
RETURNS DATE AS $$
BEGIN
  -- Get Monday of the week for the given date
  RETURN (check_date::DATE - ((EXTRACT(DOW FROM check_date)::INTEGER + 6) % 7));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update streak when user generates a video
CREATE OR REPLACE FUNCTION update_user_streak(p_user_fid INTEGER)
RETURNS TABLE(
  current_streak INTEGER,
  free_generations INTEGER,
  streak_increased BOOLEAN,
  free_gen_awarded BOOLEAN
) AS $$
DECLARE
  v_current_week DATE;
  v_last_week DATE;
  v_last_activity_date TIMESTAMP WITH TIME ZONE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_free_gens INTEGER;
  v_streak_broken BOOLEAN := FALSE;
  v_streak_increased BOOLEAN := FALSE;
  v_free_awarded BOOLEAN := FALSE;
BEGIN
  -- Get current week Monday
  v_current_week := get_week_start(NOW());
  v_last_week := v_current_week - INTERVAL '7 days';

  -- Get user's current data
  SELECT
    last_activity_date,
    users.current_streak,
    users.longest_streak,
    users.free_generations
  INTO
    v_last_activity_date,
    v_current_streak,
    v_longest_streak,
    v_free_gens
  FROM users
  WHERE fid = p_user_fid;

  -- Check if this is first activity this week
  IF v_last_activity_date IS NULL OR get_week_start(v_last_activity_date) < v_current_week THEN

    -- Check if streak should continue or break
    IF v_last_activity_date IS NULL THEN
      -- First time user
      v_current_streak := 1;
      v_streak_increased := TRUE;
    ELSIF get_week_start(v_last_activity_date) = v_last_week THEN
      -- Active last week, continue streak
      v_current_streak := COALESCE(v_current_streak, 0) + 1;
      v_streak_increased := TRUE;
    ELSE
      -- Streak broken (missed a week)
      v_current_streak := 1;
      v_streak_broken := TRUE;
    END IF;

    -- Award free generation if streak increased (max 3)
    IF v_streak_increased AND v_free_gens < 3 THEN
      v_free_gens := LEAST(v_free_gens + 1, 3);
      v_free_awarded := TRUE;
    END IF;

    -- Update longest streak
    v_longest_streak := GREATEST(COALESCE(v_longest_streak, 0), v_current_streak);

    -- Update user record
    UPDATE users
    SET
      current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      last_activity_date = NOW(),
      streak_updated_at = NOW(),
      free_generations = v_free_gens
    WHERE fid = p_user_fid;

    -- Record in streak_history
    INSERT INTO streak_history (user_fid, week_start, activity_count, free_generation_awarded)
    VALUES (p_user_fid, v_current_week, 1, v_free_awarded)
    ON CONFLICT (user_fid, week_start)
    DO UPDATE SET activity_count = streak_history.activity_count + 1;

  ELSE
    -- Already active this week, just update activity
    UPDATE users
    SET last_activity_date = NOW()
    WHERE fid = p_user_fid;

    UPDATE streak_history
    SET activity_count = activity_count + 1
    WHERE user_fid = p_user_fid AND week_start = v_current_week;
  END IF;

  -- Return updated values
  RETURN QUERY
  SELECT
    v_current_streak,
    v_free_gens,
    v_streak_increased,
    v_free_awarded;
END;
$$ LANGUAGE plpgsql;

-- Initialize existing users with 1 free generation
UPDATE users
SET free_generations = 1
WHERE free_generations IS NULL OR free_generations = 0;
