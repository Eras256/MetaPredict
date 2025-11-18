import axios from 'axios';
import { LLMResponse } from './groq.service';

export class GroqLlamaService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private model = 'llama-3.1-8b-instant';

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
          model: this.model,
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
          },
        }
      );

      const answer = response.data.choices[0].message.content.trim().toUpperCase();
      
      let result: 'YES' | 'NO' | 'INVALID' = 'INVALID';
      if (answer.includes('YES')) result = 'YES';
      else if (answer.includes('NO')) result = 'NO';

      return {
        answer: result,
        confidence: 82,
        reasoning: answer,
      };
    } catch (error: any) {
      console.error(`[GroqLlamaService] API error:`, error.response?.data || error.message);
      throw new Error(`Groq Llama 3.1 error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

