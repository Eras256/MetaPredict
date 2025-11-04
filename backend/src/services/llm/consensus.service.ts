import { OpenAIService, LLMResponse } from './openai.service';
import { AnthropicService } from './anthropic.service';
import { GoogleService } from './google.service';

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
  private openAI: OpenAIService;
  private anthropic: AnthropicService;
  private google: GoogleService;

  constructor(
    openAIKey: string,
    anthropicKey: string,
    googleKey: string
  ) {
    this.openAI = new OpenAIService(openAIKey);
    this.anthropic = new AnthropicService(anthropicKey);
    this.google = new GoogleService(googleKey);
  }

  async getConsensus(
    question: string,
    context?: string,
    requiredAgreement: number = 0.8
  ): Promise<ConsensusResult> {
    // ✅ FIX #6: Consultar 3 LLMs en paralelo
    const [openAIResult, anthropicResult, googleResult] = await Promise.all([
      this.openAI.analyzeMarket(question, context),
      this.anthropic.analyzeMarket(question, context),
      this.google.analyzeMarket(question, context),
    ]);

    const responses = [openAIResult, anthropicResult, googleResult];

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

