import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
// @ts-ignore - Hardhat types may not be fully updated
import { ethers } from "hardhat";

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
 * Script para obtener los argumentos del constructor del contrato PredictionMarketCore
 * desde el contrato desplegado
 */
async function main() {
  console.log("🔍 Obteniendo argumentos del constructor del contrato PredictionMarketCore...\n");

  const contractAddress = "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1";
  
  try {
    const core = await ethers.getContractAt("PredictionMarketCore", contractAddress);
    
    console.log("📋 Leyendo valores del contrato desplegado:\n");
    
    const binaryMarket = await core.binaryMarket();
    const conditionalMarket = await core.conditionalMarket();
    const subjectiveMarket = await core.subjectiveMarket();
    const aiOracle = await core.aiOracle();
    const reputationStaking = await core.reputationStaking();
    const insurancePool = await core.insurancePool();
    const crossChainRouter = await core.crossChainRouter();
    const daoGovernance = await core.daoGovernance();
    
    console.log("Argumentos del constructor:");
    console.log(`1. binaryMarket:       ${binaryMarket}`);
    console.log(`2. conditionalMarket:  ${conditionalMarket}`);
    console.log(`3. subjectiveMarket:   ${subjectiveMarket}`);
    console.log(`4. aiOracle:           ${aiOracle}`);
    console.log(`5. reputationStaking:  ${reputationStaking}`);
    console.log(`6. insurancePool:      ${insurancePool}`);
    console.log(`7. crossChainRouter:   ${crossChainRouter}`);
    console.log(`8. daoGovernance:      ${daoGovernance}`);
    
    console.log("\n📋 Array para usar en verificación:");
    console.log("const constructorArgs = [");
    console.log(`  "${binaryMarket}",`);
    console.log(`  "${conditionalMarket}",`);
    console.log(`  "${subjectiveMarket}",`);
    console.log(`  "${aiOracle}",`);
    console.log(`  "${reputationStaking}",`);
    console.log(`  "${insurancePool}",`);
    console.log(`  "${crossChainRouter}",`);
    console.log(`  "${daoGovernance}"`);
    console.log("];");
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

