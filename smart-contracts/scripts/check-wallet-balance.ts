import * as dotenv from "dotenv";
import * as path from "path";

// Import ethers - @nomicfoundation/hardhat-toolbox provides this
// @ts-ignore - Hardhat types may not be fully updated
import { ethers } from "hardhat";

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Script rápido para verificar balance del wallet de deployment
 * 
 * Uso:
 *   npx ts-node scripts/check-wallet-balance.ts
 */
async function main() {
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.error("❌ PRIVATE_KEY no configurada en .env");
    process.exit(1);
  }

  const wallet = new ethers.Wallet(privateKey);
  console.log("📋 Wallet de Deployment:");
  console.log("   Address:", wallet.address);
  console.log("");

  // Testnet
  const testnetProvider = new ethers.providers.JsonRpcProvider(
    process.env.RPC_URL_TESTNET || "https://opbnb-testnet-rpc.bnbchain.org"
  );
  
  const testnetBalance = await testnetProvider.getBalance(wallet.address);
  const testnetBNB = ethers.utils.formatEther(testnetBalance);
  
  console.log("💰 Balance en opBNB Testnet:");
  console.log("   ", testnetBNB, "tBNB");
  
  if (parseFloat(testnetBNB) < 0.1) {
    console.log("\n💧 Necesitas más tokens! Usa estos faucets:");
    console.log("   L2Faucet: https://www.l2faucet.com/opbnb");
    console.log("   Thirdweb: https://thirdweb.com/opbnb-testnet");
    console.log("\n   Dirección:", wallet.address);
  } else {
    console.log("   ✅ Balance suficiente para deployment");
  }
}

main().catch(console.error);

