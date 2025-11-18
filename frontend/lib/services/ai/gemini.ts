/**
 * Cliente para llamar a las APIs de Gemini AI
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
 * Test de conectividad con Gemini
 */
export async function testGeminiConnection(): Promise<ApiResponse<{ response: string; modelUsed: string }>> {
  try {
    const response = await fetchWithTimeout('/api/ai/test');
    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al conectar con Gemini',
    };
  }
}

/**
 * Analiza un mercado de predicción
 */
export async function analyzeMarket(
  question: string,
  context?: string
): Promise<ApiResponse<{ answer: 'YES' | 'NO' | 'INVALID'; confidence: number; reasoning: string }>> {
  try {
    const response = await fetchWithTimeout('/api/ai/analyze-market', {
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
      
      // Verificar si details es un string antes de usar includes
      const detailsStr = typeof errorData.details === 'string' 
        ? errorData.details 
        : errorData.details?.originalError || errorData.details?.message || '';
      
      if (response.status === 500 && (detailsStr.includes('API key') || errorMessage.includes('API key'))) {
        errorMessage = 'Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.';
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from server');
    }
    
    return data;
  } catch (error: any) {
    console.error('[Gemini Client] Error en analyzeMarket:', error);
    
    let userMessage = error.message || 'Error al analizar mercado';
    if (userMessage.includes('timeout')) {
      userMessage = 'La solicitud tardó demasiado. Por favor, intenta de nuevo.';
    } else if (userMessage.includes('Network error')) {
      userMessage = 'Error de conexión. Verifica tu conexión a internet.';
    } else if (userMessage.includes('API key')) {
      userMessage = '⚠️ API Key de Gemini no configurada. Verifica tu archivo .env';
    }
    
    return {
      success: false,
      error: userMessage,
    };
  }
}

/**
 * Genera sugerencias para crear un mercado
 */
export async function suggestMarketCreation(
  topic: string
): Promise<ApiResponse<{ suggestions: Array<{ question: string; description: string; category: string }> }>> {
  try {
    // Generar sugerencias puede tardar más, usar timeout de 60 segundos
    const response = await fetchWithTimeout('/api/ai/suggest-market', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    }, 60000); // 60 segundos para generación de sugerencias

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: 'Unable to parse error response'
      }));
      
      // Mensajes de error más descriptivos
      let errorMessage = errorData.error || `Error ${response.status}`;
      
      // Verificar si details es un string antes de usar includes
      const detailsStr = typeof errorData.details === 'string' 
        ? errorData.details 
        : errorData.details?.originalError || errorData.details?.message || '';
      
      if (response.status === 500 && (detailsStr.includes('API key') || errorMessage.includes('API key'))) {
        errorMessage = 'Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.';
      } else if (response.status === 500 && (errorMessage.includes('JSON') || errorMessage.includes('parse'))) {
        errorMessage = 'Error parsing AI response. Please try again.';
      } else if (response.status === 500 && (errorMessage.includes('empty') || errorMessage.includes('Empty'))) {
        errorMessage = 'The AI did not generate a response. Please try again with a different topic.';
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Validar que la respuesta tenga el formato esperado
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from server');
    }
    
    return data;
  } catch (error: any) {
    console.error('[Gemini Client] Error en suggestMarketCreation:', error);
    
    // Mensajes de error más amigables para el usuario
    let userMessage = error.message || 'Error al generar sugerencias';
    if (userMessage.includes('timeout')) {
      userMessage = 'La solicitud tardó demasiado. Por favor, intenta de nuevo.';
    } else if (userMessage.includes('Network error')) {
      userMessage = 'Error de conexión. Verifica tu conexión a internet.';
    } else if (userMessage.includes('API key')) {
      userMessage = '⚠️ API Key de Gemini no configurada. Verifica tu archivo .env';
    }
    
    return {
      success: false,
      error: userMessage,
    };
  }
}

