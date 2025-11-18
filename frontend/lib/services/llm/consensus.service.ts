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
    // Usa GEMINI_API_KEY si está disponible, sino usa GOOGLE_API_KEY como fallback
    const geminiKey = process.env.GEMINI_API_KEY || googleKey;
    if (geminiKey && !geminiKey.includes('your_')) {
      this.google = new GoogleService(geminiKey);
    }
    
    // Inicializar servicio de Groq (Standard)
    if (groqKey && !groqKey.includes('your_')) {
      this.groqLlama = new GroqLlamaService(groqKey);
    }

    // Inicializar servicios específicos de OpenRouter con diferentes modelos
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
    // Orden de prioridad: Gemini -> Groq Llama 3.1 -> OpenRouter Mistral -> OpenRouter Llama -> OpenRouter genérico
    // Consultar LLMs en orden de prioridad con fallback si una falla
    const responses: LLMResponse[] = [];
    const errors: string[] = [];

    // 1. PRIORIDAD 1: Google Gemini 2.5 Flash
    if (this.google) {
      try {
        const response = await this.google.analyzeMarket(question, context);
        responses.push(response);
        console.log('[ConsensusService] ✅ Gemini respondió:', response.answer);
      } catch (error: any) {
        errors.push(`Gemini: ${error.message}`);
        console.warn('[ConsensusService] ⚠️ Gemini falló:', error.message);
      }
    }

    // 2. PRIORIDAD 2: Groq Llama 3.1 (Standard)
    if (this.groqLlama) {
      try {
        const response = await this.groqLlama.analyzeMarket(question, context);
        responses.push(response);
        console.log('[ConsensusService] ✅ Groq Llama 3.1 respondió:', response.answer);
      } catch (error: any) {
        errors.push(`Groq Llama: ${error.message}`);
        console.warn('[ConsensusService] ⚠️ Groq Llama falló:', error.message);
      }
    }

    // 3. PRIORIDAD 3: OpenRouter Mistral 7B (gratuito)
    if (this.openRouterMistral) {
      try {
        const response = await this.openRouterMistral.analyzeMarket(question, context);
        // Solo agregar si no es INVALID por error de modelo
        if (response.confidence > 0) {
          responses.push(response);
          console.log('[ConsensusService] ✅ OpenRouter Mistral respondió:', response.answer);
        } else {
          console.warn('[ConsensusService] ⚠️ OpenRouter Mistral no disponible');
        }
      } catch (error: any) {
        errors.push(`OpenRouter Mistral: ${error.message}`);
        console.warn('[ConsensusService] ⚠️ OpenRouter Mistral falló:', error.message);
      }
    }

    // 4. PRIORIDAD 4: OpenRouter Llama 3.2 3B (gratuito) - Si está disponible
    if (this.openRouterLlama) {
      try {
        const response = await this.openRouterLlama.analyzeMarket(question, context);
        // Solo agregar si no es INVALID por error de modelo
        if (response.confidence > 0) {
          responses.push(response);
          console.log('[ConsensusService] ✅ OpenRouter Llama respondió:', response.answer);
        } else {
          console.warn('[ConsensusService] ⚠️ OpenRouter Llama no disponible');
        }
      } catch (error: any) {
        errors.push(`OpenRouter Llama: ${error.message}`);
        console.warn('[ConsensusService] ⚠️ OpenRouter Llama falló:', error.message);
      }
    }

    // 5. PRIORIDAD 5: OpenRouter Gemini (gratuito) - Modelos Gemini de OpenRouter
    if (this.openRouterGemini) {
      try {
        const response = await this.openRouterGemini.analyzeMarket(question, context);
        // Solo agregar si no es INVALID por error de modelo
        if (response.confidence > 0) {
          responses.push(response);
          console.log('[ConsensusService] ✅ OpenRouter Gemini respondió:', response.answer);
        } else {
          console.warn('[ConsensusService] ⚠️ OpenRouter Gemini no disponible');
        }
      } catch (error: any) {
        errors.push(`OpenRouter Gemini: ${error.message}`);
        console.warn('[ConsensusService] ⚠️ OpenRouter Gemini falló:', error.message);
      }
    }

    // Si no hay respuestas válidas, retornar error
    if (responses.length === 0) {
      throw new Error(`Todas las IAs fallaron: ${errors.join('; ')}`);
    }

    // Contar votos
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

    // Determinar outcome
    let outcome: 1 | 2 | 3;
    if (yesVotes === maxVotes && yesVotes > noVotes && yesVotes > invalidVotes) {
      outcome = 1; // YES
    } else if (noVotes === maxVotes && noVotes > yesVotes && noVotes > invalidVotes) {
      outcome = 2; // NO
    } else {
      outcome = 3; // INVALID
    }

    // Si el consenso es bajo, retornar INVALID
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

