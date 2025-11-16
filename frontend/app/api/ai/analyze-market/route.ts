import { NextRequest, NextResponse } from 'next/server';
import { analyzeMarketWithGemini } from '@/lib/ai/gemini-advanced';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { question, context } = await request.json();

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: 'question is required',
        },
        { status: 400 }
      );
    }

    const { data, modelUsed } = await analyzeMarketWithGemini(question, context);

    return NextResponse.json({
      success: true,
      data,
      modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] Analyze market error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al analizar mercado',
      },
      { status: 500 }
    );
  }
}

