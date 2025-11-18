import axios from 'axios';

export interface LLMResponse {
  answer: 'YES' | 'NO' | 'INVALID';
  confidence: number;
  reasoning: string;
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

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
          model: 'gpt-3.5-turbo', // Usando tier gratuito para hackathon
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
        confidence: 80, // GPT-3.5 Turbo confidence
        reasoning: answer,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        answer: 'INVALID',
        confidence: 0,
        reasoning: 'API error',
      };
    }
  }
}

