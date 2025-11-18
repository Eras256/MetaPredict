import axios from 'axios';
import { LLMResponse } from './groq.service';

export class GroqLlamaConservativeService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private model = 'llama-3.1-8b-instant'; // Mismo modelo, configuración conservadora

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeMarket(question: string, context?: string): Promise<LLMResponse> {
    const prompt = `Analyze this prediction market question carefully and conservatively. Answer ONLY 'YES', 'NO', or 'INVALID':
${question}
${context ? `Context: ${context}` : ''}

Be conservative in your analysis. Respond with ONLY one word: YES, NO, or INVALID`;

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a conservative prediction market oracle. Analyze questions carefully and provide clear YES/NO/INVALID answers. When uncertain, prefer INVALID.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.0, // Más conservador (temperatura 0)
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
        confidence: 80, // Configuración conservadora
        reasoning: answer,
      };
    } catch (error: any) {
      console.error(`[GroqLlamaConservativeService] API error:`, error.response?.data || error.message);
      throw new Error(`Groq Llama Conservative error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

