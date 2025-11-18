import axios from 'axios';
import { LLMResponse } from './groq.service';

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  
  // Modelos gratuitos disponibles en OpenRouter (verificados)
  private freeModels = [
    'meta-llama/llama-3.2-3b-instruct:free', // ✅ Funciona
    'mistralai/mistral-7b-instruct:free', // ✅ Funciona
    // Modelos adicionales que pueden estar disponibles
    'google/gemini-2.0-flash-exp:free',
    'google/gemini-flash-1.5:free',
  ];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeMarket(question: string, context?: string): Promise<LLMResponse> {
    const prompt = `Analyze this prediction market question and answer ONLY 'YES', 'NO', or 'INVALID':
${question}
${context ? `Context: ${context}` : ''}

Respond with ONLY one word: YES, NO, or INVALID`;

    let lastError: Error | null = null;

    // Intentar con diferentes modelos gratuitos
    for (const modelName of this.freeModels) {
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
              'HTTP-Referer': 'https://metapredict.vercel.app', // Opcional pero recomendado
              'X-Title': 'MetaPredict', // Opcional pero recomendado
            },
            timeout: 30000,
          }
        );

        const answer = response.data.choices[0].message.content.trim().toUpperCase();
        
        let result: 'YES' | 'NO' | 'INVALID' = 'INVALID';
        if (answer.includes('YES')) result = 'YES';
        else if (answer.includes('NO')) result = 'NO';

        console.log(`[OpenRouterService] ✅ Modelo ${modelName} respondió: ${result}`);
        return {
          answer: result,
          confidence: 80, // OpenRouter usa modelos variados
          reasoning: answer,
        };
      } catch (error: any) {
        lastError = error;
        const errorMessage = error.response?.data?.error?.message || error.message;
        
        // Si es error de modelo no disponible, intentar siguiente
        if (errorMessage?.includes('not found') || errorMessage?.includes('not available')) {
          console.warn(`[OpenRouterService] ⚠️ Modelo ${modelName} no disponible, intentando siguiente...`);
          continue;
        }
        
        // Si es el último modelo, retornar error
        if (modelName === this.freeModels[this.freeModels.length - 1]) {
          console.error(`[OpenRouterService] ❌ Todos los modelos fallaron. Último error (${modelName}):`, errorMessage);
          return {
            answer: 'INVALID',
            confidence: 0,
            reasoning: errorMessage || 'API error',
          };
        }
        
        // Si no es el último, intentar siguiente modelo
        console.warn(`[OpenRouterService] ⚠️ Modelo ${modelName} falló: ${errorMessage}, intentando siguiente...`);
        continue;
      }
    }

    // Si llegamos aquí, todos los modelos fallaron
    return {
      answer: 'INVALID',
      confidence: 0,
      reasoning: lastError?.message || 'Todos los modelos de OpenRouter fallaron',
    };
  }
}

