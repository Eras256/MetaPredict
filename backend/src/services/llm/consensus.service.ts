import { GoogleService } from './google.service';
import { GroqLlamaService } from './groq-llama.service';
import { OpenRouterMistralService } from './openrouter-mistral.service';
import { OpenRouterLlamaService } from './openrouter-llama.service';
import { OpenRouterGeminiService } from './openrouter-gemini.service';
import { LLMResponse } from './groq.service';

export interface ConsensusResult {
  outcome: 1 | 2 | 3; // 1=Yes, 2=No, 3=Invalid
  confidence: number; // 0-100
  consensusCount: number;
  totalModels: number;
  votes: {
    yes: number;
    no: number;
    invalid: number;
  };
}

export class ConsensusService {
  private google?: GoogleService;
  private groqLlama?: GroqLlamaService;
  private openRouterMistral?: OpenRouterMistralService;
  private openRouterLlama?: OpenRouterLlamaService;
  private openRouterGemini?: OpenRouterGeminiService;

  constructor(
    googleKey: string,
    groqKey?: string,
    openRouterKey?: string
  ) {
    // Use GEMINI_API_KEY if available, otherwise use GOOGLE_API_KEY as fallback
    const geminiKey = process.env.GEMINI_API_KEY || googleKey;
    if (geminiKey && !geminiKey.includes('your_')) {
      this.google = new GoogleService(geminiKey);
    }
    
    // Initialize Groq service (Standard)
    if (groqKey && !groqKey.includes('your_')) {
      this.groqLlama = new GroqLlamaService(groqKey);
    }

    // Initialize specific OpenRouter services with different models
    if (openRouterKey && !openRouterKey.includes('your_')) {
      this.openRouterMistral = new OpenRouterMistralService(openRouterKey);
      this.openRouterLlama = new OpenRouterLlamaService(openRouterKey);
      this.openRouterGemini = new OpenRouterGeminiService(openRouterKey);
    }
  }

  async getConsensus(
    question: string,
    context?: string,
    requiredAgreement: number = 0.8
  ): Promise<ConsensusResult> {
    // Priority order: Gemini -> Groq Llama 3.1 -> OpenRouter Mistral -> OpenRouter Llama -> OpenRouter generic
    // Query LLMs in priority order with fallback if one fails
    const responses: LLMResponse[] = [];
    const errors: string[] = [];

    // 1. PRIORIDAD 1: Google Gemini 2.5 Flash
    if (this.google) {
      try {
        const response = await this.google.analyzeMarket(question, context);
        responses.push(response);
        console.log('[ConsensusService] ✅ Gemini responded:', response.answer);
      } catch (error: any) {
        errors.push(`Gemini: ${error.message}`);
        console.warn('[ConsensusService] ⚠️ Gemini failed:', error.message);
      }
    }

    // 2. PRIORIDAD 2: Groq Llama 3.1 (Standard)
    if (this.groqLlama) {
      try {
        const response = await this.groqLlama.analyzeMarket(question, context);
        responses.push(response);
        console.log('[ConsensusService] ✅ Groq Llama 3.1 responded:', response.answer);
      } catch (error: any) {
        errors.push(`Groq Llama: ${error.message}`);
        console.warn('[ConsensusService] ⚠️ Groq Llama failed:', error.message);
      }
    }

    // 3. PRIORITY 3: OpenRouter Mistral 7B (free)
    if (this.openRouterMistral) {
      try {
        const response = await this.openRouterMistral.analyzeMarket(question, context);
        // Only add if not INVALID due to model error
        if (response.confidence > 0) {
          responses.push(response);
          console.log('[ConsensusService] ✅ OpenRouter Mistral responded:', response.answer);
        } else {
          console.warn('[ConsensusService] ⚠️ OpenRouter Mistral not available');
        }
      } catch (error: any) {
        errors.push(`OpenRouter Mistral: ${error.message}`);
        console.warn('[ConsensusService] ⚠️ OpenRouter Mistral failed:', error.message);
      }
    }

    // 4. PRIORITY 4: OpenRouter Llama 3.2 3B (free) - If available
    if (this.openRouterLlama) {
      try {
        const response = await this.openRouterLlama.analyzeMarket(question, context);
        // Only add if not INVALID due to model error
        if (response.confidence > 0) {
          responses.push(response);
          console.log('[ConsensusService] ✅ OpenRouter Llama responded:', response.answer);
        } else {
          console.warn('[ConsensusService] ⚠️ OpenRouter Llama not available');
        }
      } catch (error: any) {
        errors.push(`OpenRouter Llama: ${error.message}`);
        console.warn('[ConsensusService] ⚠️ OpenRouter Llama failed:', error.message);
      }
    }

    // 5. PRIORITY 5: OpenRouter Gemini (free) - OpenRouter Gemini models
    if (this.openRouterGemini) {
      try {
        const response = await this.openRouterGemini.analyzeMarket(question, context);
        // Only add if not INVALID due to model error
        if (response && response.confidence > 0) {
          responses.push(response);
          console.log('[ConsensusService] ✅ OpenRouter Gemini responded:', response.answer);
        } else {
          console.warn('[ConsensusService] ⚠️ OpenRouter Gemini not available');
        }
      } catch (error: any) {
        errors.push(`OpenRouter Gemini: ${error?.message || 'Unknown error'}`);
        console.warn('[ConsensusService] ⚠️ OpenRouter Gemini failed:', error?.message || 'Unknown error');
      }
    }

    // If no valid responses, return error
    if (responses.length === 0) {
      throw new Error(`All AIs failed: ${errors.join('; ')}`);
    }

    // Count votes
    let yesVotes = 0;
    let noVotes = 0;
    let invalidVotes = 0;

    for (const response of responses) {
      if (response.answer === 'YES') yesVotes++;
      else if (response.answer === 'NO') noVotes++;
      else invalidVotes++;
    }

    const totalModels = responses.length;
    const maxVotes = Math.max(yesVotes, noVotes, invalidVotes);
    const consensusPercentage = (maxVotes / totalModels) * 100;

    // Determine outcome
    let outcome: 1 | 2 | 3;
    if (yesVotes === maxVotes && yesVotes > noVotes && yesVotes > invalidVotes) {
      outcome = 1; // YES
    } else if (noVotes === maxVotes && noVotes > yesVotes && noVotes > invalidVotes) {
      outcome = 2; // NO
    } else {
      outcome = 3; // INVALID
    }

    // If consensus is low, return INVALID
    if (consensusPercentage < requiredAgreement * 100) {
      outcome = 3;
    }

    return {
      outcome,
      confidence: Math.round(consensusPercentage),
      consensusCount: maxVotes,
      totalModels,
      votes: {
        yes: yesVotes,
        no: noVotes,
        invalid: invalidVotes,
      },
    };
  }
}

