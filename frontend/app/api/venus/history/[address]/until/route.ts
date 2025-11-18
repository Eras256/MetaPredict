import { NextRequest, NextResponse } from 'next/server';
import { venusService } from '@/lib/services/venusService';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * GET /api/venus/history/:address/until
 * @description Gets historical data until November 2025 (or specified date)
 * @query endDate - End date (ISO string, default: 2025-11-30)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    const endDateParam = searchParams.get('endDate');

    const end = endDateParam 
      ? new Date(endDateParam)
      : new Date("2025-11-30");

    const historicalData = await venusService.getHistoricalDataUntil(address, end);
    return NextResponse.json({ 
      address, 
      endDate: end.toISOString(), 
      historicalData 
    });
  } catch (error: any) {
    console.error('[Venus API] Error fetching historical data until date:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch historical data', message: error.message },
      { status: 500 }
    );
  }
}

