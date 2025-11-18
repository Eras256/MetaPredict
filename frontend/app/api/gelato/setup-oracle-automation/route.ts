import { NextRequest, NextResponse } from 'next/server';
import { gelatoService } from '@/lib/services/gelatoService';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 30;

const setupAutomationSchema = z.object({
  aiOracleAddress: z.string().startsWith("0x").length(42),
  backendUrl: z.string(), // Can be URL or relative path like "/api"
  chainId: z.number().optional(),
});

/**
 * POST /api/gelato/setup-oracle-automation
 * @description Sets up automation for AIOracle using Gelato
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aiOracleAddress, backendUrl, chainId } = setupAutomationSchema.parse(body);
    const task = await gelatoService.setupOracleAutomation(
      aiOracleAddress,
      backendUrl,
      chainId || 5611
    );
    return NextResponse.json(task);
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

