/**
 * Script exhaustivo para encontrar TODOS los modelos disponibles en Groq
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const axios = require('axios');

// Lista exhaustiva de posibles modelos
const allPossibleModels = [
  // Llama 3.1
  'llama-3.1-8b-instant',
  'llama-3.1-8b',
  'llama-3.1-70b',
  'llama-3.1-70b-versatile',
  'llama-3.1-405b',
  'llama-3.1-8b-instruct',
  'llama-3.1-70b-instruct',
  
  // Llama 3
  'llama-3-8b-8192',
  'llama-3-70b-8192',
  'llama-3-8b',
  'llama-3-70b',
  'llama-3-8b-instruct',
  'llama-3-70b-instruct',
  
  // Llama 3.2
  'llama-3.2-1b-instruct',
  'llama-3.2-3b-instruct',
  'llama-3.2-11b-instruct',
  'llama-3.2-90b-instruct',
  'llama-3.2-11b-vision-instruct',
  
  // Llama 3.3
  'llama-3.3-70b-instruct',
  'llama-3.3-8b-instruct',
  'llama-3.3-405b-instruct',
  
  // Mixtral
  'mixtral-8x7b-32768',
  'mixtral-8x22b-instruct',
  'mixtral-8x7b',
  'mixtral-8x22b',
  'mixtral-large',
  'mixtral-8x7b-instruct',
  
  // Gemma
  'gemma-7b-it',
  'gemma-7b',
  'gemma-2b-it',
  'gemma-2b',
  'gemma2-9b-it',
  'gemma2-27b-it',
  
  // Otros posibles
  'llama-3-groq-tool-use-8b',
  'llama-3-groq-tool-use-70b',
  'llama-3.1-groq-tool-use-8b',
  'llama-3.1-groq-tool-use-70b',
];

async function testModel(apiKey, modelName) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: modelName,
        messages: [
          {
            role: 'user',
            content: 'Say YES',
          },
        ],
        max_tokens: 5,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    return { success: true, model: modelName };
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    return { success: false, model: modelName, error: errorMsg };
  }
}

async function main() {
  console.log('🔍 Búsqueda EXHAUSTIVA de modelos disponibles en Groq...\n');

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('❌ ERROR: GROQ_API_KEY no está configurada');
    process.exit(1);
  }

  console.log(`📋 Probando ${allPossibleModels.length} modelos posibles...\n`);

  const available = [];
  const unavailable = [];

  for (const model of allPossibleModels) {
    process.stdout.write(`   ${model.padEnd(40)}... `);
    const result = await testModel(apiKey, model);
    
    if (result.success) {
      console.log(`✅ DISPONIBLE`);
      available.push(model);
    } else {
      const shortError = result.error.substring(0, 50);
      console.log(`❌ ${shortError}...`);
      unavailable.push({ model, error: result.error });
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 RESULTADOS FINALES');
  console.log('='.repeat(70));
  
  if (available.length > 0) {
    console.log(`\n✅ MODELOS DISPONIBLES (${available.length}):`);
    available.forEach((model, index) => {
      console.log(`   ${index + 1}. ${model}`);
    });
    
    if (available.length >= 4) {
      console.log(`\n🎉 ¡Perfecto! Encontramos ${available.length} modelos disponibles.`);
      console.log('   Podemos usar modelos diferentes en lugar de configuraciones.');
    } else {
      console.log(`\n⚠️  Solo encontramos ${available.length} modelo(s) disponible(s).`);
      console.log('   Necesitamos usar configuraciones diferentes del mismo modelo.');
    }
  } else {
    console.log('\n❌ No se encontraron modelos disponibles.');
  }
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

