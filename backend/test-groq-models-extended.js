/**
 * Script extendido para probar más variantes de modelos de Groq
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const axios = require('axios');

const modelsToTest = [
  // Variantes de Llama 3.1
  'llama-3.1-8b-instant',
  'llama-3.1-8b',
  'llama-3.1-70b',
  'llama-3.1-405b',
  'llama-3.1-8b-instruct',
  'llama-3.1-70b-instruct',
  
  // Variantes de Llama 3
  'llama-3-8b-8192',
  'llama-3-70b-8192',
  'llama-3-8b',
  'llama-3-70b',
  
  // Variantes de Mixtral
  'mixtral-8x7b',
  'mixtral-8x22b',
  'mixtral-8x7b-instruct',
  'mixtral-8x22b-instruct',
  
  // Variantes de Gemma
  'gemma-7b',
  'gemma-7b-it',
  'gemma-2b',
  'gemma-2b-it',
  
  // Otros posibles
  'llama-3.1-8b-instant-turbo',
  'llama-3.1-8b-turbo',
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
  console.log('🔍 Buscando más modelos en Groq...\n');

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('❌ ERROR: GROQ_API_KEY no está configurada');
    process.exit(1);
  }

  console.log(`📋 Probando ${modelsToTest.length} variantes adicionales...\n`);

  const available = [];

  for (const model of modelsToTest) {
    process.stdout.write(`   ${model.padEnd(35)}... `);
    const result = await testModel(apiKey, model);
    
    if (result.success) {
      console.log(`✅`);
      available.push(model);
    } else {
      console.log(`❌`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTADOS');
  console.log('='.repeat(60));
  
  if (available.length > 0) {
    console.log(`\n✅ MODELOS DISPONIBLES (${available.length}):`);
    available.forEach((model, index) => {
      console.log(`   ${index + 1}. ${model}`);
    });
  } else {
    console.log('\n❌ No se encontraron modelos adicionales disponibles.');
  }
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

