/**
 * Script para verificar balance de cualquier dirección en opBNB Testnet
 * No requiere private key
 * 
 * Uso:
 *   node scripts/check-balance-address.js 0x8ec3829793d0a2499971d0d853935f17ab52f800
 */

const { ethers } = require('ethers');

const RPC_URL_TESTNET = 'https://opbnb-testnet-rpc.bnbchain.org';
const address = process.argv[2] || '0x8ec3829793d0a2499971d0d853935f17ab52f800';

async function main() {
  console.log('📡 Verificando balance en opBNB Testnet...\n');
  console.log('📍 Dirección:', address);
  console.log('');

  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL_TESTNET);
    const balance = await provider.getBalance(address);
    const balanceInBNB = ethers.utils.formatEther(balance);
    
    console.log('💰 Balance:', balanceInBNB, 'tBNB');
    console.log('');
    
    if (parseFloat(balanceInBNB) < 0.1) {
      console.log('⚠️  Balance insuficiente para deployment');
      console.log('   Necesitas al menos 0.1 tBNB\n');
      console.log('💧 Obtén tokens testnet en:');
      console.log('   1. L2Faucet (Recomendado): https://www.l2faucet.com/opbnb');
      console.log('   2. Thirdweb: https://thirdweb.com/opbnb-testnet');
      console.log('   3. BNB Chain: https://testnet.bnbchain.org/faucet-smart\n');
      console.log('   📍 Dirección para recibir tokens:');
      console.log('   ', address);
    } else {
      console.log('✅ Balance suficiente para deployment');
    }
    
    console.log('\n🔍 Ver en explorer:');
    console.log('   https://opbnb-testnet.bscscan.com/address/' + address);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();

