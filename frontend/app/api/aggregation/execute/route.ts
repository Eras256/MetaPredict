import { NextRequest, NextResponse } from 'next/server';
import { aggregationService } from '@/lib/services/aggregationService';
import { getAuthenticatedUser } from '@/lib/middleware/auth';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 60;

const executeSchema = z.object({
  userId: z.string().optional(), // Fallback if auth fails
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
    const { userId: bodyUserId, marketDescription, betAmount, isYes } = executeSchema.parse(body);
    
    // Get userId from auth middleware
    const auth = await getAuthenticatedUser(request);
    const finalUserId = auth.userId || bodyUserId;
    
    if (!finalUserId) {
      return NextResponse.json(
        { error: "Authentication required. Please provide userId or authenticate." },
        { status: 401 }
      );
    }
    
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
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to execute route", details: error.message },
      { status: 500 }
    );
  }
}

