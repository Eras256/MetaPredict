import axios from 'axios';
import { LLMResponse } from './groq.service';

/**
 * Servicio para OpenRouter usando modelos Gemini gratuitos
 * Intenta usar modelos Gemini gratuitos de OpenRouter como alternativa
 * Modelos: google/gemini-2.0-flash-exp:free, google/gemini-flash-1.5:free
 */
export class OpenRouterGeminiService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  
  // Modelos Gemini gratuitos en OpenRouter (en orden de prioridad)
  private modelsToTry = [
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

    let lastError: any = null;

    // Intentar con diferentes modelos Gemini en orden de prioridad
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

        console.log(`[OpenRouterGeminiService] ✅ Modelo ${modelName} respondió: ${result}`);
        return {
          answer: result,
          confidence: 78, // Confianza para modelos Gemini de OpenRouter
          reasoning: answer,
        };
      } catch (error: any) {
        lastError = error;
        const errorMessage = error.response?.data?.error?.message || error.message;
        console.warn(`[OpenRouterGeminiService] ⚠️ Modelo ${modelName} falló: ${errorMessage}, intentando siguiente...`);
        continue;
      }
    }

    // Si llegamos aquí, todos los modelos fallaron
    console.warn(`[OpenRouterGeminiService] ⚠️ Todos los modelos Gemini de OpenRouter fallaron`);
    return {
      answer: 'INVALID',
      confidence: 0,
      reasoning: lastError?.response?.data?.error?.message || lastError?.message || 'Todos los modelos Gemini de OpenRouter fallaron',
    };
  }
}

