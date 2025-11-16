import { NextRequest, NextResponse } from 'next/server';
import { callGemini, callGeminiJSON } from '@/lib/ai/gemini-advanced';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { prompt, config, returnJSON } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: 'prompt is required',
        },
        { status: 400 }
      );
    }

    let result;
    if (returnJSON) {
      result = await callGeminiJSON(prompt, config);
    } else {
      result = await callGemini(prompt, config);
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] Generic call error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al llamar a Gemini',
      },
      { status: 500 }
    );
  }
}

