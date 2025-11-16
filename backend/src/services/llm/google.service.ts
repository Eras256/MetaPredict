import { analyzeMarketWithGemini } from '@/lib/ai/gemini-advanced';

export interface LLMResponse {
  answer: 'YES' | 'NO' | 'INVALID';
  confidence: number;
  reasoning: string;
}

export class GoogleService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeMarket(question: string, context?: string): Promise<LLMResponse> {
    try {
      const { data, modelUsed } = await analyzeMarketWithGemini(question, context);
      
      console.log(`[GoogleService] Used model: ${modelUsed}`);
      
      return {
        answer: data.answer,
        confidence: data.confidence,
        reasoning: data.reasoning,
      };
    } catch (error: any) {
      console.error('[GoogleService] Error:', error);
      return {
        answer: 'INVALID',
        confidence: 0,
        reasoning: error.message || 'API error',
      };
    }
  }
}

