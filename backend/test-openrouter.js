/**
 * Test para OpenRouter API
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const axios = require('axios');

async function testOpenRouter() {
  console.log('🧪 Iniciando prueba de OpenRouter API...\n');

  let apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey && process.argv[2]) {
    apiKey = process.argv[2];
  }
  if (!apiKey) {
    console.error('❌ ERROR: OPENROUTER_API_KEY no está configurada');
    console.error('   Por favor, configura la variable en tu archivo .env');
    console.error('   O pásala como argumento: node test-openrouter.js YOUR_API_KEY');
    console.error('\n   Obtén tu API key en: https://openrouter.ai');
    process.exit(1);
  }

  console.log('✅ API Key encontrada');
  console.log(`   Key preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

  // Modelos gratuitos disponibles en OpenRouter
  const freeModels = [
    'google/gemini-2.0-flash-exp:free',
    'google/gemini-flash-1.5:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'qwen/qwen-2.5-7b-instruct:free',
    'huggingfaceh4/zephyr-7b-beta:free',
    'openchat/openchat-7b:free',
  ];

  console.log('🔄 Probando modelos gratuitos...\n');

  let successCount = 0;
  const results = [];

  for (const modelName of freeModels) {
    try {
      console.log(`📡 Probando: ${modelName}...`);

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: modelName,
          messages: [
            {
              role: 'system',
              content: 'You are a prediction market oracle. Analyze questions and provide clear YES/NO/INVALID answers.',
            },
            {
              role: 'user',
              content: 'Analyze this prediction market question and answer ONLY \'YES\', \'NO\', or \'INVALID\':\nWill Bitcoin reach $100,000 by the end of 2025?\n\nRespond with ONLY one word: YES, NO, or INVALID',
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
      console.log(`   ✅ ${modelName} funcionó! Respuesta: ${answer}\n`);
      
      results.push({ model: modelName, success: true, answer });
      successCount++;
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.log(`   ❌ ${modelName} falló: ${errorMsg}\n`);
      results.push({ model: modelName, success: false, error: errorMsg });
    }
    
    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('='.repeat(70));
  console.log('📊 RESULTADOS FINALES');
  console.log('='.repeat(70));
  
  if (successCount > 0) {
    console.log(`\n✅ MODELOS FUNCIONANDO (${successCount}/${freeModels.length}):`);
    results.filter(r => r.success).forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.model}`);
      console.log(`      Respuesta: ${result.answer}`);
    });
    
    console.log(`\n🎉 OpenRouter está funcionando correctamente!`);
    console.log(`   ${successCount} modelo(s) disponible(s) para usar.`);
  } else {
    console.log('\n❌ Ningún modelo funcionó');
    console.log('   Verifica tu API key en: https://openrouter.ai');
    process.exit(1);
  }

  if (results.some(r => !r.success)) {
    console.log(`\n⚠️  MODELOS NO DISPONIBLES (${freeModels.length - successCount}):`);
    results.filter(r => !r.success).forEach((result) => {
      console.log(`   - ${result.model}: ${result.error}`);
    });
  }
}

testOpenRouter().catch((error) => {
  console.error('❌ Error en la prueba:', error);
  process.exit(1);
});

