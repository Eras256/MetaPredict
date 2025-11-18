import { NextRequest, NextResponse } from 'next/server';
import { aggregationService } from '@/lib/services/aggregationService';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 60;

const executeSchema = z.object({
  userId: z.string().optional(),
  marketDescription: z.string().min(10),
  betAmount: z.number().positive(),
  isYes: z.boolean(),
});

/**
 * POST /api/aggregation/execute
 * @description Execute best route across multiple platforms
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, marketDescription, betAmount, isYes } = executeSchema.parse(body);
    
    // TODO: Get userId from auth middleware
    const finalUserId = userId || "anonymous";
    
    const result = await aggregationService.executeBestRoute(
      finalUserId,
      marketDescription,
      betAmount,
      isYes
    );
    return NextResponse.json({ result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to execute route" },
      { status: 500 }
    );
  }
}

