import { NextRequest, NextResponse } from 'next/server';
import { suggestMarketCreation } from '@/lib/ai/gemini-advanced';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { topic } = await request.json();

    console.log('[AI] Suggest market request received:', {
      topic: topic?.substring(0, 50),
      timestamp: new Date().toISOString()
    });

    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          error: 'topic is required',
        },
        { status: 400 }
      );
    }

    // Verificar que la API key esté configurada (gemini-advanced.ts ya lo hace, pero verificamos aquí también)
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('[AI] Gemini API key not found in environment variables');
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API key not configured. Please set GEMINI_API_KEY (recommended) or NEXT_PUBLIC_GEMINI_API_KEY in .env',
        },
        { status: 500 }
      );
    }

    console.log('[AI] Starting Gemini analysis for market suggestions...');
    const { data, modelUsed } = await suggestMarketCreation(topic);
    const duration = Date.now() - startTime;
    console.log('[AI] Market suggestions completed:', {
      modelUsed,
      duration: `${duration}ms`,
      suggestionsCount: data?.suggestions?.length || 0
    });

    return NextResponse.json({
      success: true,
      data,
      modelUsed,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[AI] Suggest market error:', {
      message: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
      errorType: error.constructor?.name,
      timestamp: new Date().toISOString()
    });
    
    // Proporcionar mensaje de error más detallado
    let errorMessage = error.message || 'Error al generar sugerencias';
    
    // Si es un error de JSON parsing, dar más contexto
    if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
      errorMessage = `Error parsing Gemini response: ${errorMessage}. The AI might have returned invalid JSON. Please try again.`;
    } else if (errorMessage.includes('empty') || errorMessage.includes('Empty')) {
      errorMessage = 'The AI did not generate a response. Please try again with a different topic.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      errorMessage = 'The request took too long. Please try again.';
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          originalError: error.message,
          stack: error.stack,
          duration: `${duration}ms`
        } : undefined,
      },
      { status: 500 }
    );
  }
}

