import { NextRequest, NextResponse } from 'next/server';
import { aggregationService } from '@/lib/services/aggregationService';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/aggregation/portfolio/:userId
 * @description Get user portfolio across all platforms
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const portfolio = await aggregationService.getPortfolio(userId);
    return NextResponse.json({ portfolio });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to get portfolio" },
      { status: 500 }
    );
  }
}

