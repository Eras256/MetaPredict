import { NextRequest, NextResponse } from 'next/server';
import { venusService } from '@/lib/services/venusService';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/venus/transactions
 * @description Gets transactions related to Venus Protocol
 * @query address - User or contract address
 * @query vTokenAddress - vToken address
 * @query limit - Results limit (default: 50)
 * @query page - Page number (default: 0)
 * @query startDate - Start date
 * @query endDate - End date
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address') || undefined;
    const vTokenAddress = searchParams.get('vTokenAddress') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : undefined;
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

    const transactions = await venusService.getTransactions({
      address,
      vTokenAddress,
      limit,
      page,
      startDate: start,
      endDate: end,
    });

    if (!transactions) {
      return NextResponse.json(
        { error: 'Transactions endpoint not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error('[Venus API] Error fetching transactions:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', message: error.message },
      { status: 500 }
    );
  }
}

