import { NextRequest, NextResponse } from 'next/server';
import { eventMonitorService } from '@/lib/services/eventMonitorService';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * GET /api/cron/oracle-check
 * @description Vercel Cron Job to check for pending market resolutions
 * This runs every 5 minutes to monitor ResolutionRequested events
 * 
 * Security: Verify request comes from Vercel Cron
 */
export async function GET(request: NextRequest) {
  try {
    // Verify request comes from Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In production, Vercel automatically adds the authorization header
      // For local testing, allow if CRON_SECRET is not set
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Initialize and check for pending resolutions
    await eventMonitorService.initialize();
    const result = await eventMonitorService.checkPendingResolutions();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error: any) {
    console.error('[Cron] Oracle check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

