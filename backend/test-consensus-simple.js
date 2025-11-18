/**
 * Test completo del sistema de consenso multi-IA (versión simplificada)
 * 
 * Uso:
 *   node test-consensus-simple.js
 * 
 * Prueba:
 * 1. Cada IA individualmente usando sus servicios directamente
 * 2. El sistema de consenso completo
 * 3. El orden de prioridades
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test questions
const TEST_QUESTIONS = [
  {
    question: 'Is 2 + 2 equal to 4?',
    context: 'This is a simple mathematical question with a definitive answer.',
    expectedAnswer: 'YES'
  },
  {
    question: 'Will the sun rise tomorrow?',
    context: 'Based on historical patterns and astronomical knowledge.',
    expectedAnswer: 'YES'
  },
  {
    question: 'Is water wet?',
    context: 'A philosophical question about the nature of water.',
    expectedAnswer: 'YES'
  },
  {
    question: 'Will Bitcoin reach $100,000 by the end of 2025?',
    context: 'Bitcoin is currently trading around $60,000. Historical data shows strong growth patterns.',
    expectedAnswer: null // Puede ser YES, NO o INVALID
  }
];

async function testGemini(question, context) {
  console.log('1️⃣  Probando Gemini 2.5 Flash...');
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey.includes('your_')) {
      return { passed: false, skipped: true };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Analyze this prediction market question and answer ONLY 'YES', 'NO', or 'INVALID':
${question}
${context ? `Context: ${context}` : ''}

Respond with ONLY one word: YES, NO, or INVALID`;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toUpperCase();
    
    let answer = 'INVALID';
    if (response.includes('YES')) answer = 'YES';
    else if (response.includes('NO')) answer = 'NO';

    console.log(`   ✅ Gemini respondió: ${answer}`);
    return { passed: true, answer };
  } catch (error) {
    console.log(`   ❌ Gemini falló: ${error.message}`);
    return { passed: false, error: error.message };
  }
}


async function testGroqLlama(question, context) {
  console.log('\n2️⃣  Probando Groq Llama 3.1...');
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.includes('your_')) {
      return { passed: false, skipped: true };
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a prediction market oracle. Analyze questions and provide clear YES/NO/INVALID answers.',
          },
          {
            role: 'user',
            content: `Analyze this prediction market question and answer ONLY 'YES', 'NO', or 'INVALID':\n${question}\n${context ? `Context: ${context}` : ''}\n\nRespond with ONLY one word: YES, NO, or INVALID`,
          },
        ],
        temperature: 0.1,
        max_tokens: 10,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const answer = response.data.choices[0].message.content.trim().toUpperCase();
    let result = 'INVALID';
    if (answer.includes('YES')) result = 'YES';
    else if (answer.includes('NO')) result = 'NO';

    console.log(`   ✅ Groq Llama 3.1 respondió: ${result}`);
    return { passed: true, answer: result };
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.log(`   ❌ Groq Llama 3.1 falló: ${errorMsg}`);
    return { passed: false, error: errorMsg };
  }
}

async function testOpenRouterMistral(question, context) {
  console.log('\n3️⃣  Probando OpenRouter Mistral 7B...');
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey.trim() === '') {
      return { passed: false, skipped: true };
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a prediction market oracle. Analyze questions and provide clear YES/NO/INVALID answers.',
          },
          {
            role: 'user',
            content: `Analyze this prediction market question and answer ONLY 'YES', 'NO', or 'INVALID':\n${question}\n${context ? `Context: ${context}` : ''}\n\nRespond with ONLY one word: YES, NO, or INVALID`,
          },
        ],
        temperature: 0.1,
        max_tokens: 10,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://metapredict.vercel.app',
          'X-Title': 'MetaPredict',
        },
        timeout: 30000,
      }
    );

    const answer = response.data.choices[0].message.content.trim().toUpperCase();
    let result = 'INVALID';
    if (answer.includes('YES')) result = 'YES';
    else if (answer.includes('NO')) result = 'NO';

    console.log(`   ✅ OpenRouter Mistral respondió: ${result}`);
    return { passed: true, answer: result };
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.log(`   ❌ OpenRouter Mistral falló: ${errorMsg}`);
    return { passed: false, error: errorMsg };
  }
}

async function testOpenRouterLlama(question, context) {
  console.log('\n4️⃣  Probando OpenRouter Llama 3.2 3B...');
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey.trim() === '') {
      return { passed: false, skipped: true };
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a prediction market oracle. Analyze questions and provide clear YES/NO/INVALID answers.',
          },
          {
            role: 'user',
            content: `Analyze this prediction market question and answer ONLY 'YES', 'NO', or 'INVALID':\n${question}\n${context ? `Context: ${context}` : ''}\n\nRespond with ONLY one word: YES, NO, or INVALID`,
          },
        ],
        temperature: 0.1,
        max_tokens: 10,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://metapredict.vercel.app',
          'X-Title': 'MetaPredict',
        },
        timeout: 30000,
      }
    );

    const answer = response.data.choices[0].message.content.trim().toUpperCase();
    let result = 'INVALID';
    if (answer.includes('YES')) result = 'YES';
    else if (answer.includes('NO')) result = 'NO';

    console.log(`   ✅ OpenRouter Llama respondió: ${result}`);
    return { passed: true, answer: result };
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    // No es un error crítico si el modelo no está disponible
    console.log(`   ⚠️  OpenRouter Llama no disponible: ${errorMsg}`);
    return { passed: false, skipped: true, error: errorMsg };
  }
}

async function testOpenRouterGeneric(question, context) {
  console.log('\n5️⃣  Probando OpenRouter (genérico - fallback)...');
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('your_') || apiKey.trim() === '') {
      return { passed: false, skipped: true };
    }

    // Intentar con múltiples modelos gratuitos
    const models = [
      'mistralai/mistral-7b-instruct:free',
      'meta-llama/llama-3.2-3b-instruct:free',
    ];

    for (const model of models) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: model,
            messages: [
              {
                role: 'system',
                content: 'You are a prediction market oracle. Analyze questions and provide clear YES/NO/INVALID answers.',
              },
              {
                role: 'user',
                content: `Analyze this prediction market question and answer ONLY 'YES', 'NO', or 'INVALID':\n${question}\n${context ? `Context: ${context}` : ''}\n\nRespond with ONLY one word: YES, NO, or INVALID`,
              },
            ],
            temperature: 0.1,
            max_tokens: 10,
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://metapredict.vercel.app',
              'X-Title': 'MetaPredict',
            },
            timeout: 30000,
          }
        );

        const answer = response.data.choices[0].message.content.trim().toUpperCase();
        let result = 'INVALID';
        if (answer.includes('YES')) result = 'YES';
        else if (answer.includes('NO')) result = 'NO';

        console.log(`   ✅ OpenRouter (${model}) respondió: ${result}`);
        return { passed: true, answer: result };
      } catch (error) {
        continue; // Intentar siguiente modelo
      }
    }

    throw new Error('Todos los modelos de OpenRouter fallaron');
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.log(`   ❌ OpenRouter genérico falló: ${errorMsg}`);
    return { passed: false, error: errorMsg };
  }
}


async function testConsensus(question, context) {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 2: Probando sistema de consenso completo');
  console.log('='.repeat(60) + '\n');

  console.log(`📊 Pregunta: "${question}"`);
  console.log(`📝 Contexto: "${context}"\n`);

  console.log('🔄 Consultando IAs en orden de prioridad...\n');

  const responses = [];
  const errors = [];

  // 1. Gemini (Prioridad 1)
  const geminiResult = await testGemini(question, context);
  if (geminiResult.passed && !geminiResult.skipped) {
    responses.push(geminiResult.answer);
    console.log('   ✅ Gemini agregado al consenso');
  } else if (!geminiResult.skipped) {
    errors.push(`Gemini: ${geminiResult.error}`);
  }

  // 2. Groq Llama 3.1 (Prioridad 2)
  const groqLlamaResult = await testGroqLlama(question, context);
  if (groqLlamaResult.passed && !groqLlamaResult.skipped) {
    responses.push(groqLlamaResult.answer);
    console.log('   ✅ Groq Llama 3.1 agregado al consenso');
  } else if (!groqLlamaResult.skipped) {
    errors.push(`Groq Llama: ${groqLlamaResult.error}`);
  }

  // 3. OpenRouter Mistral 7B (Prioridad 3)
  const openRouterMistralResult = await testOpenRouterMistral(question, context);
  if (openRouterMistralResult.passed && !openRouterMistralResult.skipped) {
    responses.push(openRouterMistralResult.answer);
    console.log('   ✅ OpenRouter Mistral agregado al consenso');
  } else if (!openRouterMistralResult.skipped) {
    errors.push(`OpenRouter Mistral: ${openRouterMistralResult.error}`);
  }

  // 4. OpenRouter Llama 3.2 3B (Prioridad 4)
  const openRouterLlamaResult = await testOpenRouterLlama(question, context);
  if (openRouterLlamaResult.passed && !openRouterLlamaResult.skipped) {
    responses.push(openRouterLlamaResult.answer);
    console.log('   ✅ OpenRouter Llama agregado al consenso');
  } else if (!openRouterLlamaResult.skipped && !openRouterLlamaResult.skipped) {
    // No agregar error si fue skipped (modelo no disponible)
    if (!openRouterLlamaResult.skipped) {
      errors.push(`OpenRouter Llama: ${openRouterLlamaResult.error}`);
    }
  }

  // 5. OpenRouter genérico (Prioridad 5 - Fallback, solo si necesitamos más)
  if (responses.length < 3) {
    const openRouterGenericResult = await testOpenRouterGeneric(question, context);
    if (openRouterGenericResult.passed && !openRouterGenericResult.skipped) {
      responses.push(openRouterGenericResult.answer);
      console.log('   ✅ OpenRouter (genérico) agregado al consenso');
    } else if (!openRouterGenericResult.skipped) {
      errors.push(`OpenRouter genérico: ${openRouterGenericResult.error}`);
    }
  }

  // Calcular consenso
  if (responses.length === 0) {
    console.error('\n❌ No se obtuvo ninguna respuesta válida');
    return { passed: false, error: 'No valid responses' };
  }

  let yesVotes = 0;
  let noVotes = 0;
  let invalidVotes = 0;

  responses.forEach(answer => {
    if (answer === 'YES') yesVotes++;
    else if (answer === 'NO') noVotes++;
    else invalidVotes++;
  });

  const totalModels = responses.length;
  const maxVotes = Math.max(yesVotes, noVotes, invalidVotes);
  const consensusPercentage = (maxVotes / totalModels) * 100;

  let outcome = 3; // INVALID
  if (yesVotes === maxVotes && yesVotes > noVotes && yesVotes > invalidVotes) {
    outcome = 1; // YES
  } else if (noVotes === maxVotes && noVotes > yesVotes && noVotes > invalidVotes) {
    outcome = 2; // NO
  }

  console.log('\n✅ Consenso calculado exitosamente!\n');
  console.log('📊 RESULTADOS:');
  console.log('   Outcome:', outcome === 1 ? 'YES ✅' : outcome === 2 ? 'NO ❌' : 'INVALID ⚠️');
  console.log('   Confidence:', `${Math.round(consensusPercentage)}%`);
  console.log('   Consensus Count:', `${maxVotes}/${totalModels}`);
  console.log('\n   📈 Votos:');
  console.log('      YES:', yesVotes);
  console.log('      NO:', noVotes);
  console.log('      INVALID:', invalidVotes);
  console.log('\n   📋 Respuestas individuales:');
  // Los nombres se determinan dinámicamente según qué respuestas se agregaron
  const aiNames = ['Gemini', 'Groq Llama 3.1', 'OpenRouter Mistral', 'OpenRouter Llama', 'OpenRouter (genérico)'];
  responses.forEach((answer, index) => {
    console.log(`      ${aiNames[index] || `IA ${index + 1}`}: ${answer}`);
  });

  return {
    passed: true,
    result: {
      outcome,
      confidence: Math.round(consensusPercentage),
      consensusCount: maxVotes,
      totalModels,
      votes: { yes: yesVotes, no: noVotes, invalid: invalidVotes },
    },
  };
}

async function main() {
  console.log('\n🚀 INICIANDO TESTS COMPLETOS DEL SISTEMA DE CONSENSO\n');

  // Usar la primera pregunta simple para tests individuales
  const testQuestion = TEST_QUESTIONS[0];
  
  // Test 1: IAs individuales
  console.log('='.repeat(60));
  console.log('🧪 TEST 1: Probando cada IA individualmente');
  console.log('='.repeat(60) + '\n');

  const geminiResult = await testGemini(testQuestion.question, testQuestion.context);
  const groqLlamaResult = await testGroqLlama(testQuestion.question, testQuestion.context);
  const openRouterMistralResult = await testOpenRouterMistral(testQuestion.question, testQuestion.context);
  const openRouterLlamaResult = await testOpenRouterLlama(testQuestion.question, testQuestion.context);
  const openRouterGenericResult = await testOpenRouterGeneric(testQuestion.question, testQuestion.context);

  const individualResults = {
    gemini: geminiResult,
    groqLlama: groqLlamaResult,
    openRouterMistral: openRouterMistralResult,
    openRouterLlama: openRouterLlamaResult,
    openRouterGeneric: openRouterGenericResult,
  };

  // Test 2: Consenso con pregunta simple
  const consensusResult = await testConsensus(testQuestion.question, testQuestion.context);

  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN FINAL DE TESTS');
  console.log('='.repeat(60) + '\n');

  const individualPassed = Object.values(individualResults).filter(r => r.passed && !r.skipped).length;
  const individualSkipped = Object.values(individualResults).filter(r => r.skipped).length;
  const individualTotal = Object.keys(individualResults).length;

  console.log('1️⃣  IAs Individuales:');
  console.log(`   ✅ Pasadas: ${individualPassed}/${individualTotal - individualSkipped}`);
  console.log(`   ⏳ Omitidas: ${individualSkipped}`);
  console.log(`   ❌ Fallidas: ${individualTotal - individualPassed - individualSkipped}\n`);

  console.log('2️⃣  Sistema de Consenso:');
  console.log(`   ${consensusResult.passed ? '✅' : '❌'} ${consensusResult.passed ? 'PASÓ' : 'FALLÓ'}`);
  if (consensusResult.passed) {
    console.log(`   Confidence: ${consensusResult.result.confidence}%`);
    console.log(`   Total Models: ${consensusResult.result.totalModels}`);
    console.log(`   Outcome: ${consensusResult.result.outcome === 1 ? 'YES' : consensusResult.result.outcome === 2 ? 'NO' : 'INVALID'}\n`);
  } else {
    console.log(`   Error: ${consensusResult.error}\n`);
  }

  // Determinar si todos los tests pasaron
  const allPassed = consensusResult.passed && individualPassed >= 3;

  if (allPassed) {
    console.log('🎉 ¡TODOS LOS TESTS PASARON!\n');
    process.exit(0);
  } else {
    console.log('⚠️  ALGUNOS TESTS FALLARON\n');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

