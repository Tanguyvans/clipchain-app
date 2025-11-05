# ClipChain Rewards System

## Overview

ClipChain now features a comprehensive rewards system that incentivizes user engagement through **daily login streaks** and **video generation milestones**.

## Reward Mechanics

### 1. Daily Login Streak Rewards 🔥

**How it works:**
- Users earn a **free video generation** for every **7 consecutive days** of logging in
- Streaks are tracked daily (login required each calendar day)
- Missing a day resets the streak to 1
- All earned free videos are tracked and displayed

**Features:**
- Real-time streak counter in profile
- Visual progress bar showing days until next reward
- Milestone dots (7 total) indicating progress
- Notification when free video is unlocked
- Stats showing best streak and total free videos earned

**Database Tracking:**
- `login_streak` - Current consecutive daily logins
- `longest_login_streak` - Best streak ever achieved
- `last_login_date` - Date of last login
- `free_videos_from_login` - Total free videos earned from login streaks

### 2. Video Generation Milestone Rewards 🎬

**How it works:**
- Users earn a **free video generation** for every **10 videos** they create
- Counter increments with each successful video generation
- Rewards awarded automatically at milestones (10, 20, 30, etc.)

**Features:**
- Visual progress tracker in profile
- Progress bar showing videos until next free generation
- 10 milestone dots showing current progress
- Notification when milestone reward is earned

**Database Tracking:**
- `total_videos_created` - Total videos generated
- `free_videos_from_generation` - Total free videos earned from generation milestones
- `total_free_videos_earned` - Combined total from all reward sources

## Implementation Details

### Database Schema

New columns added to `users` table:

```sql
- login_streak INTEGER DEFAULT 0
- longest_login_streak INTEGER DEFAULT 0
- last_login_date DATE
- free_videos_from_login INTEGER DEFAULT 0
- free_videos_from_generation INTEGER DEFAULT 0
- total_free_videos_earned INTEGER DEFAULT 0
```

### Database Functions

**`update_login_streak(p_user_fid INTEGER)`**
- Called when user logs in
- Updates login streak based on last login date
- Awards free video every 7 consecutive days
- Returns streak info and whether reward was awarded

**`check_generation_milestone(p_user_fid INTEGER, p_total_videos INTEGER)`**
- Called after video generation
- Checks if user reached a multiple of 10 videos
- Awards free video at milestones
- Logs transaction to credit_transactions table

### API Routes

**`GET/POST /api/user/login-streak`**
- GET: Retrieves current login streak data
- POST: Records login and updates streak
- Returns: streak count, days until reward, free videos earned

**`GET/POST /api/user/streak`**
- GET: Retrieves video generation count
- POST: Increments counter after video generation
- Updated to award free video every **10 videos** (changed from 7)

### UI Components

**`<LoginStreakCard />`** (`components/login-streak-card.tsx`)
- Displays current login streak with fire icon 🔥
- Shows progress bar (7-day cycle)
- Displays milestone dots for visual progress
- Shows best streak and total free videos earned
- Animated notification when reward is unlocked
- "Continue streak" button with encouragement

**Profile Page Updates** (`components/profile-page.tsx`)
- Integrated LoginStreakCard component
- Updated video generation counter to show 10-video milestones
- Enhanced visual design with gradient borders
- Added milestone dots for both streaks

### Authentication Integration

**`useAuth` Hook** (`hooks/useAuth.tsx`)
- Automatically tracks login when user loads the app
- Calls `/api/user/login-streak` API in background
- Logs notification if free video was awarded
- Silent operation - no interruption to user flow

## User Experience Flow

### Login Streak Flow

1. User opens the app
2. Auth hook automatically calls login-streak API
3. Database checks last login date:
   - Same day: No change
   - Yesterday: Increment streak
   - Missed day: Reset to 1
4. If 7-day milestone reached → Award free video
5. Profile page displays updated streak with animation

### Video Generation Flow

1. User generates video successfully
2. Create page calls `/api/user/streak` POST
3. Database increments `total_videos_created`
4. If count is multiple of 10 → Award free video
5. UI shows notification and updates progress bar

## Migration Instructions

To apply the new rewards system to your database:

1. Open your Supabase dashboard
2. Navigate to SQL Editor
3. Run the migration file: `add-login-streak-rewards-migration.sql`
4. The migration will:
   - Add new columns to users table
   - Create database functions for streak tracking
   - Initialize existing users with default values
   - Create indexes for performance

## Benefits

### For Users
- Free video generations through engagement
- Gamification encourages daily logins
- Clear visual progress tracking
- Multiple ways to earn rewards

### For Platform
- Increased daily active users (DAU)
- Higher user retention
- More consistent engagement
- Viral growth through sustained usage

## Future Enhancements

Potential additions to the rewards system:

1. **Weekly Challenges**: Complete specific tasks for bonus rewards
2. **Referral Rewards**: Earn free videos for inviting friends
3. **Template Usage Bonuses**: Rewards for popular templates
4. **Social Sharing Rewards**: Free videos for sharing to Farcaster
5. **Tiered Rewards**: Unlock better rewards at higher streak levels
6. **Achievement Badges**: Visual badges for milestones (30-day streak, 100 videos, etc.)

## Technical Notes

- All database operations use PostgreSQL functions for atomicity
- Streak calculations account for timezone differences
- Credit transactions logged for audit trail
- Rewards system is backward compatible with existing users
- Failed generations don't increment counters
- Refunds are properly handled and don't affect streaks

## Testing Checklist

- [ ] New user signup creates default streak values
- [ ] Daily login increments streak correctly
- [ ] Missed day resets streak to 1
- [ ] 7-day streak awards free video
- [ ] Video generation increments counter
- [ ] 10-video milestone awards free video
- [ ] Profile UI displays streaks correctly
- [ ] Animations show on reward unlock
- [ ] Database functions handle edge cases
- [ ] Credit transactions logged properly

## Support

For issues or questions about the rewards system:
- Check database logs for streak function calls
- Verify API responses in browser console
- Review credit_transactions table for audit trail
- Ensure migration ran successfully
