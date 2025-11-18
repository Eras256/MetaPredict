import axios from 'axios';
import { LLMResponse } from './groq.service';

export class GroqLlamaBalancedService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private model = 'llama-3.1-8b-instant'; // Mismo modelo, configuración balanceada

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeMarket(question: string, context?: string): Promise<LLMResponse> {
    const prompt = `Analyze this prediction market question with a balanced perspective. Answer ONLY 'YES', 'NO', or 'INVALID':
${question}
${context ? `Context: ${context}` : ''}

Consider both sides. Respond with ONLY one word: YES, NO, or INVALID`;

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a balanced prediction market oracle. Consider multiple perspectives and provide clear YES/NO/INVALID answers.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.15, // Balance entre conservador y analítico
          max_tokens: 10,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const answer = response.data.choices[0].message.content.trim().toUpperCase();
      
      let result: 'YES' | 'NO' | 'INVALID' = 'INVALID';
      if (answer.includes('YES')) result = 'YES';
      else if (answer.includes('NO')) result = 'NO';

      return {
        answer: result,
        confidence: 79, // Configuración balanceada
        reasoning: answer,
      };
    } catch (error: any) {
      console.error(`[GroqLlamaBalancedService] API error:`, error.response?.data || error.message);
      throw new Error(`Groq Llama Balanced error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

