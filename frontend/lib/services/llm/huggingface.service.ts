import axios from 'axios';

export interface LLMResponse {
  answer: 'YES' | 'NO' | 'INVALID';
  confidence: number;
  reasoning: string;
}

export class HuggingFaceService {
  private apiKey: string;
  // Endpoint según documentación oficial de noviembre 2025
  // OPCIÓN 1: Inference Endpoint Dedicado (Recomendado para producción)
  // Si tienes un Inference Endpoint creado, usa HUGGINGFACE_ENDPOINT_URL
  // Formato: https://{endpoint-id}.{region}.inference.endpoints.huggingface.cloud
  // OPCIÓN 2: Router Endpoint (Limitado - solo algunos modelos)
  // Formato: router.huggingface.co/hf-inference/models/{model}
  // OPCIÓN 3: Legacy API (Deprecado - no funciona)
  // Ver: https://huggingface.co/docs/inference-endpoints/about
  private dedicatedEndpointUrl: string | undefined;
  private routerUrl = 'https://router.huggingface.co/hf-inference/models';
  private legacyUrl = 'https://api-inference.huggingface.co/models'; // Fallback (deprecado)

  constructor(apiKey: string, dedicatedEndpointUrl?: string) {
    this.apiKey = apiKey;
    this.dedicatedEndpointUrl = dedicatedEndpointUrl || process.env.HUGGINGFACE_ENDPOINT_URL;
  }

