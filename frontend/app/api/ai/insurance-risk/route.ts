import { NextRequest, NextResponse } from 'next/server';
import { analyzeInsuranceRisk } from '@/lib/ai/gemini-advanced';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { marketData } = await request.json();

    if (!marketData) {
      return NextResponse.json(
        {
          success: false,
          error: 'marketData is required',
        },
        { status: 400 }
      );
    }

    const { data, modelUsed } = await analyzeInsuranceRisk(marketData);

    return NextResponse.json({
      success: true,
      data,
      modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] Insurance risk analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al analizar riesgo',
      },
      { status: 500 }
    );
  }
}

