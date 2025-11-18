import { NextRequest, NextResponse } from 'next/server';
import { gelatoService } from '@/lib/services/gelatoService';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 60;

const fulfillResolutionSchema = z.object({
  aiOracleAddress: z.string().startsWith("0x").length(42),
  marketId: z.number(),
  outcome: z.number().min(1).max(3),
  confidence: z.number().min(0).max(100),
  chainId: z.number().optional(),
});

/**
 * POST /api/gelato/fulfill-resolution
 * @description Resolves a market using Gelato Relay after getting backend result
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aiOracleAddress, marketId, outcome, confidence, chainId } = 
      fulfillResolutionSchema.parse(body);
    
    const result = await gelatoService.fulfillResolution(
      aiOracleAddress,
      marketId,
      outcome,
      confidence,
      chainId || 5611
    );
    
    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

