/**
 * Script para probar múltiples modelos de Groq y encontrar los disponibles
 * Sin DeepSeek ni Qwen
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const axios = require('axios');

const modelsToTest = [
  // Llama 3.1 Series
  'llama-3.1-8b-instant',
  'llama-3.1-70b-versatile',
  'llama-3.1-405b',
  
  // Llama 3.2 Series
  'llama-3.2-1b-instruct',
  'llama-3.2-3b-instruct',
  'llama-3.2-11b-instruct',
  'llama-3.2-11b-vision-instruct',
  
  // Llama 3.3 Series (si existen)
  'llama-3.3-70b-instruct',
  'llama-3.3-8b-instruct',
  
  // Mixtral Series
  'mixtral-8x7b-32768',
  'mixtral-8x22b-instruct',
  'mixtral-large',
  
  // Gemma Series
  'gemma-7b-it',
  'gemma2-9b-it',
  'gemma2-27b-it',
  
  // Otros modelos posibles
  'llama-3-groq-tool-use-8b',
  'llama-3-groq-tool-use-70b',
];

async function testModel(apiKey, modelName) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: modelName,
        messages: [
          {
            role: 'system',
            content: 'You are a prediction market oracle. Analyze questions and provide clear YES/NO/INVALID answers.',
          },
          {
            role: 'user',
            content: 'Analyze this prediction market question and answer ONLY \'YES\', \'NO\', or \'INVALID\':\nIs 2 + 2 equal to 4?\n\nRespond with ONLY one word: YES, NO, or INVALID',
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
    return { success: true, model: modelName, answer };
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    return { success: false, model: modelName, error: errorMsg };
  }
}

async function main() {
  console.log('🔍 Buscando modelos disponibles en Groq (sin DeepSeek ni Qwen)...\n');

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('❌ ERROR: GROQ_API_KEY no está configurada');
    process.exit(1);
  }

  console.log(`📋 Probando ${modelsToTest.length} modelos...\n`);

  const results = {
    available: [],
    unavailable: [],
  };

  for (const model of modelsToTest) {
    process.stdout.write(`   Probando ${model}... `);
    const result = await testModel(apiKey, model);
    
    if (result.success) {
      console.log(`✅ DISPONIBLE (respondió: ${result.answer})`);
      results.available.push(model);
    } else {
      console.log(`❌ ${result.error.substring(0, 60)}...`);
      results.unavailable.push({ model, error: result.error });
    }
    
    // Pequeña pausa para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTADOS');
  console.log('='.repeat(60));
  
  console.log(`\n✅ MODELOS DISPONIBLES (${results.available.length}):`);
  results.available.forEach((model, index) => {
    console.log(`   ${index + 1}. ${model}`);
  });

  if (results.available.length >= 3) {
    console.log(`\n🎉 ¡Encontramos ${results.available.length} modelos disponibles!`);
    console.log('   Podemos completar las 5 IAs con estos modelos.');
  } else {
    console.log(`\n⚠️  Solo encontramos ${results.available.length} modelos disponibles.`);
    console.log('   Necesitamos al menos 3 más para completar las 5 IAs.');
  }

  console.log(`\n❌ MODELOS NO DISPONIBLES (${results.unavailable.length}):`);
  results.unavailable.slice(0, 5).forEach(({ model, error }) => {
    console.log(`   - ${model}: ${error.substring(0, 50)}...`);
  });
  if (results.unavailable.length > 5) {
    console.log(`   ... y ${results.unavailable.length - 5} más`);
  }
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

