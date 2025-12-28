import { NextRequest, NextResponse } from 'next/server';
import { reputationService } from '@/lib/services/reputationService';
import { getAuthenticatedUser } from '@/lib/middleware/auth';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 60;

const updateReputationSchema = z.object({
  userId: z.string().optional(), // Fallback if auth fails
  wasCorrect: z.boolean(),
  marketSize: z.number().positive(),
  confidence: z.number().min(0).max(100),
});

/**
 * POST /api/reputation/update
 * @description Update reputation
 * Note: This endpoint is typically called by the system after market resolution
 * Authentication is optional but recommended for security
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId: bodyUserId, wasCorrect, marketSize, confidence } = updateReputationSchema.parse(body);
    
    // Get authenticated user (optional - system can call this)
    const auth = await getAuthenticatedUser(request);
    const finalUserId = auth.userId || bodyUserId;
    
    if (!finalUserId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }
    
    // If authenticated, verify user is updating their own reputation
    if (auth.isAuthenticated && auth.userId !== bodyUserId && bodyUserId) {
      return NextResponse.json(
        { error: "Unauthorized: You can only update your own reputation" },
        { status: 403 }
      );
    }
    
    const reputation = await reputationService.updateReputation(
      finalUserId,
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
      { error: "Failed to update reputation", details: error.message },
      { status: 500 }
    );
  }
}

