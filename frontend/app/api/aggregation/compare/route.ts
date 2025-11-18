import { NextRequest, NextResponse } from 'next/server';
import { aggregationService } from '@/lib/services/aggregationService';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 30;

const compareSchema = z.object({
  marketDescription: z.string().min(10),
});

/**
 * POST /api/aggregation/compare
 * @description Compare prices across multiple prediction market platforms
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketDescription } = compareSchema.parse(body);
    
    const comparison = await aggregationService.getPriceComparison(marketDescription);
    return NextResponse.json({ comparison });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to compare prices" },
      { status: 500 }
    );
  }
}

