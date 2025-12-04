import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
// @ts-ignore - Hardhat types may not be fully updated
import { ethers } from "hardhat";

// Load .env
const envPath = path.resolve(__dirname, '../../.env');
const envLocalPath = path.resolve(__dirname, '../../.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

const CORE_CONTRACT = process.env.CORE_CONTRACT_ADDRESS || "0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC";
const MARKET_ID = process.env.MARKET_ID || "21";

async function main() {
  console.log("💰 Probando apuesta en mercado\n");
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("📋 Market ID:", MARKET_ID);
  console.log("");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("👤 Usando cuenta:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "BNB");
    console.log("");

    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // Verificar el mercado
    console.log("🔍 Verificando mercado...");
    const marketInfo = await core.markets(MARKET_ID);
    const marketTypeNum = Number(marketInfo.marketType);
    const statusNum = Number(marketInfo.status);
    
    console.log("   Tipo:", marketTypeNum === 0 ? "Binary" : marketTypeNum === 1 ? "Conditional" : "Subjective");
    console.log("   Estado:", statusNum === 0 ? "Active" : statusNum === 1 ? "Resolving" : statusNum === 2 ? "Resolved" : statusNum === 3 ? "Disputed" : "Cancelled");
    console.log("");

    if (statusNum !== 0) {
      console.log("❌ ERROR: El mercado no está activo");
      process.exit(1);
    }

    // Obtener información del mercado desde BinaryMarket
    const binaryMarketAddress = await core.binaryMarket();
    const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
    const binaryMarket = BinaryMarket.attach(binaryMarketAddress);
    
    const marketData = await binaryMarket.getMarket(MARKET_ID);
    console.log("📊 Estado actual del mercado:");
    console.log("   Yes Pool:", ethers.formatEther(marketData.yesPool), "BNB");
    console.log("   No Pool:", ethers.formatEther(marketData.noPool), "BNB");
    console.log("   Total Yes Shares:", marketData.totalYesShares.toString());
    console.log("   Total No Shares:", marketData.totalNoShares.toString());
    console.log("");

    // Colocar apuesta
    const betAmount = ethers.parseEther("0.01"); // 0.01 BNB
    const isYes = true;

    console.log("💰 Colocando apuesta...");
    console.log("   Cantidad:", ethers.formatEther(betAmount), "BNB");
    console.log("   Lado:", isYes ? "YES" : "NO");
    console.log("");

    console.log("⏳ Enviando transacción...");
    const betTx = await core.placeBet(MARKET_ID, isYes, { value: betAmount });
    
    console.log("📤 Transacción enviada:", betTx.hash);
    console.log("⏳ Esperando confirmación...");
    
    const betReceipt = await betTx.wait();
    console.log("✅ Transacción confirmada en el bloque:", betReceipt?.blockNumber);
    console.log("");

    // Verificar eventos
    console.log("🔍 Eventos emitidos:");
    for (const log of betReceipt.logs) {
      try {
        const parsed = core.interface.parseLog(log);
        if (parsed && parsed.name === 'FeeCollected') {
          console.log("   ✅ FeeCollected:");
          console.log("      Trading Fee:", ethers.formatEther(parsed.args[2] || 0n), "BNB");
          console.log("      Insurance Fee:", ethers.formatEther(parsed.args[3] || 0n), "BNB");
        }
      } catch (e) {
        try {
          const parsed = binaryMarket.interface.parseLog(log);
          if (parsed && parsed.name === 'BetPlaced') {
            console.log("   ✅ BetPlaced:");
            console.log("      User:", parsed.args[1]);
            console.log("      IsYes:", parsed.args[2]);
            console.log("      Amount:", ethers.formatEther(parsed.args[3] || 0n), "BNB");
            console.log("      Shares:", parsed.args[4].toString());
          }
        } catch (e2) {
          // No es un evento conocido
        }
      }
    }
    console.log("");

    // Verificar estado después de la apuesta
    const marketDataAfter = await binaryMarket.getMarket(MARKET_ID);
    console.log("📊 Estado después de la apuesta:");
    console.log("   Yes Pool:", ethers.formatEther(marketDataAfter.yesPool), "BNB");
    console.log("   No Pool:", ethers.formatEther(marketDataAfter.noPool), "BNB");
    console.log("   Total Yes Shares:", marketDataAfter.totalYesShares.toString());
    console.log("   Total No Shares:", marketDataAfter.totalNoShares.toString());
    console.log("");

    // Verificar posición del usuario
    const position = await binaryMarket.positions(MARKET_ID, deployer.address);
    console.log("👤 Posición del usuario:");
    console.log("   Yes Shares:", position.yesShares.toString());
    console.log("   No Shares:", position.noShares.toString());
    console.log("   Avg Yes Price:", position.avgYesPrice.toString());
    console.log("   Avg No Price:", position.avgNoPrice.toString());
    console.log("");

    console.log("🎉 ¡Apuesta colocada exitosamente!");
    console.log("");
    console.log("🔗 Ver en opBNBScan:");
    console.log(`   Transacción: https://testnet.opbnbscan.com/tx/${betTx.hash}`);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    
    if (error.message.includes("Only core")) {
      console.error("");
      console.error("💡 El error 'Only core' indica que:");
      console.error("   1. El BinaryMarket tiene un coreContract diferente al Core actual");
      console.error("   2. O hay un problema con cómo el Core llama a binaryMarket.placeBet()");
      console.error("");
      console.error("   Verifica ejecutando:");
      console.error("   pnpm hardhat run scripts/verify-contract-linking.ts --network opBNBTestnet");
    } else if (error.message.includes("Not active")) {
      console.error("");
      console.error("💡 El mercado no está activo. Verifica el estado del mercado.");
    } else if (error.message.includes("Invalid amount")) {
      console.error("");
      console.error("💡 La cantidad debe estar entre 0.001 BNB y 100 BNB.");
    } else {
      console.error("");
      console.error("💡 Revisa el error completo arriba para más detalles.");
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

