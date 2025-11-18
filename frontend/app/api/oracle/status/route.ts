import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 10;

/**
 * GET /api/oracle/status
 * @description Gets Oracle service status
 */
export async function GET(request: NextRequest) {
  try {
    // Check if required API keys are configured
    const hasGeminiKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    const hasGroqKey = !!process.env.GROQ_API_KEY;
    const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY;

    return NextResponse.json({
      status: 'active',
      configured: hasGeminiKey || hasGroqKey || hasOpenRouterKey,
      services: {
        gemini: hasGeminiKey,
        groq: hasGroqKey,
        openRouter: hasOpenRouterKey,
      },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

