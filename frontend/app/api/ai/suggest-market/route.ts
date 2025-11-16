import { NextRequest, NextResponse } from 'next/server';
import { suggestMarketCreation } from '@/lib/ai/gemini-advanced';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          error: 'topic is required',
        },
        { status: 400 }
      );
    }

    const { data, modelUsed } = await suggestMarketCreation(topic);

    return NextResponse.json({
      success: true,
      data,
      modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] Suggest market error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al generar sugerencias',
      },
      { status: 500 }
    );
  }
}

