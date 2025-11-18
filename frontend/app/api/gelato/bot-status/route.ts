import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 10;

/**
 * GET /api/gelato/bot-status
 * @description Gets Oracle Bot status
 * @note In Next.js API Routes, the bot runs via Vercel Cron Jobs
 * This endpoint returns the status of the cron job execution
 */
export async function GET(request: NextRequest) {
  try {
    // In Next.js, the Oracle Bot runs via Vercel Cron Jobs
    // We can check the last execution time from environment or a simple status
    // For now, return a status indicating the bot is configured for cron execution
    
    const isConfigured = !!(
      process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS &&
      process.env.NEXT_PUBLIC_CORE_CONTRACT_ADDRESS
    );

    return NextResponse.json({
      isRunning: false, // Bot runs via cron, not continuously
      monitorStatus: {
        isMonitoring: false,
        aiOracleAddress: process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS || "",
        predictionMarketAddress: process.env.NEXT_PUBLIC_CORE_CONTRACT_ADDRESS || "",
        chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "5611"),
        processedCount: 0,
        note: "Oracle Bot runs via Vercel Cron Jobs. Check /api/cron/oracle-check for execution status."
      },
      configured: isConfigured,
      message: isConfigured 
        ? "Oracle Bot configured for Vercel Cron execution" 
        : "Oracle Bot not configured. Set NEXT_PUBLIC_AI_ORACLE_ADDRESS and NEXT_PUBLIC_CORE_CONTRACT_ADDRESS"
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

