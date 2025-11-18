/**
 * Cliente para llamar a las APIs de Groq AI
 * Todas las llamadas se hacen a las API routes de Next.js (server-side)
 */

// Usar rutas relativas - Next.js maneja esto automáticamente
const API_BASE_URL = '';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  modelUsed?: string;
}

/**
 * Helper genérico para llamadas fetch con timeout y mejor manejo de errores
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout after 30 seconds');
    }
    if (error.message?.includes('fetch')) {
      throw new Error('Network error: Unable to reach the server. Please check your connection.');
    }
    throw error;
  }
}

/**
 * Test de conectividad con Groq
 */
export async function testGroqConnection(): Promise<ApiResponse<{ response: string; modelUsed: string }>> {
  try {
    const response = await fetchWithTimeout('/api/ai/groq-test');
    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al conectar con Groq',
    };
  }
}

/**
 * Analiza un mercado de predicción usando Groq
 */
export async function analyzeMarketWithGroq(
  question: string,
  context?: string
): Promise<ApiResponse<{ answer: 'YES' | 'NO' | 'INVALID'; confidence: number; reasoning: string }>> {
  try {
    const response = await fetchWithTimeout('/api/ai/groq-analyze-market', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, context }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: 'Unable to parse error response'
      }));
      
      let errorMessage = errorData.error || `Error ${response.status}`;
      
      const detailsStr = typeof errorData.details === 'string' 
        ? errorData.details 
        : errorData.details?.originalError || errorData.details?.message || '';
      
      if (response.status === 500 && (detailsStr.includes('API key') || errorMessage.includes('API key'))) {
        errorMessage = 'Groq API key not configured. Please set GROQ_API_KEY in your .env file.';
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from server');
    }
    
    return data;
  } catch (error: any) {
    console.error('[Groq Client] Error en analyzeMarketWithGroq:', error);
    
    let userMessage = error.message || 'Error al analizar mercado';
    if (userMessage.includes('timeout')) {
      userMessage = 'La solicitud tardó demasiado. Por favor, intenta de nuevo.';
    } else if (userMessage.includes('Network error')) {
      userMessage = 'Error de conexión. Verifica tu conexión a internet.';
    } else if (userMessage.includes('API key')) {
      userMessage = '⚠️ API Key de Groq no configurada. Verifica tu archivo .env';
    }
    
    return {
      success: false,
      error: userMessage,
    };
  }
}

/**
 * Llamada genérica a Groq
 */
export async function callGroq(
  prompt: string,
  config?: { temperature?: number; topP?: number; maxTokens?: number },
  returnJSON = false
): Promise<ApiResponse<any>> {
  try {
    const response = await fetchWithTimeout('/api/ai/groq-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, config, returnJSON }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al llamar a Groq',
    };
  }
}

