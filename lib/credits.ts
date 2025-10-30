import { supabaseAdmin } from './supabase'

/**
 * Get or create a user with 3 free credits
 */
export async function getOrCreateUser(fid: number, walletAddress?: string) {
  // Check if user exists
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('fid', fid)
    .single()

  if (existing && !fetchError) {
    // Update wallet if provided and different
    if (walletAddress && existing.wallet_address !== walletAddress) {
      await supabaseAdmin
        .from('users')
        .update({ wallet_address: walletAddress })
        .eq('fid', fid)
    }
    return { user: existing, isNew: false }
  }

  // Create new user with 3 free credits
  const { data: newUser, error: createError } = await supabaseAdmin
    .from('users')
    .insert({
      fid: fid,
      wallet_address: walletAddress || null,
      credit_balance: 3,
      total_credits_earned: 3
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating user:', createError)
    throw new Error('Failed to create user')
  }

  // Log signup bonus transaction
  await supabaseAdmin
    .from('credit_transactions')
    .insert({
      user_fid: fid,
      amount: 3,
      balance_after: 3,
      type: 'signup',
      description: '🎉 Welcome bonus - 3 free generations!'
    })

  console.log('✅ New user created with 3 free credits, FID:', fid)

  return { user: newUser, isNew: true }
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(fid: number) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('credit_balance, current_streak')
    .eq('fid', fid)
    .single()

  if (error || !data) {
    return { credits: 0, streak: 0 }
  }

  return { credits: data.credit_balance, streak: data.current_streak }
}

/**
 * Spend a credit for generation
 */
export async function spendCredit(
  fid: number,
  generationType: 'profile' | 'bio' | 'text'
) {
  // Get current balance
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('credit_balance, total_credits_spent, total_videos_created')
    .eq('fid', fid)
    .single()

  if (!user || user.credit_balance < 1) {
    return {
      success: false,
      error: 'Insufficient credits',
      currentBalance: user?.credit_balance || 0
    }
  }

  const newBalance = user.credit_balance - 1

  // Deduct credit
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      credit_balance: newBalance,
      total_credits_spent: user.total_credits_spent + 1,
      total_videos_created: user.total_videos_created + 1,
      last_active_at: new Date().toISOString()
    })
    .eq('fid', fid)

  if (updateError) {
    console.error('Error spending credit:', updateError)
    return { success: false, error: 'Failed to deduct credit' }
  }

  // Log transaction
  await supabaseAdmin
    .from('credit_transactions')
    .insert({
      user_fid: fid,
      amount: -1,
      balance_after: newBalance,
      type: 'spend',
      description: `Generated ${generationType} video`
    })

  console.log('💳 Credit spent, FID:', fid, '→ Balance:', newBalance)

  return {
    success: true,
    remainingCredits: newBalance
  }
}

/**
 * Refund a credit (when generation fails)
 */
export async function refundCredit(fid: number, reason: string) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('credit_balance')
    .eq('fid', fid)
    .single()

  if (!user) return

  const newBalance = user.credit_balance + 1

  await supabaseAdmin
    .from('users')
    .update({ credit_balance: newBalance })
    .eq('fid', fid)

  await supabaseAdmin
    .from('credit_transactions')
    .insert({
      user_fid: fid,
      amount: 1,
      balance_after: newBalance,
      type: 'refund',
      description: `🔄 Refund: ${reason}`
    })

  console.log('🔄 Credit refunded, FID:', fid, '→ Balance:', newBalance)
}

/**
 * Check and update daily streak
 */
export async function checkDailyStreak(fid: number) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('fid', fid)
    .single()

  if (!user) return { bonusCredits: 0, newStreak: 0 }

  const today = new Date().toISOString().split('T')[0]
  const lastDate = user.last_generation_date

  // Already generated today
  if (lastDate === today) {
    return { bonusCredits: 0, newStreak: user.current_streak, alreadyToday: true }
  }

  // Check if consecutive day
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  let newStreak = 1

  if (lastDate === yesterday) {
    newStreak = user.current_streak + 1
  }

  // Streak bonuses
  let bonusCredits = 0
  if (newStreak === 3) bonusCredits = 1  // 3 days = +1 credit
  if (newStreak === 7) bonusCredits = 2  // 7 days = +2 credits
  if (newStreak === 30) bonusCredits = 5 // 30 days = +5 credits

  const newBalance = user.credit_balance + bonusCredits

  // Update user
  await supabaseAdmin
    .from('users')
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(user.longest_streak, newStreak),
      last_generation_date: today,
      credit_balance: newBalance,
      total_credits_earned: user.total_credits_earned + bonusCredits
    })
    .eq('fid', fid)

  // Log bonus
  if (bonusCredits > 0) {
    await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_fid: fid,
        amount: bonusCredits,
        balance_after: newBalance,
        type: 'streak',
        description: `🔥 ${newStreak}-day streak bonus! Keep it up!`
      })

    console.log('🔥 Streak bonus, FID:', fid, newStreak, 'days →', bonusCredits, 'credits')
  }

  return { bonusCredits, newStreak, alreadyToday: false }
}

/**
 * Give bonus for sharing to Farcaster
 */
export async function giveShareBonus(fid: number, videoId: string) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('credit_balance, total_shares, total_credits_earned')
    .eq('fid', fid)
    .single()

  if (!user) return

  const newBalance = user.credit_balance + 1

  await supabaseAdmin
    .from('users')
    .update({
      credit_balance: newBalance,
      total_credits_earned: user.total_credits_earned + 1,
      total_shares: user.total_shares + 1
    })
    .eq('fid', fid)

  await supabaseAdmin
    .from('credit_transactions')
    .insert({
      user_fid: fid,
      amount: 1,
      balance_after: newBalance,
      type: 'share',
      description: '✨ Shared video to Farcaster!',
      related_video_id: videoId
    })

  console.log('✨ Share bonus, FID:', fid, '→ Balance:', newBalance)
}

/**
 * Save a video template
 */
export async function saveVideoTemplate(
  creatorFid: number,
  videoUrl: string,
  prompt: string,
  generationType: 'profile' | 'bio' | 'text',
  settings: Record<string, unknown>,
  castHash?: string,
  castUrl?: string
) {
  const { data, error } = await supabaseAdmin
    .from('video_templates')
    .insert({
      creator_fid: creatorFid,
      video_url: videoUrl,
      prompt: prompt,
      generation_type: generationType,
      settings: settings,
      cast_hash: castHash || null,
      cast_url: castUrl || null,
      is_public: true
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving template:', error)
    throw new Error('Failed to save video template')
  }

  console.log('💾 Template saved:', data.id)

  return data
}

/**
 * Get trending templates
 */
export async function getTrendingTemplates(limit = 50) {
  const { data, error } = await supabaseAdmin
    .from('video_templates')
    .select('*')
    .eq('is_public', true)
    .order('uses_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching templates:', error)
    return []
  }

  return data
}

/**
 * Track template usage
 */
export async function trackTemplateUse(
  templateId: string,
  userFid: number,
  generatedVideoUrl?: string
) {
  const { error } = await supabaseAdmin
    .from('template_uses')
    .insert({
      template_id: templateId,
      user_fid: userFid,
      generated_video_url: generatedVideoUrl || null
    })

  if (error) {
    console.error('Error tracking template use:', error)
  }

  // uses_count will auto-increment via trigger
}
