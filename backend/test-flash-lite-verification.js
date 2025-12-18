/**
 * Script rápido para verificar que Flash-Lite está siendo usado
 * Ejecutar: node test-flash-lite-verification.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const axios = require('axios');

async function testFlashLite() {
  console.log('\n🧪 Verificando que Flash-Lite está siendo usado...\n');
  
  try {
    const response = await axios.post('http://localhost:3001/api/ai/suggest-market', {
      topic: 'Bitcoin price prediction'
    }, {
      timeout: 30000
    });
    
    console.log('✅ Respuesta recibida:');
    console.log(`   Modelo usado: ${response.data.modelUsed || 'No especificado'}`);
    console.log(`   Sugerencias: ${response.data.suggestions?.length || 0}`);
    console.log(`   Duración: ${response.data.duration || 'N/A'}`);
    
    // Verificar en los logs del servidor si aparece "flash-lite"
    console.log('\n📋 Revisa los logs del servidor:');
    console.log('   Debe aparecer: [AI] Successfully used model: gemini-2.5-flash-lite');
    console.log('   NO debe aparecer: gemini-2.5-flash (a menos que Flash-Lite falle)\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testFlashLite();

