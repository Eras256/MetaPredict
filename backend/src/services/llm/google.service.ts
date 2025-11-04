import axios from 'axios';

export interface LLMResponse {
  answer: 'YES' | 'NO' | 'INVALID';
  confidence: number;
  reasoning: string;
}

export class GoogleService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const answer = response.data.candidates[0].content.parts[0].text.trim().toUpperCase();
      
      let result: 'YES' | 'NO' | 'INVALID' = 'INVALID';
      if (answer.includes('YES')) result = 'YES';
      else if (answer.includes('NO')) result = 'NO';

      return {
        answer: result,
        confidence: 82, // Gemini confidence
        reasoning: answer,
      };
    } catch (error) {
      console.error('Google API error:', error);
      return {
        answer: 'INVALID',
        confidence: 0,
        reasoning: 'API error',
      };
    }
  }
}

