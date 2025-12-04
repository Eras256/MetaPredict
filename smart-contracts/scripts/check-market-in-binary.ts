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
const MARKET_ID = process.env.MARKET_ID || "18";

async function main() {
  console.log("🔍 Verificando mercado en BinaryMarket\n");
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("📋 Market ID:", MARKET_ID);
  console.log("");

  try {
    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // Obtener información del mercado desde el Core
    const marketInfo = await core.markets(MARKET_ID);
    const marketContractAddress = await core.marketTypeContract(MARKET_ID);
    
    console.log("📋 Información del mercado desde el Core:");
    console.log("   Tipo:", marketInfo.marketType === 0 ? "Binary" : marketInfo.marketType === 1 ? "Conditional" : "Subjective");
    console.log("   Estado:", marketInfo.status === 0 ? "Active" : marketInfo.status === 1 ? "Resolving" : marketInfo.status === 2 ? "Resolved" : marketInfo.status === 3 ? "Disputed" : "Cancelled");
    console.log("   Contrato:", marketContractAddress);
    console.log("");

    // Verificar en BinaryMarket
    const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
    const binaryMarket = BinaryMarket.attach(marketContractAddress);
    
    try {
      const binaryMarketData = await binaryMarket.getMarket(MARKET_ID);
      console.log("✅ Mercado encontrado en BinaryMarket:");
      console.log("   Pregunta:", binaryMarketData.question);
      console.log("   Resolved:", binaryMarketData.resolved);
      console.log("   Yes Pool:", ethers.formatEther(binaryMarketData.yesPool), "BNB");
      console.log("   No Pool:", ethers.formatEther(binaryMarketData.noPool), "BNB");
      console.log("");
    } catch (error: any) {
      console.log("❌ ERROR: No se pudo leer el mercado desde BinaryMarket");
      console.log("   Error:", error.message);
      console.log("");
      console.log("💡 Esto sugiere que el mercado no se creó correctamente en BinaryMarket");
      console.log("   Probablemente la llamada a binaryMarket.createMarket() falló con 'Only core'");
      console.log("");
    }

    // Verificar coreContract del BinaryMarket
    const binaryCoreContract = await binaryMarket.coreContract();
    console.log("🔍 Verificando coreContract:");
    console.log("   BinaryMarket.coreContract:", binaryCoreContract);
    console.log("   Core Contract:", CORE_CONTRACT);
    console.log("   Coinciden:", binaryCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase());
    console.log("");

    if (binaryCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
      console.log("❌ PROBLEMA: coreContract no coincide");
      console.log("   Esto causará el error 'Only core' al intentar crear mercados o apostar");
    } else {
      console.log("✅ coreContract es correcto");
      console.log("");
      console.log("💡 Si aún tienes el error 'Only core', puede ser que:");
      console.log("   1. El mercado no se creó correctamente en BinaryMarket");
      console.log("   2. Hay un problema con la llamada desde el Core");
    }

  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

