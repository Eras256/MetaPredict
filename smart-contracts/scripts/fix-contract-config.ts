// @ts-expect-error - hardhat exports ethers but TypeScript types may not reflect it
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Direcciones actuales desde frontend/lib/contracts/addresses.ts y README.md
// Última actualización: Enero 4, 2025
// Fuente: README.md sección "Deployed Contracts (opBNB Testnet)"
const CONTRACTS = {
  PREDICTION_MARKET_CORE: "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1",
  AI_ORACLE: "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c",
  INSURANCE_POOL: "0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA",
  REPUTATION_STAKING: "0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7",
  DAO_GOVERNANCE: "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123",
  BINARY_MARKET: "0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d",
  CONDITIONAL_MARKET: "0x41C2b1FB595Ad18cb111c3a3Fc1B2d6307e43741",
  SUBJECTIVE_MARKET: "0xAE88cE8f797FCBD36b0Ae78f80FDb11774d766f8",
  OMNI_ROUTER: "0x11C1124384e463d99Ba84348280e318FbeE544d0",
};

async function main() {
  console.log("🔧 Actualizando configuración de contratos\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Wallet: ${deployer.address}`);
  console.log(`📝 Core Contract: ${CONTRACTS.PREDICTION_MARKET_CORE}\n`);

  // Actualizar Reputation Staking
  console.log("1️⃣  Actualizando Reputation Staking");
  console.log("-".repeat(80));
  try {
    const reputationStaking = await ethers.getContractAt(
      "ReputationStaking",
      CONTRACTS.REPUTATION_STAKING
    );
    const currentCore = await reputationStaking.coreContract();
    console.log(`   Core actual: ${currentCore}`);
    
    if (currentCore.toLowerCase() !== CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase()) {
      console.log(`   Actualizando a: ${CONTRACTS.PREDICTION_MARKET_CORE}`);
      const tx = await reputationStaking.setCoreContract(CONTRACTS.PREDICTION_MARKET_CORE);
      const receipt = await tx.wait();
      console.log(`   ✅ Actualizado`);
      console.log(`   Transaction: ${receipt.hash}`);
      console.log(`   Explorer: https://testnet.opbnbscan.com/tx/${receipt.hash}\n`);
    } else {
      console.log(`   ✅ Ya está configurado correctamente\n`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Actualizar Insurance Pool
  console.log("2️⃣  Actualizando Insurance Pool");
  console.log("-".repeat(80));
  try {
    const insurancePool = await ethers.getContractAt(
      "InsurancePool",
      CONTRACTS.INSURANCE_POOL
    );
    const currentCore = await insurancePool.coreContract();
    console.log(`   Core actual: ${currentCore}`);
    
    if (currentCore.toLowerCase() !== CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase()) {
      console.log(`   Actualizando a: ${CONTRACTS.PREDICTION_MARKET_CORE}`);
      const tx = await insurancePool.setCoreContract(CONTRACTS.PREDICTION_MARKET_CORE);
      const receipt = await tx.wait();
      console.log(`   ✅ Actualizado`);
      console.log(`   Transaction: ${receipt.hash}`);
      console.log(`   Explorer: https://testnet.opbnbscan.com/tx/${receipt.hash}\n`);
    } else {
      console.log(`   ✅ Ya está configurado correctamente\n`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Actualizar AI Oracle
  console.log("3️⃣  Actualizando AI Oracle");
  console.log("-".repeat(80));
  try {
    const aiOracle = await ethers.getContractAt(
      "AIOracle",
      CONTRACTS.AI_ORACLE
    );
    const currentCore = await aiOracle.predictionMarket();
    console.log(`   Core actual: ${currentCore}`);
    
    if (currentCore.toLowerCase() !== CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase()) {
      console.log(`   Actualizando a: ${CONTRACTS.PREDICTION_MARKET_CORE}`);
      const tx = await aiOracle.setPredictionMarket(CONTRACTS.PREDICTION_MARKET_CORE);
      const receipt = await tx.wait();
      console.log(`   ✅ Actualizado`);
      console.log(`   Transaction: ${receipt.hash}`);
      console.log(`   Explorer: https://testnet.opbnbscan.com/tx/${receipt.hash}\n`);
    } else {
      console.log(`   ✅ Ya está configurado correctamente\n`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Actualizar DAO Governance
  console.log("4️⃣  Actualizando DAO Governance");
  console.log("-".repeat(80));
  try {
    const daoGovernance = await ethers.getContractAt(
      "DAOGovernance",
      CONTRACTS.DAO_GOVERNANCE
    );
    const currentCore = await daoGovernance.coreContract();
    console.log(`   Core actual: ${currentCore}`);
    
    if (currentCore.toLowerCase() !== CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase()) {
      console.log(`   Actualizando a: ${CONTRACTS.PREDICTION_MARKET_CORE}`);
      const tx = await daoGovernance.setCoreContract(CONTRACTS.PREDICTION_MARKET_CORE);
      const receipt = await tx.wait();
      console.log(`   ✅ Actualizado`);
      console.log(`   Transaction: ${receipt.hash}`);
      console.log(`   Explorer: https://testnet.opbnbscan.com/tx/${receipt.hash}\n`);
    } else {
      console.log(`   ✅ Ya está configurado correctamente\n`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Verificar contratos de mercado (BinaryMarket, ConditionalMarket, SubjectiveMarket)
  // NOTA: Estos contratos tienen coreContract como immutable, por lo que no se pueden actualizar
  // Si el coreContract está mal configurado, los contratos deben ser redesplegados
  console.log("5️⃣  Verificando Market Contracts (BinaryMarket, ConditionalMarket, SubjectiveMarket)");
  console.log("-".repeat(80));
  console.log("   ⚠️  NOTA: Estos contratos tienen coreContract como immutable.");
  console.log("   Si el coreContract está mal configurado, los contratos deben ser redesplegados.\n");
  
  // Verificar BinaryMarket usando la dirección del README
  try {
    const binaryMarket = await ethers.getContractAt("BinaryMarket", CONTRACTS.BINARY_MARKET);
    const binaryCore = await binaryMarket.coreContract();
    console.log(`   BinaryMarket: ${CONTRACTS.BINARY_MARKET}`);
    console.log(`   Core configurado: ${binaryCore}`);
    if (binaryCore.toLowerCase() === CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase()) {
      console.log(`   ✅ Configurado correctamente\n`);
    } else {
      console.log(`   ❌ ERROR: coreContract incorrecto.`);
      console.log(`   Esperado: ${CONTRACTS.PREDICTION_MARKET_CORE}`);
      console.log(`   Actual: ${binaryCore}`);
      console.log(`   El contrato debe ser redesplegado con la dirección correcta del Core.\n`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  No se pudo verificar BinaryMarket: ${error.message}\n`);
  }
  
  // Verificar ConditionalMarket usando la dirección del README
  try {
    const conditionalMarket = await ethers.getContractAt("ConditionalMarket", CONTRACTS.CONDITIONAL_MARKET);
    const conditionalCore = await conditionalMarket.coreContract();
    console.log(`   ConditionalMarket: ${CONTRACTS.CONDITIONAL_MARKET}`);
    console.log(`   Core configurado: ${conditionalCore}`);
    if (conditionalCore.toLowerCase() === CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase()) {
      console.log(`   ✅ Configurado correctamente\n`);
    } else {
      console.log(`   ❌ ERROR: coreContract incorrecto.`);
      console.log(`   Esperado: ${CONTRACTS.PREDICTION_MARKET_CORE}`);
      console.log(`   Actual: ${conditionalCore}`);
      console.log(`   El contrato debe ser redesplegado con la dirección correcta del Core.\n`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  No se pudo verificar ConditionalMarket: ${error.message}\n`);
  }
  
  // Verificar SubjectiveMarket usando la dirección del README
  try {
    const subjectiveMarket = await ethers.getContractAt("SubjectiveMarket", CONTRACTS.SUBJECTIVE_MARKET);
    const subjectiveCore = await subjectiveMarket.coreContract();
    console.log(`   SubjectiveMarket: ${CONTRACTS.SUBJECTIVE_MARKET}`);
    console.log(`   Core configurado: ${subjectiveCore}`);
    if (subjectiveCore.toLowerCase() === CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase()) {
      console.log(`   ✅ Configurado correctamente\n`);
    } else {
      console.log(`   ❌ ERROR: coreContract incorrecto.`);
      console.log(`   Esperado: ${CONTRACTS.PREDICTION_MARKET_CORE}`);
      console.log(`   Actual: ${subjectiveCore}`);
      console.log(`   El contrato debe ser redesplegado con la dirección correcta del Core.\n`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  No se pudo verificar SubjectiveMarket: ${error.message}\n`);
  }
  
  // Verificar que el Core contract tiene las direcciones correctas de los market contracts
  console.log("6️⃣  Verificando configuración del Core Contract");
  console.log("-".repeat(80));
  try {
    const core = await ethers.getContractAt(
      "PredictionMarketCore",
      CONTRACTS.PREDICTION_MARKET_CORE
    );
    
    const coreBinaryMarket = await core.binaryMarket();
    const coreConditionalMarket = await core.conditionalMarket();
    const coreSubjectiveMarket = await core.subjectiveMarket();
    
    console.log(`   Core BinaryMarket: ${coreBinaryMarket}`);
    console.log(`   Esperado: ${CONTRACTS.BINARY_MARKET}`);
    if (coreBinaryMarket.toLowerCase() === CONTRACTS.BINARY_MARKET.toLowerCase()) {
      console.log(`   ✅ Correcto\n`);
    } else {
      console.log(`   ❌ ERROR: El Core tiene una dirección diferente de BinaryMarket\n`);
    }
    
    console.log(`   Core ConditionalMarket: ${coreConditionalMarket}`);
    console.log(`   Esperado: ${CONTRACTS.CONDITIONAL_MARKET}`);
    if (coreConditionalMarket.toLowerCase() === CONTRACTS.CONDITIONAL_MARKET.toLowerCase()) {
      console.log(`   ✅ Correcto\n`);
    } else {
      console.log(`   ❌ ERROR: El Core tiene una dirección diferente de ConditionalMarket\n`);
    }
    
    console.log(`   Core SubjectiveMarket: ${coreSubjectiveMarket}`);
    console.log(`   Esperado: ${CONTRACTS.SUBJECTIVE_MARKET}`);
    if (coreSubjectiveMarket.toLowerCase() === CONTRACTS.SUBJECTIVE_MARKET.toLowerCase()) {
      console.log(`   ✅ Correcto\n`);
    } else {
      console.log(`   ❌ ERROR: El Core tiene una dirección diferente de SubjectiveMarket\n`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  No se pudo verificar Core contract: ${error.message}\n`);
  }

  console.log("=".repeat(80));
  console.log("✅ Proceso completado");
  console.log("\n💡 Ejecuta 'npx hardhat run scripts/verify-contract-config.ts --network opBNBTestnet' para verificar");
  console.log("\n⚠️  IMPORTANTE: Si algún Market Contract tiene coreContract incorrecto,");
  console.log("   ese contrato debe ser redesplegado con la dirección correcta del Core.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

