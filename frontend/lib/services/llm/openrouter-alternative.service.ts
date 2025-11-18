import axios from 'axios';
import { LLMResponse } from './groq.service';

/**
 * Servicio alternativo para OpenRouter que intenta múltiples modelos gratuitos
 * Útil como fallback o para reemplazar modelos no disponibles
 * 
 * Modelos que intenta (en orden de prioridad):
 * 1. meta-llama/llama-3.2-3b-instruct:free
 * 2. mistralai/mistral-7b-instruct:free
 * 3. Otros modelos gratuitos si están disponibles
 */
export class OpenRouterAlternativeService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  
  // Modelos a intentar en orden de prioridad
  private modelsToTry = [
    'meta-llama/llama-3.2-3b-instruct:free', // Llama 3.2 3B
    'mistralai/mistral-7b-instruct:free', // Mistral 7B (ya usado en otro servicio, pero como fallback)
    // Modelos adicionales que pueden estar disponibles
    'google/gemini-2.0-flash-exp:free',
    'qwen/qwen-2.5-7b-instruct:free',
    'huggingfaceh4/zephyr-7b-beta:free',
    'openchat/openchat-7b:free',
  ];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeMarket(question: string, context?: string): Promise<LLMResponse> {
    const prompt = `Analyze this prediction market question and answer ONLY 'YES', 'NO', or 'INVALID':
${question}
${context ? `Context: ${context}` : ''}

Respond with ONLY one word: YES, NO, or INVALID`;

    let lastError: any = null;

    // Intentar con diferentes modelos en orden de prioridad
    for (const modelName of this.modelsToTry) {
      try {
        const response = await axios.post(
          this.baseUrl,
          {
            model: modelName,
            messages: [
              {
                role: 'system',
                content: 'You are a prediction market oracle. Analyze questions and provide clear YES/NO/INVALID answers.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.1,
            max_tokens: 10,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://metapredict.vercel.app',
              'X-Title': 'MetaPredict',
            },
            timeout: 30000,
          }
        );

        const answer = response.data.choices[0].message.content.trim().toUpperCase();
        
        let result: 'YES' | 'NO' | 'INVALID' = 'INVALID';
        if (answer.includes('YES')) result = 'YES';
        else if (answer.includes('NO')) result = 'NO';

        console.log(`[OpenRouterAlternativeService] ✅ Modelo ${modelName} respondió: ${result}`);
        return {
          answer: result,
          confidence: 76, // Confianza para modelos alternativos
          reasoning: answer,
        };
      } catch (error: any) {
        lastError = error;
        const errorMessage = error.response?.data?.error?.message || error.message;
        console.warn(`[OpenRouterAlternativeService] ⚠️ Modelo ${modelName} falló: ${errorMessage}, intentando siguiente...`);
        continue;
      }
    }

    // Si llegamos aquí, todos los modelos fallaron
    console.error(`[OpenRouterAlternativeService] ❌ Todos los modelos fallaron. Último error:`, lastError?.response?.data || lastError?.message);
    return {
      answer: 'INVALID',
      confidence: 0,
      reasoning: lastError?.response?.data?.error?.message || lastError?.message || 'Todos los modelos de OpenRouter fallaron',
    };
  }
}

