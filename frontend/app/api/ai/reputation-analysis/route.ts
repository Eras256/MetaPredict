import { NextRequest, NextResponse } from 'next/server';
import { analyzeReputation } from '@/lib/ai/gemini-advanced';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userData } = await request.json();

    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          error: 'userData is required',
        },
        { status: 400 }
      );
    }

    const { data, modelUsed } = await analyzeReputation(userData);

    return NextResponse.json({
      success: true,
      data,
      modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] Reputation analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al analizar reputación',
      },
      { status: 500 }
    );
  }
}

