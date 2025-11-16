import { NextRequest, NextResponse } from 'next/server';
import { analyzeDAOProposal } from '@/lib/ai/gemini-advanced';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { proposalData } = await request.json();

    if (!proposalData) {
      return NextResponse.json(
        {
          success: false,
          error: 'proposalData is required',
        },
        { status: 400 }
      );
    }

    const { data, modelUsed } = await analyzeDAOProposal(proposalData);

    return NextResponse.json({
      success: true,
      data,
      modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] DAO analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al analizar propuesta',
      },
      { status: 500 }
    );
  }
}

