import { NextRequest, NextResponse } from 'next/server';
import { venusService } from '@/lib/services/venusService';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/venus/markets
 * @description Gets all Venus Protocol markets
 */
export async function GET(request: NextRequest) {
  try {
    const markets = await venusService.getMarkets();
    
    // Return empty array if no markets (graceful degradation)
    if (!markets || markets.length === 0) {
      return NextResponse.json({ 
        markets: [],
        message: "Venus Protocol API is currently unavailable. This is normal if the service is not configured or the external API is down."
      });
    }
    
    return NextResponse.json({ markets });
  } catch (error: any) {
    console.error('[Venus API] Error fetching markets:', error.message);
    // Return empty array with 200 status instead of error to allow frontend to handle gracefully
    return NextResponse.json({ 
      markets: [],
      error: "Failed to fetch Venus markets",
      message: error.message || "Venus Protocol API is currently unavailable"
    });
  }
}

