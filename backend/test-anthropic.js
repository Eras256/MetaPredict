/**
 * Script de prueba para verificar la integración de Anthropic Claude en el backend
 * 
 * Uso:
 *   node test-anthropic.js
 *   node test-anthropic.js YOUR_API_KEY
 * 
 * Asegúrate de tener ANTHROPIC_API_KEY configurada en tu .env
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const axios = require('axios');

async function testAnthropic() {
  console.log('🧪 Iniciando prueba de Anthropic Claude...\n');

  // Verificar API key (puede venir de .env o como argumento)
  let apiKey = process.env.ANTHROPIC_API_KEY;
  
  // Si no está en .env, intentar desde argumentos de línea de comandos
  if (!apiKey && process.argv[2]) {
    apiKey = process.argv[2];
  }
  
  if (!apiKey || apiKey.includes('your_anthropic')) {
    console.error('❌ ERROR: ANTHROPIC_API_KEY no está configurada');
    console.error('   Por favor, configura la variable en tu archivo .env');
    console.error('   O pásala como argumento: node test-anthropic.js YOUR_API_KEY');
    console.error('   Obtén tu API key en: https://console.anthropic.com/');
    process.exit(1);
  }

  console.log('✅ API Key encontrada');
  console.log(`   Key preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

  // Modelos a probar en orden
  const modelsToTry = [
    'claude-3-5-sonnet-20241022',  // Modelo principal
    'claude-3-5-haiku-20241022',   // Fallback más rápido
    'claude-3-opus-20240229',      // Fallback alternativo
  ];

  console.log('🔄 Probando modelos en orden de fallback...\n');

  let success = false;
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`📡 Intentando con: ${modelName}...`);
      
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: modelName,
          max_tokens: 200,
          messages: [
            {
              role: 'user',
              content: `Responde con un JSON: {"status": "ok", "message": "Anthropic Claude está funcionando correctamente", "model": "${modelName}", "timestamp": "${new Date().toISOString()}"}`,
            },
          ],
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 segundos
        }
      );

      const responseText = response.data.content[0].text.trim();
      console.log(`✅ ${modelName} funcionó correctamente!`);
      console.log(`   Respuesta: ${responseText.substring(0, 100)}...\n`);

      // Intentar parsear JSON
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON parseado correctamente:');
          console.log(JSON.stringify(parsed, null, 2));
        }
      } catch (e) {
        console.log('⚠️  Respuesta recibida pero no es JSON válido');
      }

      // Probar el servicio de análisis de mercado
      console.log('\n📊 Probando análisis de mercado...');
      const marketResponse = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: modelName,
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'Analyze this prediction market question and answer ONLY \'YES\', \'NO\', or \'INVALID\':\nWill Bitcoin reach $100,000 by the end of 2025?\n\nRespond with ONLY one word: YES, NO, or INVALID',
            },
          ],
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const marketAnswer = marketResponse.data.content[0].text.trim().toUpperCase();
      console.log(`✅ Análisis de mercado: ${marketAnswer}`);
      
      if (marketAnswer.includes('YES') || marketAnswer.includes('NO') || marketAnswer.includes('INVALID')) {
        console.log('✅ Formato de respuesta correcto para análisis de mercado\n');
      } else {
        console.log('⚠️  Respuesta no sigue el formato esperado\n');
      }

      success = true;
      break;
    } catch (error) {
      lastError = error;
      const errorMessage = error.response?.data?.error?.message || error.message;
      
      // Si es error de autenticación, no intentar otros modelos
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error(`❌ Error de autenticación: ${errorMessage}`);
        console.error('   Verifica que tu API key sea correcta');
        process.exit(1);
      }
      
      console.log(`❌ ${modelName} falló: ${errorMessage}\n`);
      continue;
    }
  }

  if (!success) {
    console.error('❌ Todos los modelos fallaron');
    console.error(`   Último error: ${lastError?.response?.data?.error?.message || lastError?.message}`);
    process.exit(1);
  }

  console.log('\n🎉 Prueba completada exitosamente!');
  console.log('   Anthropic Claude está correctamente integrado en el backend.');
  console.log('   ✅ API Key válida');
  console.log('   ✅ Modelo funcionando');
  console.log('   ✅ Análisis de mercado operativo');
}

// Ejecutar prueba
testAnthropic().catch((error) => {
  console.error('❌ Error en la prueba:', error);
  process.exit(1);
});

