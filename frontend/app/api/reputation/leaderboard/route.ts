import { NextRequest, NextResponse } from 'next/server';
import { reputationService } from '@/lib/services/reputationService';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/reputation/leaderboard
 * @description Get leaderboard
 */
export async function GET(request: NextRequest) {
  try {
    const leaderboard = await reputationService.getLeaderboard();
    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to get leaderboard" },
      { status: 500 }
    );
  }
}

