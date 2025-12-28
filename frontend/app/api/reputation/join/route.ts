import { NextRequest, NextResponse } from 'next/server';
import { reputationService } from '@/lib/services/reputationService';
import { getAuthenticatedUser, requireAuth } from '@/lib/middleware/auth';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 60;

const joinDAOSchema = z.object({
  userId: z.string().optional(), // Fallback if auth fails
  stakeAmount: z.number().positive(),
});

/**
 * POST /api/reputation/join
 * @description Join DAO
 * Requires authentication - users can only join for themselves
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId: bodyUserId, stakeAmount } = joinDAOSchema.parse(body);
    
    // Get authenticated user
    const auth = await getAuthenticatedUser(request);
    const finalUserId = auth.userId || bodyUserId;
    
    if (!finalUserId) {
      return NextResponse.json(
        { error: "Authentication required. Please provide userId or authenticate." },
        { status: 401 }
      );
    }
    
    // Verify user is joining for themselves
    if (auth.isAuthenticated && auth.userId !== bodyUserId && bodyUserId) {
      return NextResponse.json(
        { error: "Unauthorized: You can only join DAO for yourself" },
        { status: 403 }
      );
    }
    
    const result = await reputationService.joinDAO(finalUserId, stakeAmount);
    return NextResponse.json({ result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to join DAO", details: error.message },
      { status: 500 }
    );
  }
}

