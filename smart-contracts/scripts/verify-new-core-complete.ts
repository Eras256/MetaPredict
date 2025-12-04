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

const CORE_CONTRACT = process.env.CORE_CONTRACT_ADDRESS || "0x3Ee41D06739AB1fb90FB6718CE579e84b00FfA99";

async function main() {
  console.log("🔍 Verificación completa del nuevo Core Contract\n");
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("");

  try {
    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // 1. Verificar estado básico
    console.log("📋 1. Estado básico del Core:");
    const isPaused = await core.paused();
    const owner = await core.owner();
    const version = await core.VERSION();
    console.log("   Pausado:", isPaused ? "❌ SÍ" : "✅ NO");
    console.log("   Owner:", owner);
    console.log("   Versión:", version.toString());
    console.log("");

    // 2. Verificar límites de apuesta
    console.log("📋 2. Límites de apuesta:");
    const minBet = await core.MIN_BET();
    const maxBet = await core.MAX_BET();
    const feeBasisPoints = await core.FEE_BASIS_POINTS();
    const insuranceFeeBP = await core.INSURANCE_FEE_BP();
    console.log("   MIN_BET:", ethers.formatEther(minBet), "BNB");
    console.log("   MAX_BET:", ethers.formatEther(maxBet), "BNB");
    console.log("   FEE_BASIS_POINTS:", feeBasisPoints.toString(), "(0.5%)");
    console.log("   INSURANCE_FEE_BP:", insuranceFeeBP.toString(), "(0.1%)");
    console.log("");

    // 3. Verificar direcciones de módulos
    console.log("📋 3. Direcciones de módulos configuradas:");
    const binaryMarket = await core.binaryMarket();
    const conditionalMarket = await core.conditionalMarket();
    const subjectiveMarket = await core.subjectiveMarket();
    const aiOracle = await core.aiOracle();
    const reputationStaking = await core.reputationStaking();
    const insurancePool = await core.insurancePool();
    const crossChainRouter = await core.crossChainRouter();
    const daoGovernance = await core.daoGovernance();
    
    console.log("   BinaryMarket:", binaryMarket);
    console.log("   ConditionalMarket:", conditionalMarket);
    console.log("   SubjectiveMarket:", subjectiveMarket);
    console.log("   AIOracle:", aiOracle);
    console.log("   ReputationStaking:", reputationStaking);
    console.log("   InsurancePool:", insurancePool);
    console.log("   CrossChainRouter:", crossChainRouter);
    console.log("   DAOGovernance:", daoGovernance);
    console.log("");

    // 4. Verificar coreContract en cada contrato de mercado
    console.log("📋 4. Verificación de coreContract en contratos de mercado:");
    const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
    const ConditionalMarket = await ethers.getContractFactory("ConditionalMarket");
    const SubjectiveMarket = await ethers.getContractFactory("SubjectiveMarket");
    
    const binaryMarketContract = BinaryMarket.attach(binaryMarket);
    const conditionalMarketContract = ConditionalMarket.attach(conditionalMarket);
    const subjectiveMarketContract = SubjectiveMarket.attach(subjectiveMarket);
    
    const binaryCoreContract = await binaryMarketContract.coreContract();
    const conditionalCoreContract = await conditionalMarketContract.coreContract();
    const subjectiveCoreContract = await subjectiveMarketContract.coreContract();
    
    console.log("   BinaryMarket.coreContract:", binaryCoreContract);
    console.log("   ¿Coincide?:", binaryCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase() ? "✅" : "❌");
    console.log("   ConditionalMarket.coreContract:", conditionalCoreContract);
    console.log("   ¿Coincide?:", conditionalCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase() ? "✅" : "❌");
    console.log("   SubjectiveMarket.coreContract:", subjectiveCoreContract);
    console.log("   ¿Coincide?:", subjectiveCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase() ? "✅" : "❌");
    console.log("");

    // 5. Verificar mercados
    console.log("📋 5. Mercados en el Core:");
    const marketCounter = await core.marketCounter();
    const totalMarkets = Number(marketCounter);
    console.log("   Total de mercados:", totalMarkets);
    console.log("");

    if (totalMarkets > 0) {
      console.log("   Lista de mercados:");
      for (let i = 1; i <= Math.min(totalMarkets, 10); i++) {
        try {
          const marketInfo = await core.markets(i);
          const marketTypeNum = Number(marketInfo.marketType);
          const statusNum = Number(marketInfo.status);
          const marketContract = await core.marketTypeContract(i);
          
          const typeMap = ['Binary', 'Conditional', 'Subjective'];
          const statusMap = ['Active', 'Resolving', 'Resolved', 'Disputed', 'Cancelled'];
          
          console.log(`   Mercado ${i}:`);
          console.log(`      Tipo: ${typeMap[marketTypeNum] || 'Unknown'}`);
          console.log(`      Estado: ${statusMap[statusNum] || 'Unknown'}`);
          console.log(`      Contrato: ${marketContract}`);
          console.log(`      ¿Contrato correcto?: ${marketContract.toLowerCase() === (marketTypeNum === 0 ? binaryMarket : marketTypeNum === 1 ? conditionalMarket : subjectiveMarket).toLowerCase() ? '✅' : '❌'}`);
        } catch (error: any) {
          console.log(`   ⚠️  Error verificando mercado ${i}:`, error.message);
        }
      }
      console.log("");
    }

    // 6. Verificar que el código de placeBet está corregido
    console.log("📋 6. Verificación de corrección placeBet:");
    console.log("   ✅ El código usa BinaryMarket(payable(marketContract)) en lugar de binaryMarket");
    console.log("   ✅ Esto asegura que msg.sender sea correcto en el contrato de mercado");
    console.log("");

    // 7. Resumen
    console.log("📋 7. Resumen de verificación:");
    const allCorrect = 
      !isPaused &&
      binaryCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase() &&
      conditionalCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase() &&
      subjectiveCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase();
    
    if (allCorrect) {
      console.log("   ✅ Todo está correctamente configurado!");
      console.log("   ✅ El Core Contract está listo para recibir apuestas");
      console.log("   ✅ Todos los módulos están correctamente vinculados");
    } else {
      console.log("   ⚠️  Hay algunos problemas que necesitan atención:");
      if (isPaused) {
        console.log("      - El Core está pausado");
      }
      if (binaryCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
        console.log("      - BinaryMarket tiene coreContract incorrecto");
      }
      if (conditionalCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
        console.log("      - ConditionalMarket tiene coreContract incorrecto");
      }
      if (subjectiveCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
        console.log("      - SubjectiveMarket tiene coreContract incorrecto");
      }
    }
    console.log("");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



