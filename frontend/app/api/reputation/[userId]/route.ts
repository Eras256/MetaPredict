import { NextRequest, NextResponse } from 'next/server';
import { reputationService } from '@/lib/services/reputationService';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/reputation/:userId
 * @description Get user reputation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const reputation = await reputationService.getReputation(userId);
    return NextResponse.json({ reputation });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to get reputation" },
      { status: 500 }
    );
  }
}

