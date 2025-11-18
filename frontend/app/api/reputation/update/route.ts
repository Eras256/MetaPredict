import { NextRequest, NextResponse } from 'next/server';
import { reputationService } from '@/lib/services/reputationService';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 60;

const updateReputationSchema = z.object({
  userId: z.string(),
  wasCorrect: z.boolean(),
  marketSize: z.number().positive(),
  confidence: z.number().min(0).max(100),
});

/**
 * POST /api/reputation/update
 * @description Update reputation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, wasCorrect, marketSize, confidence } = updateReputationSchema.parse(body);
    
    const reputation = await reputationService.updateReputation(
      userId,
      wasCorrect,
      marketSize,
      confidence
    );
    return NextResponse.json({ reputation });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update reputation" },
      { status: 500 }
    );
  }
}

