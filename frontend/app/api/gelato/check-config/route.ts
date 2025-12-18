import { NextRequest, NextResponse } from 'next/server';
import { gelatoService } from '@/lib/services/gelatoService';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/gelato/check-config
 * @description Check if Gelato is properly configured
 */
export async function GET(request: NextRequest) {
  try {
    const config = await gelatoService.checkConfiguration();
    
    // Additional checks
    const gelatoAutomateKey = process.env.GELATO_AUTOMATE_API_KEY;
    const gelatoRelayKey = process.env.GELATO_RELAY_API_KEY;
    const gelatoRpcUrl = process.env.GELATO_RPC_URL_TESTNET;
    
    return NextResponse.json({
      ...config,
      details: {
        GELATO_AUTOMATE_API_KEY: gelatoAutomateKey ? '✅ Present' : '❌ Missing',
        GELATO_RELAY_API_KEY: gelatoRelayKey ? '✅ Present' : '❌ Missing',
        GELATO_RPC_URL_TESTNET: gelatoRpcUrl ? '✅ Present' : '❌ Missing',
        apiKeyUsed: gelatoAutomateKey || gelatoRelayKey || 'None',
      },
      recommendations: {
        ...(config.configured ? [] : [
          'Configure GELATO_AUTOMATE_API_KEY or GELATO_RELAY_API_KEY in Vercel',
          'Get your API key from https://relay.gelato.network/',
          'For opBNB Testnet, use Gelato Relay API key',
        ]),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        configured: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

