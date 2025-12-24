import hre from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// Transaction hashes from the workflow execution
const TX_HASHES = [
  "0x62f45412e8293f3f94f5f7a31542a72adfe72699ffe6c64918f20da6ff49c183", // Market #17
  "0xee9625f06cdf4ee39f1e0395f1af54cd793f13bc89ac2aa46961a46495604690", // Market #136
];

async function main() {
  console.log("💰 Calculando costos de transacciones...\n");
  console.log("=".repeat(80));

  // Use Hardhat 3.x API - connect to network to get ethers
  const { ethers } = await hre.network.connect();

  // Get gas price from network config (20 gwei for opBNB Testnet)
  const networkConfig = hre.config.networks.opBNBTestnet;
  const configuredGasPrice = networkConfig?.gasPrice || BigInt(20000000000); // 20 gwei default

  console.log(`⛽ Gas Price configurado: ${ethers.formatUnits(configuredGasPrice, "gwei")} gwei\n`);

  let totalGasUsed = BigInt(0);
  let totalCost = BigInt(0);

  for (let i = 0; i < TX_HASHES.length; i++) {
    const txHash = TX_HASHES[i];
    console.log(`📋 Transacción #${i + 1}: ${txHash}`);

    try {
      // Get both transaction and receipt to get actual gas price
      const [tx, receipt] = await Promise.all([
        ethers.provider.getTransaction(txHash),
        ethers.provider.getTransactionReceipt(txHash)
      ]);
      
      if (!receipt || !tx) {
        console.log(`   ⚠️  Transacción no encontrada\n`);
        continue;
      }

      // Use actual gas price from transaction, fallback to configured
      const actualGasPrice = tx.gasPrice || configuredGasPrice;
      const gasUsed = receipt.gasUsed;
      const cost = gasUsed * actualGasPrice;
      const costInBNB = ethers.formatEther(cost);

      console.log(`   Gas usado: ${gasUsed.toString()}`);
      console.log(`   Gas Price: ${ethers.formatUnits(actualGasPrice, "gwei")} gwei`);
      console.log(`   Costo: ${costInBNB} BNB`);
      console.log(`   Bloque: ${receipt.blockNumber}`);
      console.log(`   Estado: ${receipt.status === 1 ? "✅ Exitoso" : "❌ Fallido"}\n`);

      totalGasUsed += gasUsed;
      totalCost += cost;
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log("=".repeat(80));
  console.log("📊 Resumen Total:");
  console.log(`   Total Gas usado: ${totalGasUsed.toString()}`);
  console.log(`   Costo total: ${ethers.formatEther(totalCost)} BNB`);
  console.log(`   Costo promedio por transacción: ${ethers.formatEther(totalCost / BigInt(TX_HASHES.length))} BNB`);
  console.log(`   Número de transacciones: ${TX_HASHES.length}\n`);

  // Get current balance for reference
  const deployerAddress = "0x8eC3829793D0a2499971d0D853935F17aB52F800";
  const balance = await ethers.provider.getBalance(deployerAddress);
  console.log(`💳 Balance actual de la cuenta:`);
  console.log(`   ${deployerAddress}`);
  console.log(`   ${ethers.formatEther(balance)} BNB\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

