import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  console.error('[AI] GEMINI_API_KEY is not set');
}

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Modelos en orden de preferencia con fallback (gemini-2.5-flash es el principal)
const modelsToTry = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

export interface GeminiResponse<T = any> {
  data: T;
  modelUsed: string;
}

export interface GeminiConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
}

const defaultConfig: Required<GeminiConfig> = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 1024,
};

/**
 * Llama a Gemini AI con fallback multi-modelo
 * @param prompt - El prompt a enviar
 * @param config - Configuración opcional de generación
 * @returns Respuesta con datos y modelo usado
 */
export async function callGemini(
  prompt: string,
  config: GeminiConfig = {}
): Promise<GeminiResponse<string>> {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const generationConfig = { ...defaultConfig, ...config };
  let result: any = null;
  let modelUsed: string = '';
  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig,
      });

      result = await model.generateContent(prompt);
      modelUsed = modelName;
      console.log(`[AI] Successfully used model: ${modelName}`);
      break;
    } catch (error: any) {
      lastError = error;
      console.warn(`[AI] Model ${modelName} failed:`, error.message);
      continue;
    }
  }

  if (!result) {
    throw new Error(`All Gemini models failed: ${lastError?.message || 'Unknown error'}`);
  }

  const responseText = result.response.text();
  return { data: responseText, modelUsed };
}

/**
 * Llama a Gemini y extrae JSON de la respuesta
 * @param prompt - El prompt que solicita respuesta JSON
 * @param config - Configuración opcional
 * @returns Respuesta parseada como JSON
 */
export async function callGeminiJSON<T = any>(
  prompt: string,
  config: GeminiConfig = {}
): Promise<GeminiResponse<T>> {
  const { data: responseText, modelUsed } = await callGemini(prompt, config);

  // Extraer JSON de la respuesta (puede venir envuelto en markdown)
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in Gemini response');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return { data: parsed, modelUsed };
  } catch (error: any) {
    throw new Error(`Failed to parse JSON from Gemini response: ${error.message}`);
  }
}

/**
 * Analiza un mercado de predicción usando Gemini
 */
export async function analyzeMarketWithGemini(
  question: string,
  context?: string
): Promise<GeminiResponse<{ answer: 'YES' | 'NO' | 'INVALID'; confidence: number; reasoning: string }>> {
  const prompt = `Analyze this prediction market question and provide a structured JSON response:
Question: ${question}
${context ? `Context: ${context}` : ''}

Respond with ONLY a valid JSON object in this exact format:
{
  "answer": "YES" | "NO" | "INVALID",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}

Be precise and objective. Answer INVALID if the question is ambiguous, unverifiable, or cannot be objectively resolved.`;

  return callGeminiJSON<{ answer: 'YES' | 'NO' | 'INVALID'; confidence: number; reasoning: string }>(
    prompt,
    {
      temperature: 0.4,
      maxOutputTokens: 256,
    }
  );
}

/**
 * Genera sugerencias para crear un mercado
 */
export async function suggestMarketCreation(
  topic: string
): Promise<GeminiResponse<{ suggestions: Array<{ question: string; description: string; category: string }> }>> {
  const prompt = `Generate 3-5 high-quality prediction market suggestions for the topic: "${topic}"

Each suggestion should be:
- Clear and unambiguous
- Objectively verifiable
- Time-bound
- Interesting and relevant

Respond with ONLY a valid JSON object in this format:
{
  "suggestions": [
    {
      "question": "Will X happen by Y date?",
      "description": "Detailed explanation of the market",
      "category": "crypto|sports|politics|economics|technology|other"
    }
  ]
}`;

  return callGeminiJSON<{ suggestions: Array<{ question: string; description: string; category: string }> }>(
    prompt,
    {
      temperature: 0.7,
      maxOutputTokens: 1024,
    }
  );
}

/**
 * Analiza un portfolio y sugiere rebalanceo
 */
