import { NextRequest, NextResponse } from 'next/server';
import { gelatoService } from '@/lib/services/gelatoService';

export const runtime = 'nodejs';
export const maxDuration = 10;

/**
 * GET /api/gelato/tasks/:taskId
 * @description Gets Gelato task status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const status = await gelatoService.getTaskStatus(taskId);
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gelato/tasks/:taskId
 * @description Cancels a Gelato task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const success = await gelatoService.cancelTask(taskId);
    return NextResponse.json({ success, taskId });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

