/**
 * Probando modelos especiales mencionados en la documentación
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const axios = require('axios');

// Modelos especiales mencionados en búsquedas web
const specialModels = [
  'gpt-oss-120b',
  'gpt-oss-20b',
  'gpt-oss-120B',
  'gpt-oss-20B',
  'llama-4-scout',
  'llama-4-maverick',
  'llama-4-scout-instruct',
  'llama-4-maverick-instruct',
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
  console.log('🔍 Probando modelos especiales de Groq...\n');

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('❌ ERROR: GROQ_API_KEY no está configurada');
    process.exit(1);
  }

  const available = [];

  for (const model of specialModels) {
    process.stdout.write(`   ${model.padEnd(40)}... `);
    const result = await testModel(apiKey, model);
    
    if (result.success) {
      console.log(`✅ DISPONIBLE`);
      available.push(model);
    } else {
      console.log(`❌`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(70));
  if (available.length > 0) {
    console.log(`\n✅ MODELOS ESPECIALES DISPONIBLES (${available.length}):`);
    available.forEach((model, index) => {
      console.log(`   ${index + 1}. ${model}`);
    });
  } else {
    console.log('\n❌ No se encontraron modelos especiales disponibles.');
    console.log('   Solo está disponible: llama-3.1-8b-instant');
  }
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

