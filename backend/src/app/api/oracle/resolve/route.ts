import { NextRequest, NextResponse } from 'next/server';
import { ConsensusService } from '@/services/llm/consensus.service';

// ✅ FIX #6: Endpoint para Chainlink Functions que ejecuta LLM consensus

export async function POST(request: NextRequest) {
  try {
    // Validar request de Chainlink Functions (opcional: verificar signature)
    const signature = request.headers.get('x-chainlink-signature');
    // TODO: Implementar validación de signature si es necesario

    const body = await request.json();
    const { marketDescription, priceId } = body;

    if (!marketDescription) {
      return NextResponse.json(
        { error: 'marketDescription is required' },
        { status: 400 }
      );
    }

    // ✅ FIX #6: Inicializar servicio de consenso
    const consensusService = new ConsensusService(
      process.env.OPENAI_API_KEY || '',
      process.env.ANTHROPIC_API_KEY || '',
      process.env.GOOGLE_API_KEY || ''
    );

    // Obtener consenso de múltiples LLMs
    const result = await consensusService.getConsensus(
      marketDescription,
      priceId ? `Price ID: ${priceId}` : undefined,
      0.8 // 80% agreement required
    );

    // ✅ FIX #6: Retornar formato esperado por Chainlink Functions
    return NextResponse.json({
      outcome: result.outcome, // 1=Yes, 2=No, 3=Invalid
      confidence: result.confidence, // 0-100
      consensusCount: result.consensusCount,
      totalModels: result.totalModels,
      votes: result.votes,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Oracle resolution error:', error);
    return NextResponse.json(
      { error: 'Resolution failed', details: error.message },
      { status: 500 }
    );
  }
}