export async function analyzePortfolioRebalance(
  positions: Array<{ marketId: number; question: string; yesShares: number; noShares: number; totalValue: number }>,
  constraints?: { maxRisk?: number; preferredCategories?: string[] }
): Promise<GeminiResponse<{
  riskScore: number;
  allocations: Array<{ marketId: number; recommendedAction: 'increase' | 'decrease' | 'hold'; reasoning: string }>;
  overallRecommendation: string;
  confidence: number;
}>> {
  const positionsSummary = positions.map(p => ({
    marketId: p.marketId,
    question: p.question,
    exposure: p.yesShares + p.noShares,
    value: p.totalValue,
  }));

  const prompt = `Analyze this DeFi prediction market portfolio and provide rebalancing recommendations:

Current Positions:
${JSON.stringify(positionsSummary, null, 2)}

Constraints:
${constraints ? JSON.stringify(constraints, null, 2) : 'None specified'}

Provide a structured JSON response:
{
  "riskScore": 0-100,
  "allocations": [
    {
      "marketId": number,
      "recommendedAction": "increase" | "decrease" | "hold",
      "reasoning": "brief explanation"
    }
  ],
  "overallRecommendation": "summary of portfolio health and actions",
  "confidence": 0-100
}

Consider diversification, risk concentration, market maturity, and liquidity.`;

  return callGeminiJSON<{
    riskScore: number;
    allocations: Array<{ marketId: number; recommendedAction: 'increase' | 'decrease' | 'hold'; reasoning: string }>;
    overallRecommendation: string;
    confidence: number;
  }>(prompt, {
    temperature: 0.5,
    maxOutputTokens: 1024,
  });
}

/**
 * Analiza el comportamiento y reputación de un usuario
 */
export async function analyzeReputation(
  userData: { accuracy: number; totalVotes: number; correctVotes: number; slashes: number; stakes: number }
): Promise<GeminiResponse<{
  reputationScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  confidence: number;
}>> {
  const prompt = `Analyze this user's reputation data in a prediction market:

User Data:
${JSON.stringify(userData, null, 2)}

Provide a structured JSON response:
{
  "reputationScore": 0-100,
  "riskLevel": "low" | "medium" | "high",
  "recommendations": ["actionable recommendation 1", "recommendation 2"],
  "confidence": 0-100
}

Consider accuracy, consistency, stake size, and slashing history.`;

  return callGeminiJSON<{
    reputationScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
    confidence: number;
  }>(prompt, {
    temperature: 0.4,
    maxOutputTokens: 512,
  });
}

/**
 * Analiza el riesgo de un mercado para el pool de insurance
 */
export async function analyzeInsuranceRisk(
  marketData: { question: string; totalVolume: number; yesPool: number; noPool: number; resolutionTime: number }
): Promise<GeminiResponse<{
  riskScore: number;
  recommendedCoverage: number;
  reasoning: string;
  confidence: number;
}>> {
  const prompt = `Analyze the insurance risk for this prediction market:

Market Data:
${JSON.stringify(marketData, null, 2)}

Provide a structured JSON response:
{
  "riskScore": 0-100,
  "recommendedCoverage": percentage (0-100),
  "reasoning": "explanation of risk factors",
  "confidence": 0-100
}

Consider market size, balance, question clarity, and resolution timeline.`;

  return callGeminiJSON<{
    riskScore: number;
    recommendedCoverage: number;
    reasoning: string;
    confidence: number;
  }>(prompt, {
    temperature: 0.4,
    maxOutputTokens: 512,
  });
}

/**
 * Analiza una propuesta DAO
 */
export async function analyzeDAOProposal(
  proposalData: { title: string; description: string; type: string; proposerReputation?: number }
): Promise<GeminiResponse<{
  qualityScore: number;
  recommendation: 'approve' | 'reject' | 'amend';
  reasoning: string;
  suggestedAmendments?: string[];
  confidence: number;
}>> {
  const prompt = `Analyze this DAO governance proposal:

Proposal:
${JSON.stringify(proposalData, null, 2)}

Provide a structured JSON response:
{
  "qualityScore": 0-100,
  "recommendation": "approve" | "reject" | "amend",
  "reasoning": "detailed analysis",
  "suggestedAmendments": ["amendment 1", "amendment 2"] (only if recommendation is "amend"),
  "confidence": 0-100
}

Consider clarity, feasibility, impact, and proposer reputation.`;

  return callGeminiJSON<{
    qualityScore: number;
    recommendation: 'approve' | 'reject' | 'amend';
    reasoning: string;
    suggestedAmendments?: string[];
    confidence: number;
  }>(prompt, {
    temperature: 0.5,
    maxOutputTokens: 1024,
  });
}