  async analyzeMarket(question: string, context?: string): Promise<LLMResponse> {
    const prompt = `Analyze this prediction market question and answer ONLY 'YES', 'NO', or 'INVALID':
${question}
${context ? `Context: ${context}` : ''}

Respond with ONLY one word: YES, NO, or INVALID`;

    // Modelos a probar en orden de preferencia (actualizados para noviembre 2025)
    // Nota: Solo modelos disponibles en Inference Providers funcionan con el router endpoint
    // Modelos que pueden estar disponibles a través de Inference Providers
    const modelsToTry = [
      'meta-llama/Llama-3.1-8B-Instruct',    // Llama 3.1 (disponible en Inference Providers)
      'mistralai/Mistral-7B-Instruct-v0.2',   // Mistral 7B (disponible en Inference Providers)
      'google/flan-t5-base',                  // T5 base (puede estar disponible)
      'microsoft/DialoGPT-medium',            // DialoGPT (fallback)
      'distilgpt2',                          // GPT-2 pequeño (fallback)
    ];

    let lastError: Error | null = null;

    // OPCIÓN 1: Si hay un Inference Endpoint dedicado configurado, usarlo directamente
    if (this.dedicatedEndpointUrl) {
      try {
        const response = await axios.post(
          this.dedicatedEndpointUrl,
          {
            inputs: prompt,
            parameters: {
              max_new_tokens: 10,
              temperature: 0.1,
              return_full_text: false,
            },
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          }
        );

        let responseText: string = '';
        if (Array.isArray(response.data)) {
          const firstItem = response.data[0];
          responseText = firstItem?.generated_text || firstItem?.text || '';
        } else if (response.data && typeof response.data === 'object') {
          responseText = response.data.generated_text || response.data.text || '';
        } else if (typeof response.data === 'string') {
          responseText = response.data;
        }

        if (!responseText || responseText.trim() === '') {
          throw new Error('Respuesta vacía del Inference Endpoint');
        }

        const answer = responseText.trim().toUpperCase();
        let result: 'YES' | 'NO' | 'INVALID' = 'INVALID';
        if (answer.includes('YES')) result = 'YES';
        else if (answer.includes('NO')) result = 'NO';

        return {
          answer: result,
          confidence: 85, // Inference Endpoints tienen mejor calidad
          reasoning: answer,
        };
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(`Hugging Face Inference Endpoint failed: ${errorMessage}`);
      }
    }

    // OPCIÓN 2: Intentar con router endpoint y modelos disponibles
    for (const modelName of modelsToTry) {
      try {
        // Intentar primero con el nuevo router endpoint (formato: /models/{model})
        let response;
        try {
          // Formato 1: router.huggingface.co/hf-inference/models/{model}
          response = await axios.post(
            `${this.routerUrl}/${modelName}`,
            {
              inputs: prompt,
              parameters: {
                max_new_tokens: 10,
                temperature: 0.1,
                return_full_text: false,
              },
            },
            {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 30000,
            }
          );
        } catch (routerError: any) {
          // Si el formato /models/{model} falla, intentar formato alternativo
          const routerErrorMsg = routerError.response?.data?.error || routerError.message || '';
          if (routerError.response?.status === 404 || routerErrorMsg.includes('not found')) {
            try {
              // Formato 2: router.huggingface.co/hf-inference con model en el body
              response = await axios.post(
                'https://router.huggingface.co/hf-inference',
                {
                  model: modelName,
                  inputs: prompt,
                  parameters: {
                    max_new_tokens: 10,
                    temperature: 0.1,
                    return_full_text: false,
                  },
                },
                {
                  headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                  },
                  timeout: 30000,
                }
              );
            } catch (routerError2: any) {
              // Si ambos formatos del router fallan, intentar legacy como último recurso
              console.warn(`[HuggingFaceService] Router endpoint no disponible para ${modelName}, intentando legacy como último recurso...`);
              try {
                response = await axios.post(
                  `${this.legacyUrl}/${modelName}`,
                  {
                    inputs: prompt,
                    parameters: {
                      max_new_tokens: 10,
                      temperature: 0.1,
                      return_full_text: false,
                    },
                  },
                  {
                    headers: {
                      'Authorization': `Bearer ${this.apiKey}`,
                      'Content-Type': 'application/json',
                    },
                    timeout: 30000,
                  }
                );
              } catch (legacyError: any) {
                // Si el legacy también falla, continuar con siguiente modelo
                const legacyErrorMsg = legacyError.response?.data?.error || legacyError.message || '';
                if (legacyErrorMsg.includes('no longer supported') || legacyErrorMsg.includes('deprecated')) {
                  console.warn(`[HuggingFaceService] Endpoint legacy deprecado para ${modelName}`);
                  lastError = legacyError;
                  continue;
                }
                throw legacyError;
              }
            }
          } else {
            throw routerError;
          }
        }

        // Hugging Face puede retornar un array o un objeto
        // Manejar diferentes formatos de respuesta
        let responseText: string = '';
        
        if (Array.isArray(response.data)) {
          // Respuesta en formato array
          const firstItem = response.data[0];
          responseText = firstItem?.generated_text || firstItem?.text || '';
        } else if (response.data && typeof response.data === 'object') {
          // Respuesta en formato objeto
          responseText = response.data.generated_text || response.data.text || '';
        } else if (typeof response.data === 'string') {
          // Respuesta directa como string
          responseText = response.data;
        }
        
        if (!responseText || responseText.trim() === '') {
          console.warn(`[HuggingFaceService] Respuesta vacía de ${modelName}, intentando siguiente modelo...`);
          continue;
        }

        const answer = responseText.trim().toUpperCase();
        
        let result: 'YES' | 'NO' | 'INVALID' = 'INVALID';
        if (answer.includes('YES')) result = 'YES';
        else if (answer.includes('NO')) result = 'NO';

        return {
          answer: result,
          confidence: 78, // Hugging Face/Mistral confidence
          reasoning: answer,
        };
      } catch (error: any) {
        lastError = error;
        const errorMessage = error.response?.data?.error || error.message;
        
        // Si el modelo está cargando, esperar un poco y reintentar
        if (error.response?.status === 503 && errorMessage?.includes('loading')) {
          console.warn(`[HuggingFaceService] Model ${modelName} is loading, waiting 5 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }
        
        // Si el endpoint está deprecado o el modelo no está disponible, continuar con siguiente modelo
        if (errorMessage?.includes('no longer supported') || 
            errorMessage?.includes('deprecated') ||
            errorMessage?.includes('not found') ||
            error.response?.status === 404) {
          console.warn(`[HuggingFaceService] Modelo ${modelName} no disponible (${errorMessage}), intentando siguiente modelo...`);
          continue;
        }
        
        // Si es error de autenticación, no intentar otros modelos
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error(`Hugging Face API authentication failed: ${errorMessage}`);
        }
        
        console.warn(`[HuggingFaceService] Model ${modelName} failed:`, errorMessage);
        continue;
      }
    }

    const errorMessage = (lastError as any)?.response?.data?.error || lastError?.message || 'Unknown error';
    
    // Informar que todos los modelos fallaron y sugerir alternativas
    if (errorMessage.includes('no longer supported') || errorMessage.includes('deprecated')) {
      throw new Error(`Hugging Face Inference API está deprecada para estos modelos. Para producción, considera usar Inference Endpoints dedicados: https://huggingface.co/docs/inference-endpoints. Error: ${errorMessage}`);
    }
    
    throw new Error(`Todos los modelos de Hugging Face fallaron. El endpoint puede estar deprecado o los modelos no están disponibles. Error: ${errorMessage}. Considera usar Inference Endpoints dedicados para producción.`);
  }
}
