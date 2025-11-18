import { NextRequest, NextResponse } from 'next/server';
import { venusService } from '@/lib/services/venusService';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/venus/insurance-pool/transactions
 * @description Gets Insurance Pool transactions related to Venus
 * @query poolAddress - Insurance Pool address (optional)
 * @query limit - Results limit (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const poolAddress = searchParams.get('poolAddress') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    const transactions = await venusService.getInsurancePoolTransactions(
      poolAddress,
      limit
    );

    if (!transactions) {
      return NextResponse.json(
        { error: 'Transactions not found or endpoint not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error('[Venus API] Error fetching insurance pool transactions:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch insurance pool transactions', message: error.message },
      { status: 500 }
    );
  }
}