/**
 * Analiza portfolio y sugiere rebalanceo
 */
export async function analyzePortfolioRebalance(
  positions: Array<{ marketId: number; question: string; yesShares: number; noShares: number; totalValue: number }>,
  constraints?: { maxRisk?: number; preferredCategories?: string[] }
): Promise<ApiResponse<{
  riskScore: number;
  allocations: Array<{ marketId: number; recommendedAction: 'increase' | 'decrease' | 'hold'; reasoning: string }>;
  overallRecommendation: string;
  confidence: number;
}>> {
  try {
    // Análisis de portfolio puede tardar más, usar timeout de 60 segundos
    const response = await fetchWithTimeout('/api/ai/portfolio-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ positions, constraints }),
    }, 60000); // 60 segundos para análisis complejos

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: 'Unable to parse error response'
      }));
      
      let errorMessage = errorData.error || `Error ${response.status}`;
      
      // Verificar si details es un string antes de usar includes
      const detailsStr = typeof errorData.details === 'string' 
        ? errorData.details 
        : errorData.details?.originalError || errorData.details?.message || '';
      
      if (response.status === 500 && (detailsStr.includes('API key') || errorMessage.includes('API key'))) {
        errorMessage = 'Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.';
      } else if (response.status === 500 && (errorMessage.includes('JSON') || errorMessage.includes('parse'))) {
        errorMessage = 'Error parsing AI response. Please try again.';
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from server');
    }
    
    return data;
  } catch (error: any) {
    console.error('[Gemini Client] Error en analyzePortfolioRebalance:', error);
    
    let userMessage = error.message || 'Error al analizar portfolio';
    if (userMessage.includes('timeout')) {
      userMessage = 'La solicitud tardó demasiado. Por favor, intenta de nuevo.';
    } else if (userMessage.includes('Network error')) {
      userMessage = 'Error de conexión. Verifica tu conexión a internet.';
    } else if (userMessage.includes('API key')) {
      userMessage = '⚠️ API Key de Gemini no configurada. Verifica tu archivo .env';
    }
    
    return {
      success: false,
      error: userMessage,
    };
  }
}

/**
 * Analiza reputación de usuario
 */
export async function analyzeReputation(
  userData: { accuracy: number; totalVotes: number; correctVotes: number; slashes: number; stakes: number }
): Promise<ApiResponse<{
  reputationScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  confidence: number;
}>> {
  try {
    const response = await fetchWithTimeout('/api/ai/reputation-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userData }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al analizar reputación',
    };
  }
}

/**
 * Analiza riesgo de insurance para un mercado
 */
export async function analyzeInsuranceRisk(
  marketData: { question: string; totalVolume: number; yesPool: number; noPool: number; resolutionTime: number }
): Promise<ApiResponse<{
  riskScore: number;
  recommendedCoverage: number;
  reasoning: string;
  confidence: number;
}>> {
  try {
    const response = await fetchWithTimeout('/api/ai/insurance-risk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ marketData }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al analizar riesgo',
    };
  }
}

/**
 * Analiza propuesta DAO
 */
export async function analyzeDAOProposal(
  proposalData: { title: string; description: string; type: string; proposerReputation?: number }
): Promise<ApiResponse<{
  qualityScore: number;
  recommendation: 'approve' | 'reject' | 'amend';
  reasoning: string;
  suggestedAmendments?: string[];
  confidence: number;
}>> {
  try {
    const response = await fetchWithTimeout('/api/ai/dao-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ proposalData }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al analizar propuesta',
    };
  }
}

/**
 * Llamada genérica a Gemini
 */
export async function callGemini(
  prompt: string,
  config?: { temperature?: number; topP?: number; topK?: number; maxOutputTokens?: number },
  returnJSON = false
): Promise<ApiResponse<any>> {
  try {
    const response = await fetchWithTimeout('/api/ai/call', {
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
      error: error.message || 'Error al llamar a Gemini',
    };
  }
}

