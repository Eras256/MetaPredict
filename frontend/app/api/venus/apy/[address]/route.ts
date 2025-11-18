import { NextRequest, NextResponse } from 'next/server';
import { venusService } from '@/lib/services/venusService';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/venus/apy/:address
 * @description Gets the current APY for a specific vToken
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const apy = await venusService.getVTokenAPY(address);
    return NextResponse.json({ address, apy });
  } catch (error: any) {
    console.error('[Venus API] Error fetching APY:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch APY', message: error.message },
      { status: 500 }
    );
  }
}

