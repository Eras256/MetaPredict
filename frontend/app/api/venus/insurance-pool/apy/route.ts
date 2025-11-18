import { NextRequest, NextResponse } from 'next/server';
import { venusService } from '@/lib/services/venusService';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/venus/insurance-pool/apy
 * @description Gets estimated APY for Insurance Pool based on vUSDC
 */
export async function GET(request: NextRequest) {
  try {
    const apyData = await venusService.getInsurancePoolAPY();
    return NextResponse.json(apyData);
  } catch (error: any) {
    console.error('[Venus API] Error fetching Insurance Pool APY:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch Insurance Pool APY', message: error.message },
      { status: 500 }
    );
  }
}

