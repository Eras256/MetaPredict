import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/ai/gemini-advanced';

export const runtime = 'nodejs'; // Fuerza runtime Node en Vercel

export async function GET(request: NextRequest) {
  try {
    const { data, modelUsed } = await callGemini(
      'Responde con un JSON: {"status": "ok", "message": "Gemini está funcionando correctamente"}'
    );

    return NextResponse.json({
      success: true,
      data: { response: data, modelUsed },
      message: 'Gemini AI está conectado correctamente',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al conectar con Gemini',
      },
      { status: 500 }
    );
  }
}

