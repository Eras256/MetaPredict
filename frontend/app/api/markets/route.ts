import { NextRequest, NextResponse } from 'next/server';
import { marketService } from '@/lib/services/marketService';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 30;

const createMarketSchema = z.object({
  description: z.string().min(10).max(500),
  category: z.enum(["sports", "politics", "crypto", "entertainment", "climate"]),
  outcome: z.enum(["binary", "conditional", "subjective"]),
  deadline: z.string().datetime(),
  parentMarketId: z.string().uuid().optional(),
  parentOutcome: z.enum(["YES", "NO"]).optional(),
});

/**
 * GET /api/markets
 * @description Get all markets
 */
export async function GET(request: NextRequest) {
  try {
    const markets = await marketService.getAllMarkets();
    return NextResponse.json({ markets });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch markets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/markets
 * @description Create a new market
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createMarketSchema.parse(body);
    const market = await marketService.createMarket(data);
    return NextResponse.json({ market }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create market" },
      { status: 500 }
    );
  }
}

