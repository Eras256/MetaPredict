import axios from 'axios';
import { LLMResponse } from './groq.service';

/**
 * Servicio específico para OpenRouter usando Llama 3.2 3B Instruct (gratuito)
 * Modelo: meta-llama/llama-3.2-3b-instruct:free
 * Nota: Puede no estar disponible siempre, pero está preparado para cuando funcione
 */
export class OpenRouterLlamaService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private modelName = 'meta-llama/llama-3.2-3b-instruct:free';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeMarket(question: string, context?: string): Promise<LLMResponse> {
    const prompt = `Analyze this prediction market question and answer ONLY 'YES', 'NO', or 'INVALID':
${question}
${context ? `Context: ${context}` : ''}

Respond with ONLY one word: YES, NO, or INVALID`;

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.modelName,
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

      console.log(`[OpenRouterLlamaService] ✅ Modelo ${this.modelName} respondió: ${result}`);
      return {
        answer: result,
        confidence: 75, // Confianza para Llama 3.2 3B
        reasoning: answer,
      };
      } catch (error: any) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        // Si el error es "Provider returned error", puede ser temporal, intentar una vez más
        if (errorMessage?.includes('Provider returned error')) {
          console.warn(`[OpenRouterLlamaService] ⚠️ Error temporal, reintentando...`);
          // Reintentar una vez
          try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
            const retryResponse = await axios.post(
              this.baseUrl,
              {
                model: this.modelName,
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

            const retryAnswer = retryResponse.data.choices[0].message.content.trim().toUpperCase();
            let retryResult: 'YES' | 'NO' | 'INVALID' = 'INVALID';
            if (retryAnswer.includes('YES')) retryResult = 'YES';
            else if (retryAnswer.includes('NO')) retryResult = 'NO';

            console.log(`[OpenRouterLlamaService] ✅ Modelo ${this.modelName} respondió en reintento: ${retryResult}`);
            return {
              answer: retryResult,
              confidence: 75,
              reasoning: retryAnswer,
            };
          } catch (retryError: any) {
            // Si el reintento también falla, retornar INVALID
            console.warn(`[OpenRouterLlamaService] ⚠️ Modelo ${this.modelName} no disponible después de reintento`);
            return {
              answer: 'INVALID',
              confidence: 0,
              reasoning: `Model not available: ${errorMessage}`,
            };
          }
        }
        
        console.warn(`[OpenRouterLlamaService] ⚠️ Modelo ${this.modelName} no disponible: ${errorMessage}`);
        // Retornar INVALID en lugar de lanzar error para que el consenso continúe
        return {
          answer: 'INVALID',
          confidence: 0,
          reasoning: `Model not available: ${errorMessage}`,
        };
      }
  }
}

