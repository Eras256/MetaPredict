import { Router, Request, Response } from 'express';
import {
  callGemini,
  callGeminiJSON,
  analyzeMarketWithGemini,
  suggestMarketCreation,
  analyzePortfolioRebalance,
  analyzeReputation,
  analyzeInsuranceRisk,
  analyzeDAOProposal,
} from '../lib/ai/gemini-advanced';

const router = Router();

/**
 * Test endpoint para validar conectividad con Gemini
 */
router.get('/test', async (req: Request, res: Response) => {
  try {
    const { data, modelUsed } = await callGemini(
      'Responde con un JSON: {"status": "ok", "message": "Gemini está funcionando correctamente"}'
    );

    return res.json({
      success: true,
      data: { response: data, modelUsed },
      message: 'Gemini AI está conectado correctamente',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al conectar con Gemini',
    });
  }
});

/**
 * Analiza un mercado de predicción
 */
router.post('/analyze-market', async (req: Request, res: Response) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'question is required',
      });
    }

    const { data, modelUsed } = await analyzeMarketWithGemini(question, context);

    return res.json({
      success: true,
      data,
      modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] Analyze market error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al analizar mercado',
    });
  }
});

/**
 * Genera sugerencias para crear un mercado
 */
router.post('/suggest-market', async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'topic is required',
      });
    }

    const { data, modelUsed } = await suggestMarketCreation(topic);

    return res.json({
      success: true,
      data,
      modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] Suggest market error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al generar sugerencias',
    });
  }
});

/**
 * Analiza portfolio y sugiere rebalanceo
 */
router.post('/portfolio-analysis', async (req: Request, res: Response) => {
  try {
    const { positions, constraints } = req.body;

    if (!positions || !Array.isArray(positions)) {
      return res.status(400).json({
        success: false,
        error: 'positions array is required',
      });
    }

    const { data, modelUsed } = await analyzePortfolioRebalance(positions, constraints);

    return res.json({
      success: true,
      data,
      modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] Portfolio analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al analizar portfolio',
    });
  }
});

/**
 * Analiza reputación de usuario
 */
router.post('/reputation-analysis', async (req: Request, res: Response) => {
  try {
    const { userData } = req.body;

    if (!userData) {
      return res.status(400).json({
        success: false,
        error: 'userData is required',
      });
    }

    const { data, modelUsed } = await analyzeReputation(userData);

    return res.json({
      success: true,
      data,
      modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] Reputation analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al analizar reputación',
    });
  }
});

/**
 * Analiza riesgo de insurance para un mercado
 */
router.post('/insurance-risk', async (req: Request, res: Response) => {
  try {
    const { marketData } = req.body;

    if (!marketData) {
      return res.status(400).json({
        success: false,
        error: 'marketData is required',
      });
    }

    const { data, modelUsed } = await analyzeInsuranceRisk(marketData);

    return res.json({
      success: true,
      data,
      modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] Insurance risk analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al analizar riesgo',
    });
  }
});

/**
 * Analiza propuesta DAO
 */
router.post('/dao-analysis', async (req: Request, res: Response) => {
  try {
    const { proposalData } = req.body;

    if (!proposalData) {
      return res.status(400).json({
        success: false,
        error: 'proposalData is required',
      });
    }

    const { data, modelUsed } = await analyzeDAOProposal(proposalData);

    return res.json({
      success: true,
      data,
      modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] DAO analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al analizar propuesta',
    });
  }
});

/**
 * Endpoint genérico para llamadas personalizadas a Gemini
 */
router.post('/call', async (req: Request, res: Response) => {
  try {
    const { prompt, config, returnJSON } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'prompt is required',
      });
    }

    let result;
    if (returnJSON) {
      result = await callGeminiJSON(prompt, config);
    } else {
      result = await callGemini(prompt, config);
    }

    return res.json({
      success: true,
      data: result.data,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error('[AI] Generic call error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al llamar a Gemini',
    });
  }
});

export default router;

