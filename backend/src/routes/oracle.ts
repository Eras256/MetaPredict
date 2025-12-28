import { Router, Request, Response } from 'express';
import { ConsensusService } from '../services/llm/consensus.service';
import { oracleService } from '../services/oracleService';
import { optionalAuth } from '../middleware/auth';
import { validateChainlinkSignature, validateChainlinkOrigin } from '../utils/chainlinkAuth';
import { logger } from '../utils/logger';

const router = Router();

// ✅ FIX #6: Endpoint for Chainlink Functions that executes LLM consensus
router.post('/resolve', async (req: Request, res: Response) => {
  try {
    // Validate Chainlink Functions request
    const signature = req.headers['x-chainlink-signature'] as string | undefined;
    const secret = req.headers['x-chainlink-secret'] as string | undefined;
    const timestamp = req.headers['x-chainlink-timestamp'] as string | undefined;
    const clientIp = req.ip || req.socket.remoteAddress;
    
    // Validate signature/secret
    const bodyString = JSON.stringify(req.body);
    const authResult = validateChainlinkSignature(signature, secret, bodyString, timestamp);
    
    if (!authResult.isValid) {
      logger.warn(`[Oracle] Invalid Chainlink authentication: ${authResult.reason}`);
      return res.status(401).json({
        error: 'Unauthorized',
        reason: authResult.reason || 'Invalid signature'
      });
    }
    
    // Validate origin (optional IP whitelist)
    const originResult = validateChainlinkOrigin(clientIp);
    if (!originResult.isValid) {
      logger.warn(`[Oracle] Request from unauthorized origin: ${clientIp}`);
      // Don't reject, just log (IP whitelist is optional)
    }

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

// Get oracle status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await oracleService.getOracleStatus();
    res.json({
      status: 'active',
      ...status,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Error fetching oracle status:', error);
    res.status(500).json({
      error: 'Failed to get oracle status',
      details: error.message,
    });
  }
});

// Request resolution for a market
router.post('/request-resolution/:marketId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const marketId = Number(req.params.marketId);
    const result = await oracleService.requestResolution(marketId);
    res.json({ result });
  } catch (error: any) {
    console.error('Error requesting resolution:', error);
    res.status(500).json({
      error: 'Failed to request resolution',
      details: error.message,
    });
  }
});

// File dispute
router.post('/dispute', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { marketId, reason } = req.body;
    const userId = req.user?.id || req.body.userId;
    
    if (!marketId || !reason) {
      return res.status(400).json({ error: 'marketId and reason are required' });
    }
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const dispute = await oracleService.fileDispute(Number(marketId), userId, reason);
    res.status(201).json({ dispute });
  } catch (error: any) {
    console.error('Error filing dispute:', error);
    res.status(500).json({
      error: 'Failed to file dispute',
      details: error.message,
    });
  }
});

// Get disputes
router.get('/disputes', async (req: Request, res: Response) => {
  try {
    const marketId = req.query.marketId ? Number(req.query.marketId) : undefined;
    const disputes = await oracleService.getDisputes(marketId);
    res.json({ disputes });
  } catch (error: any) {
    console.error('Error fetching disputes:', error);
    res.status(500).json({
      error: 'Failed to fetch disputes',
      details: error.message,
    });
  }
});

// Vote on dispute
router.post('/disputes/:disputeId/vote', optionalAuth, async (req: Request, res: Response) => {
  try {
    const disputeId = Number(req.params.disputeId);
    const { vote, weight } = req.body;
    const userId = req.user?.id || req.body.userId;
    
    if (!userId || vote === undefined || !weight) {
      return res.status(400).json({ error: 'userId, vote, and weight are required' });
    }
    
    const result = await oracleService.voteOnDispute(
      disputeId,
      userId,
      Boolean(vote),
      parseFloat(weight)
    );
    res.json({ result });
  } catch (error: any) {
    console.error('Error voting on dispute:', error);
    res.status(500).json({
      error: 'Failed to vote on dispute',
      details: error.message,
    });
  }
});

export default router;
