import { NextRequest, NextResponse } from 'next/server';
import { ConsensusService } from '@/lib/services/llm/consensus.service';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Validates Chainlink Functions request signature
 */
function validateChainlinkRequest(
  signature: string | null,
  secret: string | null,
  body: string
): { isValid: boolean; reason?: string } {
  const chainlinkSecret = process.env.CHAINLINK_SECRET || process.env.CHAINLINK_FUNCTIONS_SECRET;
  const requireAuth = process.env.CHAINLINK_REQUIRE_AUTH !== 'false';
  
  // In development, allow requests without auth if explicitly disabled
  if (!requireAuth && process.env.NODE_ENV !== 'production') {
    return { isValid: true };
  }
  
  // If secret is configured, validate using secret token
  if (chainlinkSecret) {
    if (!secret || secret !== chainlinkSecret) {
      return { 
        isValid: false, 
        reason: 'Invalid secret token' 
      };
    }
    return { isValid: true };
  }
  
  // If signature is provided, consider it valid (full HMAC validation can be added)
  if (signature && signature.length > 0) {
    return { isValid: true };
  }
  
  // If no auth method is configured and we're in production, reject
  if (process.env.NODE_ENV === 'production' && !chainlinkSecret && !signature) {
    return { 
      isValid: false, 
      reason: 'No authentication configured' 
    };
  }
  
  return { isValid: true };
}

/**
 * POST /api/oracle/resolve
 * @description Endpoint for Chainlink Functions that executes LLM consensus
 * This endpoint is called by the Oracle Bot when a ResolutionRequested event is detected
 */
export async function POST(request: NextRequest) {
  try {
    // Validate Chainlink Functions request
    const signature = request.headers.get('x-chainlink-signature');
    const secret = request.headers.get('x-chainlink-secret');
    
    const body = await request.json();
    const bodyString = JSON.stringify(body);
    
    const authResult = validateChainlinkRequest(signature, secret, bodyString);
    
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized', reason: authResult.reason || 'Invalid signature' },
        { status: 401 }
      );
    }
    
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

