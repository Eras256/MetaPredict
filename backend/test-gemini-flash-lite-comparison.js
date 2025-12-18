/**
 * Script de Prueba: Gemini 2.5 Flash vs Flash-Lite
 * 
 * Compara rendimiento, calidad y límites entre:
 * - gemini-2.5-flash (actual)
 * - gemini-2.5-flash-lite (nuevo)
 * 
 * Ejecutar: node test-gemini-flash-lite-comparison.js
 */

// Intentar cargar .env desde múltiples ubicaciones
const path = require('path');
const fs = require('fs');

// Rutas posibles del .env
const envPaths = [
  path.resolve(__dirname, '../../.env'),           // Raíz del proyecto
  path.resolve(__dirname, '../.env'),              // Backend
  path.resolve(__dirname, '.env'),                 // Backend actual
];

// Cargar el primer .env que exista
let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    envLoaded = true;
    console.log(`📁 Cargando .env desde: ${envPath}`);
    break;
  }
}

// Si no se encontró .env, intentar cargar desde variables de entorno del sistema
if (!envLoaded) {
  require('dotenv').config({ path: path.resolve(__dirname, '../../env.example') });
  console.log('⚠️  No se encontró .env, usando env.example como referencia');
}

const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('your_') || GEMINI_API_KEY.trim() === '') {
  console.error('\n❌ GEMINI_API_KEY no está configurada correctamente');
  console.error('\n📋 Para ejecutar esta prueba:');
  console.error('   1. Crea un archivo .env en la raíz del proyecto (C:\\Daaps\\MetaPredict\\.env)');
  console.error('   2. Agrega tu API key:');
  console.error('      GEMINI_API_KEY=tu_api_key_aqui');
  console.error('   3. Obtén tu API key en: https://aistudio.google.com/app/apikey');
  console.error('\n💡 Alternativamente, puedes ejecutar:');
  console.error('   GEMINI_API_KEY=tu_api_key node test-gemini-flash-lite-comparison.js\n');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Prompts de prueba (casos reales de mercado)
const testCases = [
  {
    name: 'Mercado Binario Simple',
    question: 'Will Bitcoin reach $100,000 by December 31, 2025?',
    context: null,
  },
  {
    name: 'Mercado con Contexto',
    question: 'Will the US Federal Reserve cut interest rates by at least 0.5% in Q1 2026?',
    context: 'Current rate: 5.25%. Market expects cuts. Inflation data pending.',
  },
  {
    name: 'Mercado Ambiguo',
    question: 'Will the weather be good tomorrow?',
    context: null,
  },
  {
    name: 'Mercado Complejo',
    question: 'Will the total market capitalization of all cryptocurrencies exceed $5 trillion by the end of 2026, considering both bull and bear market scenarios?',
    context: 'Current market cap: ~$2.5T. Historical volatility high.',
  },
];

// Modelos a comparar
const models = [
  { name: 'gemini-2.5-flash', label: 'Flash (Actual)' },
  { name: 'gemini-2.5-flash-lite', label: 'Flash-Lite (Nuevo)' },
];

/**
 * Prueba un modelo con un caso de prueba
 */
async function testModel(modelName, testCase) {
  const startTime = Date.now();
  let success = false;
  let response = null;
  let error = null;
  let tokensUsed = null;

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 256,
      },
    });

    const prompt = `Analyze this prediction market question and provide a structured JSON response:
Question: ${testCase.question}
${testCase.context ? `Context: ${testCase.context}` : ''}

Respond with ONLY a valid JSON object in this exact format:
{
  "answer": "YES" | "NO" | "INVALID",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}

Be precise and objective. Answer INVALID if the question is ambiguous, unverifiable, or cannot be objectively resolved.`;

    const result = await model.generateContent(prompt);
    const elapsed = Date.now() - startTime;

    // Extraer texto - múltiples estrategias
    let responseText;
    try {
      // Estrategia 1: Usar text() directamente
      if (result.response && typeof result.response.text === 'function') {
        const textResult = result.response.text();
        responseText = typeof textResult === 'string' ? textResult : await textResult;
      } 
      // Estrategia 2: Acceder a candidates directamente
      else if (result.response && result.response.candidates) {
        const candidates = result.response.candidates;
        if (candidates && candidates.length > 0 && candidates[0].content) {
          const parts = candidates[0].content.parts;
          if (parts && parts.length > 0) {
            responseText = parts.map(p => p.text || '').join('');
          } else {
            throw new Error('No text parts found in candidates');
          }
        } else {
          throw new Error('No candidates found');
        }
      }
      // Estrategia 3: Intentar acceder directamente
      else if (result.response && result.response.text) {
        responseText = result.response.text;
      } else {
        throw new Error('Unable to extract text from response');
      }
      
      // Verificar que tenemos texto válido
      if (!responseText || typeof responseText !== 'string' || responseText.trim().length === 0) {
        throw new Error('Response text is empty or invalid');
      }
    } catch (e) {
      console.error(`[DEBUG] Error extracting text: ${e.message}`);
      console.error(`[DEBUG] Response structure:`, JSON.stringify(result.response, null, 2).substring(0, 500));
      throw new Error(`Unable to extract text: ${e.message}`);
    }

    // Intentar parsear JSON
    let cleanedText = responseText.trim();
    // Remover markdown code blocks más agresivamente
    cleanedText = cleanedText.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    // Remover cualquier markdown code block completo
    cleanedText = cleanedText.replace(/```[\s\S]*?```/g, '');
    // Limpiar espacios extra
    cleanedText = cleanedText.trim();
    
    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (e) {
      // Buscar el primer objeto JSON con regex mejorado
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          // Intentar buscar entre llaves balanceadas
          let braceCount = 0;
          let startIdx = -1;
          for (let i = 0; i < cleanedText.length; i++) {
            if (cleanedText[i] === '{') {
              if (startIdx === -1) startIdx = i;
              braceCount++;
            } else if (cleanedText[i] === '}') {
              braceCount--;
              if (braceCount === 0 && startIdx !== -1) {
                try {
                  const jsonStr = cleanedText.substring(startIdx, i + 1);
                  parsed = JSON.parse(jsonStr);
                  break;
                } catch (e3) {
                  startIdx = -1;
                }
              }
            }
          }
          if (!parsed) {
            console.log(`[DEBUG] Response completo: ${responseText}`);
            console.log(`[DEBUG] Cleaned text: ${cleanedText}`);
            throw new Error(`No valid JSON found. Response preview: ${responseText.substring(0, 300)}...`);
          }
        }
      } else {
        console.log(`[DEBUG] No JSON match found. Response: ${responseText}`);
        throw new Error(`No valid JSON found. Response preview: ${responseText.substring(0, 300)}...`);
      }
    }

    // Obtener información de tokens (si está disponible)
    if (result.response.usageMetadata) {
      tokensUsed = {
        prompt: result.response.usageMetadata.promptTokenCount || 0,
        candidates: result.response.usageMetadata.candidatesTokenCount || 0,
        total: result.response.usageMetadata.totalTokenCount || 0,
      };
    }

    success = true;
    response = {
      parsed,
      raw: responseText.substring(0, 200), // Primeros 200 chars
      elapsed,
      tokensUsed,
    };
  } catch (err) {
    const elapsed = Date.now() - startTime;
    error = {
      message: err.message,
      elapsed,
    };
  }

  return {
    success,
    response,
    error,
  };
}

