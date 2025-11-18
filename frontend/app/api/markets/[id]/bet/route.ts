import { NextRequest, NextResponse } from 'next/server';
import { marketService } from '@/lib/services/marketService';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 60;

const placeBetSchema = z.object({
  amount: z.number().positive(),
  outcome: z.boolean(),
  userId: z.string().optional(), // From auth middleware
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
    const { amount, outcome, userId } = placeBetSchema.parse(body);
    
    // TODO: Get userId from auth middleware
    const finalUserId = userId || "anonymous";
    
    const bet = await marketService.placeBet(id, finalUserId, amount, outcome);
    return NextResponse.json({ bet });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to place bet" },
      { status: 500 }
    );
  }
}

