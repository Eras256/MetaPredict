import { NextRequest, NextResponse } from 'next/server';
import { venusService } from '@/lib/services/venusService';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/venus/markets
 * @description Gets all Venus Protocol markets
 */
export async function GET(request: NextRequest) {
  try {
    const markets = await venusService.getMarkets();
    return NextResponse.json({ markets });
  } catch (error: any) {
    console.error('[Venus API] Error fetching markets:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch Venus markets', message: error.message },
      { status: 500 }
    );
  }
}

