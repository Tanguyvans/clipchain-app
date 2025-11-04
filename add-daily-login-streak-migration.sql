-- Add Daily Login Streak System
-- Awards free generation every 7 consecutive days of login
-- Separate from video generation milestone (every 10 videos)

-- Add new columns for daily login tracking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_login_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_date DATE;

-- Create index for login streak queries
CREATE INDEX IF NOT EXISTS idx_users_login_streak
ON users(login_streak DESC);

CREATE INDEX IF NOT EXISTS idx_users_last_login
ON users(last_login_date DESC);

-- Function to update daily login streak
CREATE OR REPLACE FUNCTION update_daily_login_streak(p_user_fid INTEGER)
RETURNS TABLE(
  login_streak INTEGER,
  longest_login_streak INTEGER,
  free_generations INTEGER,
  streak_increased BOOLEAN,
  free_gen_awarded BOOLEAN
) AS $$
DECLARE
  v_today DATE;
  v_yesterday DATE;
  v_last_login DATE;
  v_login_streak INTEGER;
  v_longest_login_streak INTEGER;
  v_free_gens INTEGER;
  v_streak_increased BOOLEAN := FALSE;
  v_free_awarded BOOLEAN := FALSE;
BEGIN
  v_today := CURRENT_DATE;
  v_yesterday := v_today - INTERVAL '1 day';

  -- Get user's current data
  SELECT
    last_login_date,
    users.login_streak,
    users.longest_login_streak,
    users.free_generations
  INTO
    v_last_login,
    v_login_streak,
    v_longest_login_streak,
    v_free_gens
  FROM users
  WHERE fid = p_user_fid;

  -- If user doesn't exist, create them
  IF NOT FOUND THEN
    INSERT INTO users (fid, login_streak, longest_login_streak, last_login_date, free_generations)
    VALUES (p_user_fid, 1, 1, v_today, 1)
    RETURNING 1, 1, 1, TRUE, FALSE
    INTO login_streak, longest_login_streak, free_generations, streak_increased, free_gen_awarded;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Check if already logged in today
  IF v_last_login = v_today THEN
    -- Already logged in today, no changes
    RETURN QUERY
    SELECT COALESCE(v_login_streak, 0), COALESCE(v_longest_login_streak, 0), COALESCE(v_free_gens, 1), FALSE, FALSE;
    RETURN;
  END IF;

  -- Check streak status
  IF v_last_login IS NULL THEN
    -- First login ever
    v_login_streak := 1;
    v_streak_increased := TRUE;
  ELSIF v_last_login = v_yesterday THEN
    -- Logged in yesterday - continue streak
    v_login_streak := COALESCE(v_login_streak, 0) + 1;
    v_streak_increased := TRUE;

    -- Award free generation every 7 days (max 3 stored)
    IF v_login_streak % 7 = 0 AND COALESCE(v_free_gens, 0) < 3 THEN
      v_free_gens := LEAST(COALESCE(v_free_gens, 0) + 1, 3);
      v_free_awarded := TRUE;
    END IF;
  ELSE
    -- Streak broken - reset to 1
    v_login_streak := 1;
    v_streak_increased := FALSE;
  END IF;

  -- Update longest streak
  v_longest_login_streak := GREATEST(COALESCE(v_longest_login_streak, 0), v_login_streak);

  -- Update user
  UPDATE users
  SET
    login_streak = v_login_streak,
    longest_login_streak = v_longest_login_streak,
    last_login_date = v_today,
    free_generations = COALESCE(v_free_gens, 1),
    last_active_at = NOW()
  WHERE fid = p_user_fid;

  -- Return values
  RETURN QUERY
  SELECT v_login_streak, v_longest_login_streak, COALESCE(v_free_gens, 1), v_streak_increased, v_free_awarded;
END;
$$ LANGUAGE plpgsql;

-- Initialize existing users with default values
UPDATE users
SET
  login_streak = 0,
  longest_login_streak = 0,
  last_login_date = CURRENT_DATE
WHERE login_streak IS NULL;
