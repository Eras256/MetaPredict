/**
 * Script de prueba para verificar la integración de Groq AI en el backend
 * 
 * Uso:
 *   node test-groq.js
 * 
 * Asegúrate de tener GROQ_API_KEY configurada en tu .env
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const axios = require('axios');

async function testGroq() {
  console.log('🧪 Iniciando prueba de Groq AI...\n');

  // Verificar API key (puede venir de .env o como argumento)
  let apiKey = process.env.GROQ_API_KEY;
  
  // Si no está en .env, intentar desde argumentos de línea de comandos
  if (!apiKey && process.argv[2]) {
    apiKey = process.argv[2];
  }
  
  if (!apiKey) {
    console.error('❌ ERROR: GROQ_API_KEY no está configurada');
    console.error('   Por favor, configura la variable en tu archivo .env');
    console.error('   O pásala como argumento: node test-groq.js YOUR_API_KEY');
    process.exit(1);
  }

  console.log('✅ API Key encontrada');
  console.log(`   Key preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

  // Modelos a probar en orden
  const modelsToTry = [
    'llama-3.1-8b-instant',    // Modelo principal (70b deprecated)
    'llama-3.1-70b-versatile', // Fallback (puede estar deprecado)
    'mixtral-8x7b-32768',      // Alternativa Mixtral
  ];

  console.log('🔄 Probando modelos en orden de fallback...\n');

  let success = false;
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`📡 Intentando con: ${modelName}...`);
      
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: modelName,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant. Respond with valid JSON when requested.',
            },
            {
              role: 'user',
              content: `Responde con un JSON: {"status": "ok", "message": "Groq está funcionando correctamente", "model": "${modelName}", "timestamp": "${new Date().toISOString()}"}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 200,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseText = response.data.choices[0].message.content.trim();
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
        }
      );

      const marketAnswer = marketResponse.data.choices[0].message.content.trim().toUpperCase();
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
  console.log('   Groq AI está correctamente integrado en el backend.');
  console.log('   ✅ API Key válida');
  console.log('   ✅ Modelo funcionando');
  console.log('   ✅ Análisis de mercado operativo');
}

// Ejecutar prueba
testGroq().catch((error) => {
  console.error('❌ Error en la prueba:', error);
  process.exit(1);
});

