import axios from 'axios';
import { LLMResponse } from './groq.service';

/**
 * Servicio específico para OpenRouter usando Mistral 7B Instruct (gratuito)
 * Modelo: mistralai/mistral-7b-instruct:free
 */
export class OpenRouterMistralService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private modelName = 'mistralai/mistral-7b-instruct:free';

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

      console.log(`[OpenRouterMistralService] ✅ Modelo ${this.modelName} respondió: ${result}`);
      return {
        answer: result,
        confidence: 78, // Confianza para Mistral 7B
        reasoning: answer,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      console.error(`[OpenRouterMistralService] ❌ Error: ${errorMessage}`);
      throw new Error(`OpenRouter Mistral error: ${errorMessage}`);
    }
  }
}

