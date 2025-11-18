import { NextRequest, NextResponse } from 'next/server';
import { analyzePortfolioRebalance } from '@/lib/ai/gemini-advanced';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { positions, constraints } = await request.json();

    console.log('[AI] Portfolio analysis request received:', {
      positionsCount: positions?.length || 0,
      hasConstraints: !!constraints,
      timestamp: new Date().toISOString()
    });

    if (!positions || !Array.isArray(positions)) {
      return NextResponse.json(
        {
          success: false,
          error: 'positions array is required',
        },
        { status: 400 }
      );
    }

    // Validar que las posiciones tengan la estructura correcta
    const validPositions = positions.filter(p => 
      p.marketId && p.question && typeof p.yesShares === 'number' && typeof p.noShares === 'number'
    );

    if (validPositions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid positions found. Each position must have marketId, question, yesShares, and noShares',
        },
        { status: 400 }
      );
    }

    console.log('[AI] Starting Gemini analysis for portfolio...');
    const { data, modelUsed } = await analyzePortfolioRebalance(validPositions, constraints);
    const duration = Date.now() - startTime;
    console.log('[AI] Portfolio analysis completed:', {
      modelUsed,
      duration: `${duration}ms`,
      hasData: !!data
    });

    return NextResponse.json({
      success: true,
      data,
      modelUsed,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('[AI] Portfolio analysis error:', {
      message: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
      errorType: error.constructor?.name,
      timestamp: new Date().toISOString()
    });
    
    // Proporcionar mensaje de error más detallado
    let errorMessage = error.message || 'Error al analizar portfolio';
    
    if (errorMessage.includes('GEMINI_API_KEY') || errorMessage.includes('API key')) {
      errorMessage = 'Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.';
    } else if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
      errorMessage = 'Error parsing AI response. The AI might have returned invalid JSON. Please try again.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      errorMessage = 'The analysis took too long. Please try again with fewer positions or simpler constraints.';
    } else if (errorMessage.includes('string')) {
      errorMessage = 'Unexpected response format from AI. Please try again.';
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

