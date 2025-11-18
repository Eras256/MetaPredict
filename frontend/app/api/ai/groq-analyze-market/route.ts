import { NextRequest, NextResponse } from 'next/server';
import { analyzeMarketWithGroq } from '@/lib/ai/groq-advanced';

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

    // Verificar que la API key esté configurada
    if (!process.env.GROQ_API_KEY) {
      console.error('[AI] Groq API key not found in environment variables');
      return NextResponse.json(
        {
          success: false,
          error: 'Groq API key not configured. Please set GROQ_API_KEY in your .env file.',
        },
        { status: 500 }
      );
    }

    console.log('[AI] Starting Groq analysis for market...');
    const { data, modelUsed } = await analyzeMarketWithGroq(question, context);

    return NextResponse.json({
      success: true,
      data,
      modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] Groq analyze market error:', error);
    
    let errorMessage = error.message || 'Error al analizar mercado con Groq';
    if (errorMessage.includes('GROQ_API_KEY')) {
      errorMessage = 'Groq API key not configured. Please set GROQ_API_KEY in your .env file.';
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}

