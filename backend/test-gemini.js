/**
 * Script de prueba para verificar la integración de Gemini AI en el backend
 * 
 * Uso:
 *   node test-gemini.js
 * 
 * Asegúrate de tener GEMINI_API_KEY configurada en tu .env
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('🧪 Iniciando prueba de Gemini AI...\n');

  // Verificar API key
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('❌ ERROR: GEMINI_API_KEY o GOOGLE_API_KEY no está configurada');
    console.error('   Por favor, configura la variable en tu archivo .env');
    process.exit(1);
  }

  console.log('✅ API Key encontrada');
  console.log(`   Key preview: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

  // Crear instancia
  const genAI = new GoogleGenerativeAI(apiKey);

  // Modelos a probar en orden
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  console.log('🔄 Probando modelos en orden de fallback...\n');

  let success = false;
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`📡 Intentando con: ${modelName}...`);
      
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1024,
        },
      });

      const prompt = 'Responde con un JSON: {"status": "ok", "message": "Gemini está funcionando correctamente", "model": "' + modelName + '"}';
      const result = await model.generateContent(prompt);

      // Extraer texto de manera segura
      let responseText;
      const textResult = result.response.text();
      
      if (typeof textResult === 'string') {
        responseText = textResult;
      } else if (textResult && typeof textResult.then === 'function') {
        responseText = await textResult;
      } else {
        // Intentar acceder a candidates
        const candidates = result.response.candidates;
        if (candidates && candidates.length > 0 && candidates[0].content) {
          const parts = candidates[0].content.parts;
          if (parts && parts.length > 0 && parts[0].text) {
            responseText = parts[0].text;
          } else {
            throw new Error('Unable to extract text from candidates');
          }
        } else {
          throw new Error('Unexpected response structure');
        }
      }

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

      success = true;
      break;
    } catch (error) {
      lastError = error;
      console.log(`❌ ${modelName} falló: ${error.message}\n`);
      continue;
    }
  }

  if (!success) {
    console.error('❌ Todos los modelos fallaron');
    console.error(`   Último error: ${lastError?.message}`);
    process.exit(1);
  }

  console.log('\n🎉 Prueba completada exitosamente!');
  console.log('   Gemini AI está correctamente integrado en el backend.');
}

// Ejecutar prueba
testGemini().catch((error) => {
  console.error('❌ Error en la prueba:', error);
  process.exit(1);
});

