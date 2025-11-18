/**
 * Test para CometAPI
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const axios = require('axios');

async function testCometAPI() {
  console.log('🧪 Iniciando prueba de CometAPI...\n');

  let apiKey = process.env.COMETAPI_API_KEY;
  if (!apiKey && process.argv[2]) {
    apiKey = process.argv[2];
  }
  if (!apiKey) {
    console.error('❌ ERROR: COMETAPI_API_KEY no está configurada');
    console.error('   Por favor, configura la variable en tu archivo .env');
    console.error('   O pásala como argumento: node test-cometapi.js YOUR_API_KEY');
    console.error('\n   Obtén tu API key en: https://www.cometapi.com/dashboard/api-keys');
    process.exit(1);
  }

  console.log('✅ API Key encontrada');
  console.log(`   Key preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

  // Modelos a probar (CometAPI tiene acceso a 500+ modelos)
  const modelsToTry = [
    'gpt-4o-mini', // OpenAI
    'claude-3-5-sonnet-20241022', // Anthropic
    'deepseek-chat', // DeepSeek
    'gemini-2.0-flash-exp', // Google
    'llama-3.1-8b-instant', // Meta
    'mistral-large-latest', // Mistral
    'qwen-2.5-7b-instruct', // Qwen
  ];

  console.log('🔄 Probando modelos disponibles en CometAPI...\n');

  let successCount = 0;
  const results = [];

  for (const modelName of modelsToTry) {
    try {
      console.log(`📡 Probando: ${modelName}...`);

      const response = await axios.post(
        'https://api.cometapi.com/v1/chat/completions',
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
    console.log(`\n✅ MODELOS FUNCIONANDO (${successCount}/${modelsToTry.length}):`);
    results.filter(r => r.success).forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.model}`);
      console.log(`      Respuesta: ${result.answer}`);
    });
    
    console.log(`\n🎉 CometAPI está funcionando correctamente!`);
    console.log(`   ${successCount} modelo(s) disponible(s) para usar.`);
    console.log(`   CometAPI da acceso a 500+ modelos a través de una sola API.`);
  } else {
    console.log('\n❌ Ningún modelo funcionó');
    console.log('   Verifica tu API key en: https://www.cometapi.com/dashboard/api-keys');
    process.exit(1);
  }

  if (results.some(r => !r.success)) {
    console.log(`\n⚠️  MODELOS NO DISPONIBLES (${modelsToTry.length - successCount}):`);
    results.filter(r => !r.success).forEach((result) => {
      console.log(`   - ${result.model}: ${result.error}`);
    });
  }
}

testCometAPI().catch((error) => {
  console.error('❌ Error en la prueba:', error);
  process.exit(1);
});

