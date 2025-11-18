import { NextRequest, NextResponse } from 'next/server';
import { callGemini, callGeminiJSON } from '@/lib/ai/gemini-advanced';

export const runtime = 'nodejs';

/**
 * Test endpoint para validar conectividad con Gemini
 * GET /api/ai/test - Prueba básica de conectividad
 * POST /api/ai/test - Prueba con prompt personalizado
 */
export async function GET(request: NextRequest) {
  try {
    const testPrompt = 'Responde con un JSON: {"status": "ok", "message": "Gemini está funcionando correctamente", "timestamp": "' + new Date().toISOString() + '"}';
    const { data, modelUsed } = await callGemini(testPrompt);

    // Intentar parsear JSON de la respuesta
    let parsedData;
    try {
      const jsonMatch = data.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = { rawResponse: data };
      }
    } catch (e) {
      parsedData = { rawResponse: data };
    }

    return NextResponse.json({
      success: true,
      data: {
        response: parsedData,
        rawResponse: data,
        modelUsed,
      },
      message: 'Gemini AI está conectado correctamente',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AI] Test endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al conectar con Gemini',
        details: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'API key configurada' : 'API key NO configurada',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, returnJSON } = await request.json();
    const testPrompt = prompt || 'Responde con un JSON: {"status": "ok", "message": "Test exitoso"}';

    let result;
    if (returnJSON) {
      result = await callGeminiJSON(testPrompt);
    } else {
      result = await callGemini(testPrompt);
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      modelUsed: result.modelUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AI] Test POST endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al conectar con Gemini',
        details: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'API key configurada' : 'API key NO configurada',
      },
      { status: 500 }
    );
  }
}

