-- ClipChain Database Schema
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor > New Query

-- ============================================
-- TABLE 1: Users (Credits & Streaks)
-- ============================================
CREATE TABLE users (
  -- Identity
  fid INTEGER PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE,

  -- Credits
  credit_balance INTEGER DEFAULT 3 CHECK (credit_balance >= 0),
  total_credits_earned INTEGER DEFAULT 3,
  total_credits_spent INTEGER DEFAULT 0,

  -- Streaks
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_generation_date DATE,

  -- Stats
  total_videos_created INTEGER DEFAULT 0,
  total_templates_used INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_wallet ON users(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX idx_users_last_active ON users(last_active_at DESC);
CREATE INDEX idx_users_streak ON users(current_streak DESC);

-- ============================================
-- TABLE 2: Video Templates (Shared Videos)
-- ============================================
CREATE TABLE video_templates (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_fid INTEGER NOT NULL REFERENCES users(fid) ON DELETE CASCADE,

  -- Video
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  generation_type VARCHAR(20) NOT NULL CHECK (generation_type IN ('profile', 'bio', 'text')),

  -- Template (what others copy)
  prompt TEXT NOT NULL,
  settings JSONB DEFAULT '{}',

  -- Social
  cast_hash VARCHAR(66),
  cast_url TEXT,
  uses_count INTEGER DEFAULT 0,

  -- Metadata
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for video_templates
CREATE INDEX idx_templates_creator ON video_templates(creator_fid);
CREATE INDEX idx_templates_trending ON video_templates(uses_count DESC, created_at DESC);
CREATE INDEX idx_templates_recent ON video_templates(created_at DESC) WHERE is_public = true;
CREATE INDEX idx_templates_type ON video_templates(generation_type);
CREATE INDEX idx_templates_featured ON video_templates(is_featured) WHERE is_featured = true;

-- ============================================
-- TABLE 3: Credit Transactions (Audit Trail)
-- ============================================
CREATE TABLE credit_transactions (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_fid INTEGER NOT NULL REFERENCES users(fid) ON DELETE CASCADE,

  -- Transaction
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (
    type IN ('signup', 'daily', 'streak', 'spend', 'refund', 'share', 'referral', 'purchase', 'bonus')
  ),

  -- Context
  description TEXT,
  related_video_id UUID REFERENCES video_templates(id) ON DELETE SET NULL,
  transaction_hash VARCHAR(66),

  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for credit_transactions
CREATE INDEX idx_transactions_user ON credit_transactions(user_fid, created_at DESC);
CREATE INDEX idx_transactions_type ON credit_transactions(type);
CREATE INDEX idx_transactions_video ON credit_transactions(related_video_id) WHERE related_video_id IS NOT NULL;

-- ============================================
-- TABLE 4: Template Uses (Track Usage)
-- ============================================
CREATE TABLE template_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES video_templates(id) ON DELETE CASCADE,
  user_fid INTEGER NOT NULL REFERENCES users(fid) ON DELETE CASCADE,
  generated_video_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Prevent duplicate tracking
  UNIQUE(template_id, user_fid, created_at)
);

-- Indexes for template_uses
CREATE INDEX idx_template_uses_template ON template_uses(template_id);
CREATE INDEX idx_template_uses_user ON template_uses(user_fid);

-- ============================================
-- HELPER FUNCTIONS (Optional but useful)
-- ============================================

-- Function to automatically update last_active_at
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET last_active_at = NOW()
  WHERE fid = NEW.user_fid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_active_at on credit transactions
CREATE TRIGGER trigger_update_last_active
AFTER INSERT ON credit_transactions
FOR EACH ROW
EXECUTE FUNCTION update_last_active();

-- Function to increment template uses
CREATE OR REPLACE FUNCTION increment_template_uses()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE video_templates
  SET uses_count = uses_count + 1
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment uses_count
CREATE TRIGGER trigger_increment_uses
AFTER INSERT ON template_uses
FOR EACH ROW
EXECUTE FUNCTION increment_template_uses();

-- ============================================
-- ROW LEVEL SECURITY (Optional but recommended)
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_uses ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (we'll tighten security later)
CREATE POLICY "Allow all for authenticated users"
ON users FOR ALL
USING (true);

CREATE POLICY "Allow all for templates"
ON video_templates FOR ALL
USING (true);

CREATE POLICY "Allow all for transactions"
ON credit_transactions FOR ALL
USING (true);

CREATE POLICY "Allow all for template uses"
ON template_uses FOR ALL
USING (true);

-- ============================================
-- INITIAL DATA (Optional - for testing)
-- ============================================

-- You can add test data here if you want
-- Example:
-- INSERT INTO users (wallet_address, fid) VALUES ('0x1234...', 123);
