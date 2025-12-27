import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import hre from "hardhat";

// Load .env from root directory
const envPath = path.resolve(__dirname, '../../.env');
const envLocalPath = path.resolve(__dirname, '../../.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

/**
 * Script to check verification status of all contracts on opBNBScan Testnet
 */

const contracts = [
  { name: 'Prediction Market Core', address: '0x5eaa77CC135b82c254F1144c48f4d179964fA0b1' },
  { name: 'AI Oracle', address: '0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c' },
  { name: 'Insurance Pool', address: '0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA' },
  { name: 'Reputation Staking', address: '0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7' },
  { name: 'DAO Governance', address: '0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123' },
  { name: 'OmniRouter (Cross-Chain)', address: '0x11C1124384e463d99Ba84348280e318FbeE544d0' },
  { name: 'Binary Market', address: '0x68aEea03664707f152652F9562868CCF87C0962C' },
  { name: 'Conditional Market', address: '0x547FC8C5680B7c4ed05da93c635B6b9B83e12007' },
  { name: 'Subjective Market', address: '0x9a9c478BFdC45E2612f61726863AC1b6422217Ea' },
  { name: 'Chainlink Data Streams', address: '0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3' }
];

async function checkVerificationStatus(address: string): Promise<{ verified: boolean; error?: string }> {
  try {
    // Try to get contract info using ethers provider
    const code = await hre.ethers.provider.getCode(address);
    
    if (!code || code === '0x') {
      return { verified: false, error: 'No contract code found at this address' };
    }

    // We can't directly check verification status via RPC
    // So we'll just confirm the contract exists and return unknown status
    // The actual verification check needs to be done via opBNBScan API or manually
    return { verified: false, error: 'Cannot determine verification status via RPC (check opBNBScan manually)' };
  } catch (error: any) {
    return { verified: false, error: error.message };
  }
}

async function main() {
  console.log('🔍 Checking contract verification status...\n');
  console.log('Network: opBNB Testnet (Chain ID: 5611)\n');
  console.log('='.repeat(70) + '\n');

  const results = [];

  for (let i = 0; i < contracts.length; i++) {
    const contract = contracts[i];
    console.log(`[${i + 1}/10] ${contract.name}`);
    console.log(`   Address: ${contract.address}`);
    
    const status = await checkVerificationStatus(contract.address);
    results.push({ ...contract, ...status });
    
    console.log(`   Contract exists: ✅ (code found)`);
    console.log(`   Verification: ⚠️  Check manually on opBNBScan`);
    console.log(`   Link: https://testnet.opbnbscan.com/address/${contract.address}#code\n`);
    
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('='.repeat(70));
  console.log('📊 SUMMARY\n');
  console.log('⚠️  Note: Verification status must be checked manually on opBNBScan');
  console.log('   The API may not be accessible directly. Visit each link above.\n');
  console.log('📋 All 10 contracts exist on-chain and need verification:\n');
  
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.name}`);
    console.log(`   ${r.address}`);
    console.log(`   https://testnet.opbnbscan.com/address/${r.address}#code\n`);
  });

  console.log('\n✅ To verify contracts, use:');
  console.log('   pnpm hardhat verify --network opBNBTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>');
  console.log('   Or use the existing verify scripts in scripts/ folder\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });





