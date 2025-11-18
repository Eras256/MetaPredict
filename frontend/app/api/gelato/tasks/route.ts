import { NextRequest, NextResponse } from 'next/server';
import { gelatoService } from '@/lib/services/gelatoService';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 30;

const createTaskSchema = z.object({
  name: z.string(),
  execAddress: z.string().startsWith("0x").length(42),
  execSelector: z.string().startsWith("0x"),
  execData: z.string().startsWith("0x"),
  interval: z.number().positive(),
  startTime: z.number().optional(),
  useTreasury: z.boolean().optional(),
});

/**
 * POST /api/gelato/tasks
 * @description Creates a new automated task in Gelato
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTaskSchema.parse(body);
    const task = await gelatoService.createTask(validated);
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

