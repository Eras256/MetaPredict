/**
 * Script simple para obtener la dirección del wallet desde PRIVATE_KEY
 * No requiere Hardhat, solo Node.js
 * 
 * Uso:
 *   node scripts/get-wallet-address.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { ethers } = require('ethers');

async function main() {
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.error('❌ ERROR: PRIVATE_KEY no está configurada en .env');
    console.error('   Por favor, agrega PRIVATE_KEY=tu_private_key en tu archivo .env');
    process.exit(1);
  }

  // Validar formato
  if (!privateKey.match(/^[0-9a-fA-F]{64}$/)) {
    console.error('❌ ERROR: PRIVATE_KEY tiene formato inválido');
    console.error('   Debe ser una cadena hexadecimal de 64 caracteres (sin 0x)');
    process.exit(1);
  }

  // Crear wallet
  const wallet = new ethers.Wallet(privateKey);
  
  console.log('✅ Wallet configurado correctamente\n');
  console.log('📋 Información del Wallet:');
  console.log('   Address:', wallet.address);
  console.log('   Public Key:', wallet.publicKey.substring(0, 20) + '...\n');
  
  console.log('💧 Obtén tokens testnet en estos faucets:');
  console.log('   1. L2Faucet (Recomendado): https://www.l2faucet.com/opbnb');
  console.log('   2. Thirdweb: https://thirdweb.com/opbnb-testnet');
  console.log('   3. BNB Chain: https://testnet.bnbchain.org/faucet-smart\n');
  console.log('   📍 Dirección para recibir tokens:');
  console.log('   ', wallet.address, '\n');
  
  console.log('📝 Instrucciones:');
  console.log('   1. Copia la dirección de arriba');
  console.log('   2. Visita uno de los faucets');
  console.log('   3. Pega tu dirección y solicita tokens');
  console.log('   4. Espera unos segundos para recibir los tBNB\n');
  
  console.log('✅ Después de obtener tokens, verifica tu balance con:');
  console.log('   pnpm run wallet:check');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});

