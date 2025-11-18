import axios from 'axios';

export interface LLMResponse {
  answer: 'YES' | 'NO' | 'INVALID';
  confidence: number;
  reasoning: string;
}

export class GroqService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  // Modelos disponibles en Groq (gratuitos en tier free)
  // Puedes agregar más modelos según necesites
  private modelsToTry = [
    'llama-3.1-8b-instant',           // Prioridad 1: Más rápido, recomendado ⭐
    'mixtral-8x7b-32768',             // Prioridad 2: Alternativa rápida ⭐
    'qwen-2.5-14b-instruct',          // Prioridad 3: Buen balance velocidad/calidad
    'deepseek-r1-distill-llama-8b',  // Prioridad 4: Razonamiento profundo
    'llama-3.1-70b-versatile',        // Prioridad 5: Más capacidad
    // Otros modelos disponibles:
    // 'gemma-7b-it',                 // Gemma de Google
    // 'gemma2-9b-it',                // Gemma 2
    // 'llama-3.2-3b-instruct',      // Llama 3.2 pequeño
    // 'llama-3.2-11b-vision-instruct', // Llama 3.2 con visión
    // 'qwen-2.5-7b-instruct',        // Qwen pequeño
    // 'mixtral-8x22b-instruct',      // Mixtral grande
  ];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeMarket(question: string, context?: string): Promise<LLMResponse> {
    const prompt = `Analyze this prediction market question and answer ONLY 'YES', 'NO', or 'INVALID':
${question}
${context ? `Context: ${context}` : ''}

Respond with ONLY one word: YES, NO, or INVALID`;

    // Intentar con múltiples modelos en orden de prioridad
    let lastError: Error | null = null;

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
          }
        );

        const answer = response.data.choices[0].message.content.trim().toUpperCase();
        
        let result: 'YES' | 'NO' | 'INVALID' = 'INVALID';
        if (answer.includes('YES')) result = 'YES';
        else if (answer.includes('NO')) result = 'NO';

        // Ajustar confidence según el modelo usado
        let confidence = 82; // Default para llama-3.1-8b-instant
        if (modelName.includes('70b') || modelName.includes('405b')) confidence = 85; // Modelos grandes
        else if (modelName.includes('mixtral')) confidence = 80; // Mixtral
        else if (modelName.includes('qwen-2.5-14b')) confidence = 81; // Qwen 14B
        else if (modelName.includes('qwen-2.5-7b')) confidence = 79; // Qwen 7B
        else if (modelName.includes('deepseek-r1')) confidence = 82; // DeepSeek R1
        else if (modelName.includes('gemma2')) confidence = 79; // Gemma 2
        else if (modelName.includes('gemma')) confidence = 78; // Gemma
        else if (modelName.includes('llama-3.2-11b')) confidence = 80; // Llama 3.2 11B
        else if (modelName.includes('llama-3.2-3b')) confidence = 75; // Llama 3.2 3B

        console.log(`[GroqService] ✅ Modelo ${modelName} respondió: ${result}`);
        return {
          answer: result,
          confidence,
          reasoning: answer,
        };
      } catch (error: any) {
        lastError = error;
        const errorMessage = error.response?.data?.error?.message || error.message;
        
        // Si es el último modelo, lanzar error
        if (modelName === this.modelsToTry[this.modelsToTry.length - 1]) {
          console.error(`[GroqService] ❌ Todos los modelos fallaron. Último error (${modelName}):`, errorMessage);
          return {
            answer: 'INVALID',
            confidence: 0,
            reasoning: errorMessage || 'API error',
          };
        }
        
        // Si no es el último, intentar siguiente modelo
        console.warn(`[GroqService] ⚠️ Modelo ${modelName} falló: ${errorMessage}, intentando siguiente...`);
        continue;
      }
    }

    // Si llegamos aquí, todos los modelos fallaron
    return {
      answer: 'INVALID',
      confidence: 0,
      reasoning: lastError?.message || 'Todos los modelos de Groq fallaron',
    };
  }
}

