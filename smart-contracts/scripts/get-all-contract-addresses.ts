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

async function main() {
  console.log("🔍 Obteniendo todas las direcciones de contratos desde el Core...\n");
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("");

  try {
    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // Obtener todas las direcciones desde el Core
    console.log("📋 Direcciones configuradas en el Core Contract:\n");
    
    const binaryMarket = await core.binaryMarket();
    const conditionalMarket = await core.conditionalMarket();
    const subjectiveMarket = await core.subjectiveMarket();
    const aiOracle = await core.aiOracle();
    const reputationStaking = await core.reputationStaking();
    const insurancePool = await core.insurancePool();
    const crossChainRouter = await core.crossChainRouter();
    const daoGovernance = await core.daoGovernance();

    console.log("✅ Direcciones desde el Core:");
    console.log(`   CORE_CONTRACT: "${CORE_CONTRACT}"`);
    console.log(`   BINARY_MARKET: "${binaryMarket}"`);
    console.log(`   CONDITIONAL_MARKET: "${conditionalMarket}"`);
    console.log(`   SUBJECTIVE_MARKET: "${subjectiveMarket}"`);
    console.log(`   AI_ORACLE: "${aiOracle}"`);
    console.log(`   REPUTATION_STAKING: "${reputationStaking}"`);
    console.log(`   INSURANCE_POOL: "${insurancePool}"`);
    console.log(`   OMNI_ROUTER: "${crossChainRouter}"`);
    console.log(`   DAO_GOVERNANCE: "${daoGovernance}"`);
    console.log("");

    // Verificar coreContract en cada contrato de mercado
    console.log("🔍 Verificando coreContract en cada contrato de mercado:\n");
    
    const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
    const binaryMarketContract = BinaryMarket.attach(binaryMarket);
    const binaryCoreContract = await binaryMarketContract.coreContract();
    
    const ConditionalMarket = await ethers.getContractFactory("ConditionalMarket");
    const conditionalMarketContract = ConditionalMarket.attach(conditionalMarket);
    const conditionalCoreContract = await conditionalMarketContract.coreContract();
    
    const SubjectiveMarket = await ethers.getContractFactory("SubjectiveMarket");
    const subjectiveMarketContract = SubjectiveMarket.attach(subjectiveMarket);
    const subjectiveCoreContract = await subjectiveMarketContract.coreContract();

    console.log(`   BinaryMarket.coreContract: "${binaryCoreContract}"`);
    console.log(`   ConditionalMarket.coreContract: "${conditionalCoreContract}"`);
    console.log(`   SubjectiveMarket.coreContract: "${subjectiveCoreContract}"`);
    console.log("");

    // Verificar si coinciden
    const allMatch = 
      binaryCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase() &&
      conditionalCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase() &&
      subjectiveCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase();

    if (allMatch) {
      console.log("✅ Todos los contratos de mercado tienen el coreContract correcto\n");
    } else {
      console.log("❌ ALGUNOS CONTRATOS DE MERCADO TIENEN coreContract INCORRECTO\n");
      if (binaryCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
        console.log(`   ⚠️  BinaryMarket tiene coreContract diferente: ${binaryCoreContract}`);
      }
      if (conditionalCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
        console.log(`   ⚠️  ConditionalMarket tiene coreContract diferente: ${conditionalCoreContract}`);
      }
      if (subjectiveCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
        console.log(`   ⚠️  SubjectiveMarket tiene coreContract diferente: ${subjectiveCoreContract}`);
      }
      console.log("");
    }

    // Generar código TypeScript para addresses.ts
    console.log("📝 Código para frontend/lib/contracts/addresses.ts:\n");
    console.log("```typescript");
    console.log("export const CONTRACT_ADDRESSES = {");
    console.log(`  PREDICTION_MARKET: "${CORE_CONTRACT}",`);
    console.log(`  CORE_CONTRACT: "${CORE_CONTRACT}",`);
    console.log(`  BINARY_MARKET: "${binaryMarket}",`);
    console.log(`  CONDITIONAL_MARKET: "${conditionalMarket}",`);
    console.log(`  SUBJECTIVE_MARKET: "${subjectiveMarket}",`);
    console.log(`  AI_ORACLE: "${aiOracle}",`);
    console.log(`  INSURANCE_POOL: "${insurancePool}",`);
    console.log(`  REPUTATION_STAKING: "${reputationStaking}",`);
    console.log(`  OMNI_ROUTER: "${crossChainRouter}",`);
    console.log(`  DAO_GOVERNANCE: "${daoGovernance}",`);
    console.log("};");
    console.log("```");
    console.log("");

    // Generar variables de entorno
    console.log("📝 Variables de entorno para .env.local:\n");
    console.log("```");
    console.log(`NEXT_PUBLIC_CORE_CONTRACT_ADDRESS="${CORE_CONTRACT}"`);
    console.log(`NEXT_PUBLIC_BINARY_MARKET_ADDRESS="${binaryMarket}"`);
    console.log(`NEXT_PUBLIC_CONDITIONAL_MARKET_ADDRESS="${conditionalMarket}"`);
    console.log(`NEXT_PUBLIC_SUBJECTIVE_MARKET_ADDRESS="${subjectiveMarket}"`);
    console.log(`NEXT_PUBLIC_AI_ORACLE_ADDRESS="${aiOracle}"`);
    console.log(`NEXT_PUBLIC_INSURANCE_POOL_ADDRESS="${insurancePool}"`);
    console.log(`NEXT_PUBLIC_REPUTATION_STAKING_ADDRESS="${reputationStaking}"`);
    console.log(`NEXT_PUBLIC_OMNI_ROUTER_ADDRESS="${crossChainRouter}"`);
    console.log(`NEXT_PUBLIC_DAO_GOVERNANCE_ADDRESS="${daoGovernance}"`);
    console.log("```");
    console.log("");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("CORE_CONTRACT_ADDRESS")) {
      console.error("");
      console.error("💡 Asegúrate de configurar CORE_CONTRACT_ADDRESS en .env o .env.local");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

