import { NextRequest, NextResponse } from 'next/server';
import { venusService } from '@/lib/services/venusService';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/venus/vusdc
 * @description Gets vUSDC (USDC vToken) information
 */
export async function GET(request: NextRequest) {
  try {
    const vUSDCInfo = await venusService.getVUSDCInfo();
    
    if (!vUSDCInfo) {
      return NextResponse.json(
        { error: 'vUSDC not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ vUSDCInfo });
  } catch (error: any) {
    console.error('[Venus API] Error fetching vUSDC info:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch vUSDC info', message: error.message },
      { status: 500 }
    );
  }
}

