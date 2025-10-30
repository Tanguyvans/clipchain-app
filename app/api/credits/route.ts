import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/credits'

export async function GET(request: NextRequest) {
  try {
    // Get FID from query params (FID is the primary identifier from Farcaster auth)
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')
    const walletAddress = searchParams.get('wallet') // Optional

    if (!fid) {
      return NextResponse.json(
        { error: 'FID (Farcaster ID) required' },
        { status: 400 }
      )
    }

    // Get or create user (with 3 free credits if new)
    const { user, isNew } = await getOrCreateUser(
      parseInt(fid),
      walletAddress || undefined
    )

    return NextResponse.json({
      success: true,
      credits: user.credit_balance,
      streak: user.current_streak,
      longestStreak: user.longest_streak,
      totalVideos: user.total_videos_created,
      isNewUser: isNew,
      user: {
        fid: user.fid,
        wallet: user.wallet_address,
        credits: user.credit_balance,
        streak: user.current_streak
      }
    })
  } catch (error) {
    console.error('Error fetching credits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    )
  }
}
