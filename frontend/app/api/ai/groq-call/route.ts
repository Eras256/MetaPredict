import { NextRequest, NextResponse } from 'next/server';
import { callGroq, callGroqJSON } from '@/lib/ai/groq-advanced';

export const runtime = 'nodejs';

/**
 * Endpoint genérico para llamadas personalizadas a Groq
 */
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

    // Verificar que la API key esté configurada
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: 'Groq API key not configured. Please set GROQ_API_KEY in your .env file.',
        },
        { status: 500 }
      );
    }

    let result;
    if (returnJSON) {
      result = await callGroqJSON(prompt, config);
    } else {
      result = await callGroq(prompt, config);
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] Groq call error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al llamar a Groq',
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}

