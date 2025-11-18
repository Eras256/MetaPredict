import { GoogleGenerativeAI } from '@google/generative-ai';

// Verificar que la API key esté configurada
// Backend puede usar GEMINI_API_KEY o GOOGLE_API_KEY (son lo mismo)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('[AI] ⚠️ GEMINI_API_KEY is not set in environment variables');
  console.error('[AI] Please set GEMINI_API_KEY or GOOGLE_API_KEY in your .env file');
}

const genAI = GEMINI_API_KEY
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;

// Modelos en orden de preferencia con fallback
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
    throw new Error('GEMINI_API_KEY no está configurada. Por favor, configura GEMINI_API_KEY o GOOGLE_API_KEY en tu archivo .env');
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

  // Extraer texto de la respuesta de manera segura
  // Según la documentación actualizada de Gemini API (2025), text() devuelve un string directamente
  let responseText: string;
  try {
    // Verificar que result.response existe y tiene el método text
    if (!result || !result.response) {
      console.error('[AI] Invalid response structure:', result);
      throw new Error('Invalid Gemini response structure');
    }

    // Obtener el texto de la respuesta
    // En algunas versiones, text() puede devolver directamente un string o necesitar await
    const textResult = result.response.text();
    
    // Manejar tanto string directo como Promise
    if (typeof textResult === 'string') {
      responseText = textResult;
    } else if (textResult && typeof textResult.then === 'function') {
      // Es una Promise
      responseText = await textResult;
    } else {
      // Intentar acceder a candidatos directamente (nueva API de Gemini 2.5)
      const candidates = result.response.candidates;
      if (candidates && candidates.length > 0 && candidates[0].content) {
        const parts = candidates[0].content.parts;
        if (parts && parts.length > 0 && parts[0].text) {
          responseText = parts[0].text;
        } else {
          throw new Error('Unable to extract text from Gemini response candidates');
        }
      } else {
        console.error('[AI] Unexpected response structure:', {
          textResult,
          response: result.response,
          candidates: result.response?.candidates
        });
        throw new Error(`Gemini returned unexpected response type: ${typeof textResult}`);
      }
    }
    
    // Verificar que sea un string válido
    if (typeof responseText !== 'string') {
      console.error('[AI] Unexpected response type:', typeof responseText, responseText);
      throw new Error(`Gemini returned non-string response: ${typeof responseText}`);
    }
  } catch (error: any) {
    console.error('[AI] Error extracting text from Gemini response:', error);
    console.error('[AI] Response object structure:', {
      hasResponse: !!result?.response,
      hasCandidates: !!result?.response?.candidates,
      responseType: typeof result?.response
    });
    throw new Error(`Failed to extract text from Gemini response: ${error.message}`);
  }

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

  if (!responseText || typeof responseText !== 'string') {
    throw new Error('Invalid response from Gemini: response is not a string');
  }

  // Limpiar la respuesta: remover markdown code blocks si existen
  let cleanedText = responseText.trim();
  
  // Remover markdown code blocks (```json ... ```)
  cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Remover markdown code blocks genéricos (``` ... ```)
  cleanedText = cleanedText.replace(/```[\s\S]*?```/g, '');
  
  // Buscar el primer objeto JSON válido
  // Intentar múltiples estrategias de extracción
  let parsed: T | null = null;
  let lastError: Error | null = null;

  // Estrategia 1: Intentar parsear directamente
  try {
    parsed = JSON.parse(cleanedText);
    return { data: parsed, modelUsed };
  } catch (e) {
    lastError = e as Error;
  }

  // Estrategia 2: Buscar el primer objeto JSON con regex mejorado
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      parsed = JSON.parse(jsonMatch[0]);
      return { data: parsed, modelUsed };
    } catch (e) {
      lastError = e as Error;
    }
  }

  // Estrategia 3: Buscar entre llaves balanceadas
  let braceCount = 0;
  let startIdx = -1;
  for (let i = 0; i < cleanedText.length; i++) {
    if (cleanedText[i] === '{') {
      if (startIdx === -1) startIdx = i;
      braceCount++;
    } else if (cleanedText[i] === '}') {
      braceCount--;
      if (braceCount === 0 && startIdx !== -1) {
        try {
          const jsonStr = cleanedText.substring(startIdx, i + 1);
          parsed = JSON.parse(jsonStr);
          return { data: parsed, modelUsed };
        } catch (e) {
          lastError = e as Error;
        }
        startIdx = -1;
      }
    }
  }

  // Si todas las estrategias fallan, lanzar error con contexto
  console.error('[Gemini] Raw response:', responseText);
  console.error('[Gemini] Cleaned response:', cleanedText);
  throw new Error(
    `No valid JSON found in Gemini response. ` +
    `Response preview: ${responseText.substring(0, 200)}... ` +
    `Parse error: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Analiza un mercado de predicción usando Gemini
 * @param question - La pregunta del mercado
 * @param context - Contexto adicional opcional
 * @returns Respuesta estructurada con análisis
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
 * @param topic - Tema o categoría del mercado
 * @returns Sugerencias de preguntas y descripciones
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
 * @param positions - Array de posiciones actuales
 * @param constraints - Restricciones y preferencias
 * @returns Análisis y recomendaciones de rebalanceo
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
 * @param userData - Datos del usuario (votos, accuracy, etc.)
 * @returns Análisis de reputación
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
 * @param marketData - Datos del mercado
 * @returns Análisis de riesgo
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
 * @param proposalData - Datos de la propuesta
 * @returns Análisis de la propuesta
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

