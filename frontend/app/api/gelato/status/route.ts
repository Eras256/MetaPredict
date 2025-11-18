import { NextRequest, NextResponse } from 'next/server';
import { gelatoService } from '@/lib/services/gelatoService';

export const runtime = 'nodejs';
export const maxDuration = 10;

/**
 * GET /api/gelato/status
 * @description Checks Gelato configuration
 */
export async function GET(request: NextRequest) {
  try {
    const status = await gelatoService.checkConfiguration();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

