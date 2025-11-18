import axios from 'axios';

// Verificar que la API key esté configurada
// NOTA: Este archivo solo se ejecuta server-side (API routes), por lo que podemos usar
// variables sin NEXT_PUBLIC_ para mejor seguridad.
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('[AI] ⚠️ GROQ_API_KEY is not set in environment variables');
  console.error('[AI] Please set GROQ_API_KEY in your .env file (server-side only)');
}

const baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

// Modelos en orden de preferencia con fallback
const modelsToTry = [
  'llama-3.1-8b-instant',    // Modelo principal (más rápido)
  'llama-3.1-70b-versatile', // Fallback (puede estar deprecado)
  'mixtral-8x7b-32768',      // Alternativa Mixtral
];

export interface GroqResponse<T = any> {
  data: T;
  modelUsed: string;
}

export interface GroqConfig {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

const defaultConfig: Required<GroqConfig> = {
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 1024,
};

/**
 * Llama a Groq AI con fallback multi-modelo
 * @param prompt - El prompt a enviar
 * @param config - Configuración opcional de generación
 * @returns Respuesta con datos y modelo usado
 */
export async function callGroq(
  prompt: string,
  config: GroqConfig = {}
): Promise<GroqResponse<string>> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY no está configurada. Por favor, configura GROQ_API_KEY en tu archivo .env');
  }

  const generationConfig = { ...defaultConfig, ...config };
  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await axios.post(
        baseUrl,
        {
          model: modelName,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: generationConfig.temperature,
          top_p: generationConfig.topP,
          max_tokens: generationConfig.maxTokens,
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseText = response.data.choices[0].message.content.trim();
      console.log(`[AI] Successfully used Groq model: ${modelName}`);
      
      return {
        data: responseText,
        modelUsed: modelName,
      };
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.response?.data?.error?.message || error.message;
      console.warn(`[AI] Groq model ${modelName} failed:`, errorMessage);
      
      // Si el modelo está deprecado, continuar al siguiente
      if (errorMessage.includes('decommissioned') || errorMessage.includes('deprecated')) {
        continue;
      }
      
      // Si es un error de autenticación, no intentar otros modelos
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error(`Groq API authentication failed: ${errorMessage}`);
      }
      
      continue;
    }
  }

    const errorMessage = (lastError as any)?.response?.data?.error?.message || lastError?.message || 'Unknown error';
    throw new Error(`All Groq models failed: ${errorMessage}`);
}

/**
 * Llama a Groq AI y parsea la respuesta como JSON
 * @param prompt - El prompt a enviar
 * @param config - Configuración opcional de generación
 * @returns Respuesta parseada como JSON
 */
export async function callGroqJSON<T = any>(
  prompt: string,
  config: GroqConfig = {}
): Promise<GroqResponse<T>> {
  const result = await callGroq(prompt, config);
  
  // Intentar parsear JSON de la respuesta
  try {
    // Buscar JSON en la respuesta (puede venir con markdown code blocks)
    const jsonMatch = result.data.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        data: parsed as T,
        modelUsed: result.modelUsed,
      };
    }
    
    // Si no hay JSON, intentar parsear toda la respuesta
    const parsed = JSON.parse(result.data);
    return {
      data: parsed as T,
      modelUsed: result.modelUsed,
    };
  } catch (error) {
    throw new Error(`Failed to parse JSON from Groq response: ${result.data.substring(0, 100)}...`);
  }
}

/**
 * Analiza un mercado de predicción usando Groq
 * @param question - La pregunta del mercado
 * @param context - Contexto adicional opcional
 * @returns Análisis del mercado
 */
export async function analyzeMarketWithGroq(
  question: string,
  context?: string
): Promise<GroqResponse<{
  answer: 'YES' | 'NO' | 'INVALID';
  confidence: number;
  reasoning: string;
}>> {
  const prompt = `Analyze this prediction market question and answer ONLY 'YES', 'NO', or 'INVALID':
${question}
${context ? `Context: ${context}` : ''}

Respond with ONLY one word: YES, NO, or INVALID`;

  try {
    const result = await callGroq(prompt, {
      temperature: 0.1,
      maxTokens: 10,
    });

    const answer = result.data.trim().toUpperCase();
    
    let parsedAnswer: 'YES' | 'NO' | 'INVALID' = 'INVALID';
    if (answer.includes('YES')) parsedAnswer = 'YES';
    else if (answer.includes('NO')) parsedAnswer = 'NO';

    return {
      data: {
        answer: parsedAnswer,
        confidence: 82, // Groq/Llama confidence
        reasoning: answer,
      },
      modelUsed: result.modelUsed,
    };
  } catch (error: any) {
    console.error('[AI] Error analyzing market with Groq:', error);
    throw error;
  }
}

