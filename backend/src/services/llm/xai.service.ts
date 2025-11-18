import axios from 'axios';

export interface LLMResponse {
  answer: 'YES' | 'NO' | 'INVALID';
  confidence: number;
  reasoning: string;
}

export class XAIService {
  private apiKey: string;
  private baseUrl = 'https://api.x.ai/v1/chat/completions';
  private model = 'grok-4-latest'; // Modelo más reciente de Grok

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
              content: 'You are an expert prediction market analyst. Analyze questions and respond with ONLY one word: YES, NO, or INVALID.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 10,
          stream: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const responseText = response.data.choices?.[0]?.message?.content || '';
      const answer = responseText.trim().toUpperCase();

      let result: 'YES' | 'NO' | 'INVALID' = 'INVALID';
      if (answer.includes('YES')) result = 'YES';
      else if (answer.includes('NO')) result = 'NO';

      return {
        answer: result,
        confidence: 85, // Grok es un modelo potente
        reasoning: answer,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.error || error.message || 'Unknown error';
      const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : '';
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error(`[XAIService] 403/401 Error details:`, errorDetails);
        throw new Error(`xAI API authentication failed: ${errorMessage}. Details: ${errorDetails}`);
      }
      
      if (error.response?.status === 429) {
        throw new Error(`xAI API rate limit exceeded: ${errorMessage}`);
      }

      throw new Error(`xAI API error: ${errorMessage}`);
    }
  }
}

