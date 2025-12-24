import { NextRequest, NextResponse } from 'next/server';
import { callGroq, callGroqJSON } from '@/lib/ai/groq-advanced';

export const runtime = 'nodejs';

/**
 * Test endpoint para validar conectividad con Groq
 * GET /api/ai/groq-test - Prueba básica de conectividad
 * POST /api/ai/groq-test - Prueba con prompt personalizado
 */
export async function GET(request: NextRequest) {
  try {
    const testPrompt = 'Respond with a JSON: {"status": "ok", "message": "Groq is working correctly", "timestamp": "' + new Date().toISOString() + '"}';
    const { data, modelUsed } = await callGroq(testPrompt);

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
      message: 'Groq AI is connected correctly',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AI] Groq test endpoint error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error connecting to Groq',
        details: process.env.GROQ_API_KEY ? 'API key configured' : 'API key NOT configured',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, returnJSON } = await request.json();
    const testPrompt = prompt || 'Respond with a JSON: {"status": "ok", "message": "Test successful"}';

    let result;
    if (returnJSON) {
      result = await callGroqJSON(testPrompt);
    } else {
      result = await callGroq(testPrompt);
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      modelUsed: result.modelUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AI] Groq test POST endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error connecting to Groq',
        details: process.env.GROQ_API_KEY ? 'API key configured' : 'API key NOT configured',
      },
      { status: 500 }
    );
  }
}

