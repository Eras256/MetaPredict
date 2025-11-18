import axios from 'axios';
import { LLMResponse } from './groq.service';

export class CometAPIService {
  private apiKey: string;
  private baseUrl = 'https://api.cometapi.com/v1/chat/completions';
  
  // Modelos disponibles en CometAPI (500+ modelos)
  // Intentaremos con modelos que puedan estar disponibles sin quota
  // Nota: CometAPI requiere créditos/quota para la mayoría de modelos
  private modelsToTry = [
    // Modelos que podrían estar disponibles con el tier gratuito
    'gpt-3.5-turbo', // OpenAI (más barato)
    'gpt-4o-mini', // OpenAI (más barato)
    'claude-3-haiku-20240307', // Anthropic (más barato)
    'deepseek-chat', // DeepSeek
    'gemini-1.5-flash', // Google (más barato)
    'llama-3.1-8b-instant', // Meta
    'mistral-small-latest', // Mistral (más barato)
    'qwen-2.5-7b-instruct', // Qwen
  ];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeMarket(question: string, context?: string): Promise<LLMResponse> {
    const prompt = `Analyze this prediction market question and answer ONLY 'YES', 'NO', or 'INVALID':
${question}
${context ? `Context: ${context}` : ''}

Respond with ONLY one word: YES, NO, or INVALID`;

    let lastError: Error | null = null;

    // Intentar con diferentes modelos
    for (const modelName of this.modelsToTry) {
      try {
        const response = await axios.post(
          this.baseUrl,
          {
            model: modelName,
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
            timeout: 30000,
          }
        );

        const answer = response.data.choices[0].message.content.trim().toUpperCase();
        
        let result: 'YES' | 'NO' | 'INVALID' = 'INVALID';
        if (answer.includes('YES')) result = 'YES';
        else if (answer.includes('NO')) result = 'NO';

        console.log(`[CometAPIService] ✅ Modelo ${modelName} respondió: ${result}`);
        return {
          answer: result,
          confidence: 85, // CometAPI usa modelos de alta calidad
          reasoning: answer,
        };
      } catch (error: any) {
        lastError = error;
        const errorMessage = error.response?.data?.error?.message || error.message;
        
        // Si es error de modelo no disponible, intentar siguiente
        if (errorMessage?.includes('not found') || errorMessage?.includes('not available') || errorMessage?.includes('invalid model')) {
          console.warn(`[CometAPIService] ⚠️ Modelo ${modelName} no disponible, intentando siguiente...`);
          continue;
        }
        
        // Si es el último modelo, retornar error
        if (modelName === this.modelsToTry[this.modelsToTry.length - 1]) {
          console.error(`[CometAPIService] ❌ Todos los modelos fallaron. Último error (${modelName}):`, errorMessage);
          return {
            answer: 'INVALID',
            confidence: 0,
            reasoning: errorMessage || 'API error',
          };
        }
        
        // Si no es el último, intentar siguiente modelo
        console.warn(`[CometAPIService] ⚠️ Modelo ${modelName} falló: ${errorMessage}, intentando siguiente...`);
        continue;
      }
    }

    // Si llegamos aquí, todos los modelos fallaron
    return {
      answer: 'INVALID',
      confidence: 0,
      reasoning: lastError?.message || 'Todos los modelos de CometAPI fallaron',
    };
  }
}

