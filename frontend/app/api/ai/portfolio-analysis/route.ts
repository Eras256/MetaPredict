import { NextRequest, NextResponse } from 'next/server';
import { analyzePortfolioRebalance } from '@/lib/ai/gemini-advanced';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { positions, constraints } = await request.json();

    if (!positions || !Array.isArray(positions)) {
      return NextResponse.json(
        {
          success: false,
          error: 'positions array is required',
        },
        { status: 400 }
      );
    }

    const { data, modelUsed } = await analyzePortfolioRebalance(positions, constraints);

    return NextResponse.json({
      success: true,
      data,
      modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] Portfolio analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al analizar portfolio',
      },
      { status: 500 }
    );
  }
}

