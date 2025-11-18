import { NextRequest, NextResponse } from 'next/server';
import { venusService } from '@/lib/services/venusService';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * GET /api/venus/history/:address
 * @description Gets historical APY data for a vToken
 * @query startDate - Start date (ISO string or timestamp)
 * @query endDate - End date (ISO string or timestamp)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let start: Date | undefined;
    let end: Date | undefined;

    if (startDateParam) {
      start = new Date(startDateParam);
    }

    if (endDateParam) {
      end = new Date(endDateParam);
    }

    const historicalData = await venusService.getHistoricalAPY(address, start, end);
    return NextResponse.json({ address, historicalData });
  } catch (error: any) {
    console.error('[Venus API] Error fetching historical data:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch historical data', message: error.message },
      { status: 500 }
    );
  }
}

