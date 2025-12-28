import { NextRequest, NextResponse } from 'next/server';
import { marketService } from '@/lib/services/marketService';
import { getAuthenticatedUser } from '@/lib/middleware/auth';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 60;

const placeBetSchema = z.object({
  amount: z.number().positive(),
  outcome: z.boolean(),
  userId: z.string().optional(), // Fallback if auth fails
});

/**
 * POST /api/markets/:id/bet
 * @description Place a bet on a market
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, outcome, userId: bodyUserId } = placeBetSchema.parse(body);
    
    // Get userId from auth middleware
    const auth = await getAuthenticatedUser(request);
    const finalUserId = auth.userId || bodyUserId;
    
    if (!finalUserId) {
      return NextResponse.json(
        { error: "Authentication required. Please provide userId or authenticate." },
        { status: 401 }
      );
    }
    
    const bet = await marketService.placeBet(id, finalUserId, amount, outcome);
    return NextResponse.json({ bet });
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
      { error: "Failed to place bet", details: error.message },
      { status: 500 }
    );
  }
}

