import { NextRequest, NextResponse } from 'next/server';
import { marketService } from '@/lib/services/marketService';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 60;

const resolveMarketSchema = z.object({
  outcome: z.string(),
});

/**
 * POST /api/markets/:id/resolve
 * @description Resolve a market
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { outcome } = resolveMarketSchema.parse(body);
    
    const market = await marketService.resolveMarket(id, outcome);
    return NextResponse.json({ market });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to resolve market" },
      { status: 500 }
    );
  }
}

