import { NextRequest, NextResponse } from 'next/server';
import { ConsensusService } from '@/lib/services/llm/consensus.service';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/oracle/resolve
 * @description Endpoint for Chainlink Functions that executes LLM consensus
 * This endpoint is called by the Oracle Bot when a ResolutionRequested event is detected
 */
export async function POST(request: NextRequest) {
  try {
    // Validate Chainlink Functions request (optional: verify signature)
    const signature = request.headers.get('x-chainlink-signature');
    // TODO: Implement signature validation if necessary

    const body = await request.json();
    const { marketDescription, priceId } = body;

    if (!marketDescription) {
      return NextResponse.json(
        { error: 'marketDescription is required' },
        { status: 400 }
      );
    }

    // Initialize consensus service: Gemini + Groq + OpenRouter
    const consensusService = new ConsensusService(
      process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
      process.env.GROQ_API_KEY, // Groq API key (optional)
      process.env.OPENROUTER_API_KEY // OpenRouter API key (optional)
    );

    // Get consensus from multiple LLMs
    const result = await consensusService.getConsensus(
      marketDescription,
      priceId ? `Price ID: ${priceId}` : undefined,
      0.8 // 80% agreement required
    );

    // Return format expected by Chainlink Functions / Oracle Bot
    return NextResponse.json({
      outcome: result.outcome, // 1=Yes, 2=No, 3=Invalid
      confidence: result.confidence, // 0-100
      consensusCount: result.consensusCount,
      totalModels: result.totalModels,
      votes: result.votes,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Oracle resolution error:', error);
    return NextResponse.json(
      { error: 'Resolution failed', details: error.message },
      { status: 500 }
    );
  }
}

