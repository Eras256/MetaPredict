import { Router, Request, Response } from 'express';
import { ConsensusService } from '../services/llm/consensus.service';

const router = Router();

// ✅ FIX #6: Endpoint for Chainlink Functions that executes LLM consensus
router.post('/resolve', async (req: Request, res: Response) => {
  try {
    // Validate Chainlink Functions request (optional: verify signature)
    const signature = req.headers['x-chainlink-signature'];
    // TODO: Implement signature validation if necessary

    const { marketDescription, priceId } = req.body;

    if (!marketDescription) {
      return res.status(400).json({
        error: 'marketDescription is required',
      });
    }

    // ✅ Initialize consensus service: Gemini + Groq + OpenRouter
    const consensusService = new ConsensusService(
      process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
      process.env.GROQ_API_KEY, // Groq API key (optional)
      process.env.OPENROUTER_API_KEY // OpenRouter API key (optional)
    );

    // Get consensus from multiple LLMs
    const result = await consensusService.getConsensus(
      marketDescription,
      priceId ? `Price ID: ${priceId}` : undefined,
      0.8 // 80% agreement required
    );

    // ✅ FIX #6: Return format expected by Chainlink Functions
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
