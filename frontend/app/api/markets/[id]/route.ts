import { NextRequest, NextResponse } from 'next/server';
import { marketService } from '@/lib/services/marketService';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/markets/:id
 * @description Get market by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const market = await marketService.getMarketById(id);
    if (!market) {
      return NextResponse.json(
        { error: "Market not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ market });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch market" },
      { status: 500 }
    );
  }
}

