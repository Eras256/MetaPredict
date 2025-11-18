import axios from 'axios';
import { LLMResponse } from './groq.service';

export class GroqLlamaAnalyticalService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private model = 'llama-3.1-8b-instant'; // Mismo modelo, enfoque analítico

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeMarket(question: string, context?: string): Promise<LLMResponse> {
    const prompt = `Perform a detailed analytical analysis of this prediction market question. Consider all factors carefully. Answer ONLY 'YES', 'NO', or 'INVALID':
${question}
${context ? `Context: ${context}` : ''}

Analyze thoroughly. Respond with ONLY one word: YES, NO, or INVALID`;

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an analytical prediction market oracle. Perform detailed analysis considering multiple factors. Provide clear YES/NO/INVALID answers.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.2, // Ligeramente más creativo para análisis
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
        confidence: 81, // Enfoque analítico
        reasoning: answer,
      };
    } catch (error: any) {
      console.error(`[GroqLlamaAnalyticalService] API error:`, error.response?.data || error.message);
      throw new Error(`Groq Llama Analytical error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

