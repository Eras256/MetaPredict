import { NextRequest, NextResponse } from 'next/server';
import { venusService } from '@/lib/services/venusService';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/venus/markets/:address
 * @description Gets data for a specific market by vToken address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const market = await venusService.getMarketByAddress(address);
    
    if (!market) {
      return NextResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ market });
  } catch (error: any) {
    console.error('[Venus API] Error fetching market:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch market', message: error.message },
      { status: 500 }
    );
  }
}