/**
 * Ejecuta todas las pruebas
 */
async function runComparison() {
  console.log('\n🧪 PRUEBA COMPARATIVA: Gemini 2.5 Flash vs Flash-Lite\n');
  console.log('='.repeat(80));
  console.log(`📅 Fecha: ${new Date().toISOString()}`);
  console.log(`🔑 API Key: ${GEMINI_API_KEY.substring(0, 10)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}`);
  console.log('='.repeat(80));
  console.log('');

  const results = {
    flash: [],
    flashLite: [],
  };

  // Probar cada modelo con cada caso
  for (const model of models) {
    console.log(`\n📊 Probando: ${model.label} (${model.name})\n`);
    console.log('-'.repeat(80));

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n[${i + 1}/${testCases.length}] ${testCase.name}`);
      console.log(`   Pregunta: ${testCase.question}`);

      const result = await testModel(model.name, testCase);

      if (result.success) {
        const { parsed, elapsed, tokensUsed } = result.response;
        console.log(`   ✅ Éxito en ${elapsed}ms`);
        console.log(`   📝 Respuesta: ${parsed.answer} (confianza: ${parsed.confidence}%)`);
        console.log(`   💭 Razonamiento: ${parsed.reasoning.substring(0, 100)}...`);
        if (tokensUsed) {
          console.log(`   🪙 Tokens: ${tokensUsed.total} (entrada: ${tokensUsed.prompt}, salida: ${tokensUsed.candidates})`);
        }

        if (model.name === 'gemini-2.5-flash') {
          results.flash.push({
            testCase: testCase.name,
            elapsed,
            answer: parsed.answer,
            confidence: parsed.confidence,
            tokensUsed,
          });
        } else {
          results.flashLite.push({
            testCase: testCase.name,
            elapsed,
            answer: parsed.answer,
            confidence: parsed.confidence,
            tokensUsed,
          });
        }
      } else {
        console.log(`   ❌ Error: ${result.error.message} (${result.error.elapsed}ms)`);
        
        if (model.name === 'gemini-2.5-flash') {
          results.flash.push({
            testCase: testCase.name,
            error: result.error.message,
            elapsed: result.error.elapsed,
          });
        } else {
          results.flashLite.push({
            testCase: testCase.name,
            error: result.error.message,
            elapsed: result.error.elapsed,
          });
        }
      }

      // Pequeña pausa entre requests para evitar rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Generar reporte comparativo
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('📊 REPORTE COMPARATIVO');
  console.log('='.repeat(80));
  console.log('');

  // Comparar tiempos
  const flashAvgTime = results.flash
    .filter(r => r.elapsed)
    .reduce((sum, r) => sum + r.elapsed, 0) / results.flash.filter(r => r.elapsed).length;
  
  const flashLiteAvgTime = results.flashLite
    .filter(r => r.elapsed)
    .reduce((sum, r) => sum + r.elapsed, 0) / results.flashLite.filter(r => r.elapsed).length;

  console.log('⏱️  TIEMPO DE RESPUESTA:');
  console.log(`   Flash:      ${flashAvgTime.toFixed(0)}ms promedio`);
  console.log(`   Flash-Lite: ${flashLiteAvgTime.toFixed(0)}ms promedio`);
  console.log(`   Diferencia: ${((flashLiteAvgTime - flashAvgTime) / flashAvgTime * 100).toFixed(1)}%`);
  console.log('');

  // Comparar tokens (si están disponibles)
  const flashTokens = results.flash
    .filter(r => r.tokensUsed)
    .map(r => r.tokensUsed.total);
  const flashLiteTokens = results.flashLite
    .filter(r => r.tokensUsed)
    .map(r => r.tokensUsed.total);

  if (flashTokens.length > 0 && flashLiteTokens.length > 0) {
    const flashAvgTokens = flashTokens.reduce((a, b) => a + b, 0) / flashTokens.length;
    const flashLiteAvgTokens = flashLiteTokens.reduce((a, b) => a + b, 0) / flashLiteTokens.length;

    console.log('🪙 TOKENS UTILIZADOS:');
    console.log(`   Flash:      ${flashAvgTokens.toFixed(0)} tokens promedio`);
    console.log(`   Flash-Lite: ${flashLiteAvgTokens.toFixed(0)} tokens promedio`);
    console.log('');

    // Calcular costo estimado (basado en precios de diciembre 2025)
    const flashCostPer1M = 0.35; // $0.35 por 1M tokens entrada (estimado)
    const flashLiteCostPer1M = 0.10; // $0.10 por 1M tokens entrada
    
    const flashEstCost = (flashAvgTokens / 1_000_000) * flashCostPer1M;
    const flashLiteEstCost = (flashLiteAvgTokens / 1_000_000) * flashLiteCostPer1M;
    
    console.log('💰 COSTO ESTIMADO (por request):');
    console.log(`   Flash:      $${flashEstCost.toFixed(6)}`);
    console.log(`   Flash-Lite: $${flashLiteEstCost.toFixed(6)}`);
    console.log(`   Ahorro:     ${((1 - flashLiteEstCost / flashEstCost) * 100).toFixed(1)}% más barato`);
    console.log('');
  }

  // Comparar respuestas (consistencia)
  console.log('🎯 CONSISTENCIA DE RESPUESTAS:');
  let sameAnswers = 0;
  let totalComparisons = 0;
  
  for (let i = 0; i < testCases.length; i++) {
    const flashResult = results.flash[i];
    const flashLiteResult = results.flashLite[i];
    
    if (flashResult && flashLiteResult && flashResult.answer && flashLiteResult.answer) {
      totalComparisons++;
      if (flashResult.answer === flashLiteResult.answer) {
        sameAnswers++;
        console.log(`   ✅ ${testCases[i].name}: Ambos respondieron "${flashResult.answer}"`);
      } else {
        console.log(`   ⚠️  ${testCases[i].name}: Flash="${flashResult.answer}" vs Flash-Lite="${flashLiteResult.answer}"`);
      }
    } else if (flashResult && flashResult.error) {
      console.log(`   ❌ ${testCases[i].name}: Flash falló - ${flashResult.error}`);
    } else if (flashLiteResult && flashLiteResult.error) {
      console.log(`   ❌ ${testCases[i].name}: Flash-Lite falló - ${flashLiteResult.error}`);
    }
  }
  
  let consistency = 0;
  if (totalComparisons > 0) {
    consistency = parseFloat((sameAnswers / totalComparisons * 100).toFixed(1));
    console.log(`   📊 Consistencia: ${consistency}% (${sameAnswers}/${totalComparisons} casos coinciden)`);
  } else {
    console.log(`   ⚠️  No se pudieron comparar respuestas (Flash tuvo errores en todos los casos)`);
  }
  console.log('');

  // Comparar confianza
  const flashAvgConfidence = results.flash
    .filter(r => r.confidence !== undefined)
    .reduce((sum, r) => sum + r.confidence, 0) / results.flash.filter(r => r.confidence !== undefined).length;
  
  const flashLiteAvgConfidence = results.flashLite
    .filter(r => r.confidence !== undefined)
    .reduce((sum, r) => sum + r.confidence, 0) / results.flashLite.filter(r => r.confidence !== undefined).length;

  console.log('📈 CONFIANZA PROMEDIO:');
  console.log(`   Flash:      ${flashAvgConfidence.toFixed(1)}%`);
  console.log(`   Flash-Lite: ${flashLiteAvgConfidence.toFixed(1)}%`);
  console.log(`   Diferencia: ${(flashLiteAvgConfidence - flashAvgConfidence).toFixed(1)}%`);
  console.log('');

  // Errores
  const flashErrors = results.flash.filter(r => r.error).length;
  const flashLiteErrors = results.flashLite.filter(r => r.error).length;

  console.log('❌ ERRORES:');
  console.log(`   Flash:      ${flashErrors} errores`);
  console.log(`   Flash-Lite: ${flashLiteErrors} errores`);
  console.log('');

  // Recomendación
  console.log('='.repeat(80));
  console.log('💡 RECOMENDACIÓN:');
  console.log('='.repeat(80));
  
  if (flashLiteAvgTime < flashAvgTime && flashLiteErrors === 0 && consistency >= 75) {
    console.log('✅ Flash-Lite es MÁS RÁPIDO y mantiene buena consistencia');
    console.log('   → Considera migrar a Flash-Lite para ahorrar costos');
  } else if (flashLiteErrors > 0) {
    console.log('⚠️  Flash-Lite tiene errores');
    console.log('   → Mantén Flash hasta que se resuelvan los problemas');
  } else if (consistency < 75) {
    console.log('⚠️  Flash-Lite tiene menor consistencia con Flash');
    console.log('   → Evalúa si la diferencia en respuestas es aceptable');
  } else {
    console.log('✅ Ambos modelos funcionan bien');
    console.log('   → Flash-Lite es más económico, Flash es más robusto');
    console.log('   → Decide según tus prioridades: costo vs rendimiento');
  }
  
  console.log('');
  console.log('📋 LÍMITES CONOCIDOS (Diciembre 2025):');
  console.log('   Flash:');
  console.log('     - Rate limit: ~15 RPM (requests per minute)');
  console.log('     - Contexto: 1M tokens');
  console.log('     - Costo: ~$0.35/1M tokens entrada');
  console.log('');
  console.log('   Flash-Lite:');
  console.log('     - Rate limit: ~15 RPM (similar)');
  console.log('     - Contexto: 1M tokens');
  console.log('     - Costo: ~$0.10/1M tokens entrada (71% más barato)');
  console.log('     - Rendimiento: Ligeramente inferior en razonamiento complejo');
  console.log('');

  console.log('='.repeat(80));
  console.log('✅ Prueba completada');
  console.log('='.repeat(80));
  console.log('');
}

// Ejecutar
runComparison().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

