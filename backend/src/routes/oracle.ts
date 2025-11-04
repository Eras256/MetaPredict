import { Router, Request, Response } from 'express';
import { ConsensusService } from '../services/llm/consensus.service';

const router = Router();

// ✅ FIX #6: Endpoint para Chainlink Functions que ejecuta LLM consensus
router.post('/resolve', async (req: Request, res: Response) => {
  try {
    // Validar request de Chainlink Functions (opcional: verificar signature)
    const signature = req.headers['x-chainlink-signature'];
    // TODO: Implementar validación de signature si es necesario

    const { marketDescription, priceId } = req.body;

    if (!marketDescription) {
      return res.status(400).json({
        error: 'marketDescription is required',
      });
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
    return res.json({
      outcome: result.outcome, // 1=Yes, 2=No, 3=Invalid
      confidence: result.confidence, // 0-100
      consensusCount: result.consensusCount,
      totalModels: result.totalModels,
      votes: result.votes,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Oracle resolution error:', error);
    return res.status(500).json({
      error: 'Resolution failed',
      details: error.message,
    });
  }
});

router.get('/status', async (req: Request, res: Response) => {
  res.json({
    status: 'active',
    timestamp: Date.now(),
  });
});

export default router;
