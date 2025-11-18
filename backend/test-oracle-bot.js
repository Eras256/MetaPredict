/**
 * Script de Prueba para Oracle Bot
 * 
 * Este script prueba el flujo completo del Oracle Bot:
 * 1. Verifica configuración de Gelato
 * 2. Verifica estado del bot
 * 3. Prueba resolución manual de un mercado
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
const AI_ORACLE_ADDRESS = process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS || '0xB937f6a00bE40500B3Da15795Dc72783b05c1D18';

async function testGelatoStatus() {
  console.log('\n🔍 1. Verificando estado de Gelato...\n');
  try {
    const response = await axios.get(`${BASE_URL}/gelato/status`);
    console.log('✅ Gelato Status:', JSON.stringify(response.data, null, 2));
    return response.data.configured;
  } catch (error) {
    console.error('❌ Error verificando Gelato:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    return false;
  }
}

async function testBotStatus() {
  console.log('\n🤖 2. Verificando estado del Oracle Bot...\n');
  try {
    const response = await axios.get(`${BASE_URL}/gelato/bot-status`);
    console.log('✅ Bot Status:', JSON.stringify(response.data, null, 2));
    return response.data.isRunning;
  } catch (error) {
    console.error('❌ Error verificando bot:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    return false;
  }
}

async function testManualResolution() {
  console.log('\n📝 3. Probando resolución manual de mercado...\n');
  console.log('   Market ID: 1');
  console.log('   Outcome: 1 (Yes)');
  console.log('   Confidence: 85%');
  console.log('   AI Oracle:', AI_ORACLE_ADDRESS);
  console.log('');
  
  try {
    const response = await axios.post(`${BASE_URL}/gelato/fulfill-resolution`, {
      aiOracleAddress: AI_ORACLE_ADDRESS,
      marketId: 1,
      outcome: 1, // 1=Yes, 2=No, 3=Invalid
      confidence: 85,
      chainId: 5611
    });
    
    console.log('✅ Resolución enviada exitosamente!');
    console.log('   Task ID:', response.data.taskId);
    console.log('   Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error en resolución:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas del Oracle Bot...\n');
  console.log('='.repeat(60));
  
  // Test 1: Gelato Status
  const gelatoOk = await testGelatoStatus();
  if (!gelatoOk) {
    console.log('\n⚠️  Gelato no está configurado correctamente.');
    console.log('   Verifica que GELATO_RELAY_API_KEY esté en .env');
    return;
  }
  
  // Test 2: Bot Status
  const botRunning = await testBotStatus();
  if (!botRunning) {
    console.log('\n⚠️  El bot no está corriendo.');
    console.log('   Asegúrate de que el backend esté iniciado y el bot se haya iniciado correctamente.');
  }
  
  // Test 3: Manual Resolution (comentado por defecto para no ejecutar transacciones reales)
  console.log('\n💡 Para probar resolución manual, descomenta la siguiente línea:');
  console.log('   // await testManualResolution();');
  // await testManualResolution();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Pruebas completadas!\n');
}

main().catch(console.error);

