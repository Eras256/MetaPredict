import { NextRequest, NextResponse } from 'next/server';
import { gelatoService } from '@/lib/services/gelatoService';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 60;

const relaySchema = z.object({
  chainId: z.number(),
  target: z.string().startsWith("0x").length(42),
  data: z.string().startsWith("0x"),
  user: z.string().startsWith("0x").length(42).optional(),
});

/**
 * POST /api/gelato/relay
 * @description Sends a transaction using Gelato Relay (gasless)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = relaySchema.parse(body);
    const result = await gelatoService.relayTransaction(validated);
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

