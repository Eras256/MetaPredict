import { NextRequest, NextResponse } from 'next/server';
import { getChainlinkReport, validateStreamId } from '@/lib/services/chainlinkDataStreamsService';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/oracle/chainlink/report/:streamId
 * 
 * Fetches the latest price report from Chainlink Data Streams for a specific Stream ID.
 * 
 * This route implements the logic directly following the pattern of other Next.js API routes.
 * Uses the official Chainlink Data Streams TypeScript SDK for reliable data fetching.
 * 
 * Documentation: https://docs.chain.link/data-streams/reference/data-streams-api/ts-sdk
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ streamId: string }> }
) {
  try {
    const { streamId } = await params;

    if (!streamId) {
      return NextResponse.json(
        { error: 'streamId is required' },
        { status: 400 }
      );
    }

    // Validate streamId format
    if (!validateStreamId(streamId)) {
      return NextResponse.json(
        {
          error: 'Invalid streamId format',
          details: 'Stream ID must be a valid bytes32 hex string (0x + 64 hex characters)',
        },
        { status: 400 }
      );
    }

    // Fetch report from Chainlink Data Streams API using SDK
    const report = await getChainlinkReport(streamId);

    return NextResponse.json({
      success: true,
      report, // Hex string of the report (binary format converted to hex)
      streamId,
    });
  } catch (error: any) {
    console.error('[Chainlink Data Streams] Error in API route:', error);
    
    // Log stack trace in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Chainlink Data Streams] Error stack:', error.stack);
      console.error('[Chainlink Data Streams] Error details:', {
        message: error.message,
        name: error.name,
        code: error.code,
      });
    }

    // Use the error message from the service (already has helpful context)
    const errorMessage = error.message || 'Unknown error occurred';
    
    // Determine appropriate status code
    let statusCode = 500;
    if (errorMessage.includes('Stream ID not found') || errorMessage.includes('404')) {
      statusCode = 404;
    } else if (errorMessage.includes('Invalid streamId format') || errorMessage.includes('400')) {
      statusCode = 400;
    } else if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      statusCode = 401;
    } else if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
      statusCode = 403;
    }

    // Return error with appropriate details
    return NextResponse.json(
      {
        error: 'Failed to fetch Chainlink report',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
          name: error.name,
        }),
      },
      { status: statusCode }
    );
  }
}
