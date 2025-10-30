import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for both frontend and backend (will use RLS policies for security)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For backward compatibility - points to same client
export const supabaseAdmin = supabase

// Database types
export interface User {
  fid: number
  wallet_address: string | null
  credit_balance: number
  total_credits_earned: number
  total_credits_spent: number
  current_streak: number
  longest_streak: number
  last_generation_date: string | null
  total_videos_created: number
  total_templates_used: number
  total_shares: number
  created_at: string
  last_active_at: string
}

export interface VideoTemplate {
  id: string
  creator_fid: number
  video_url: string
  thumbnail_url: string | null
  generation_type: 'profile' | 'bio' | 'text'
  prompt: string
  settings: Record<string, unknown>
  cast_hash: string | null
  cast_url: string | null
  uses_count: number
  is_public: boolean
  is_featured: boolean
  created_at: string
}

export interface CreditTransaction {
  id: string
  user_fid: number
  amount: number
  balance_after: number
  type: 'signup' | 'daily' | 'streak' | 'spend' | 'refund' | 'share' | 'referral' | 'purchase' | 'bonus'
  description: string | null
  related_video_id: string | null
  transaction_hash: string | null
  created_at: string
}

export interface TemplateUse {
  id: string
  template_id: string
  user_fid: number
  generated_video_url: string | null
  created_at: string
}
