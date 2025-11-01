-- Add Streak and Free Generation System
-- Simplified version - tracks weekly streaks and free generations

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS free_generations INTEGER DEFAULT 1;

-- Create index for streak queries
CREATE INDEX IF NOT EXISTS idx_users_last_activity
ON users(last_activity_date);

-- Function to calculate current week's Monday
CREATE OR REPLACE FUNCTION get_week_start(check_date TIMESTAMP WITH TIME ZONE)
RETURNS DATE AS $$
BEGIN
  RETURN (check_date::DATE - ((EXTRACT(DOW FROM check_date)::INTEGER + 6) % 7));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update streak when user generates a video
CREATE OR REPLACE FUNCTION update_user_streak(p_user_fid INTEGER)
RETURNS TABLE(
  current_streak INTEGER,
  longest_streak INTEGER,
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
  v_streak_increased BOOLEAN := FALSE;
  v_free_awarded BOOLEAN := FALSE;
BEGIN
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
    -- First activity this week
    IF v_last_activity_date IS NULL THEN
      -- Brand new user
      v_current_streak := 1;
      v_streak_increased := TRUE;
    ELSIF get_week_start(v_last_activity_date) = v_last_week THEN
      -- Active last week - continue streak
      v_current_streak := COALESCE(v_current_streak, 0) + 1;
      v_streak_increased := TRUE;
    ELSE
      -- Missed a week - reset streak
      v_current_streak := 1;
    END IF;

    -- Award free generation (max 3)
    IF v_streak_increased AND v_free_gens < 3 THEN
      v_free_gens := LEAST(v_free_gens + 1, 3);
      v_free_awarded := TRUE;
    END IF;

    -- Update longest streak
    v_longest_streak := GREATEST(COALESCE(v_longest_streak, 0), v_current_streak);

    -- Update user
    UPDATE users
    SET
      current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      last_activity_date = NOW(),
      free_generations = v_free_gens
    WHERE fid = p_user_fid;
  ELSE
    -- Already active this week
    UPDATE users
    SET last_activity_date = NOW()
    WHERE fid = p_user_fid;
  END IF;

  -- Return values
  RETURN QUERY
  SELECT v_current_streak, v_longest_streak, v_free_gens, v_streak_increased, v_free_awarded;
END;
$$ LANGUAGE plpgsql;

-- Initialize existing users
UPDATE users
SET free_generations = 1
WHERE free_generations IS NULL OR free_generations = 0;
