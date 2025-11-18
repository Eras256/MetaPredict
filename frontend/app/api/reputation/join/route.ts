import { NextRequest, NextResponse } from 'next/server';
import { reputationService } from '@/lib/services/reputationService';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 60;

const joinDAOSchema = z.object({
  userId: z.string(),
  stakeAmount: z.number().positive(),
});

/**
 * POST /api/reputation/join
 * @description Join DAO
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, stakeAmount } = joinDAOSchema.parse(body);
    const result = await reputationService.joinDAO(userId, stakeAmount);
    return NextResponse.json({ result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to join DAO" },
      { status: 500 }
    );
  }
}

