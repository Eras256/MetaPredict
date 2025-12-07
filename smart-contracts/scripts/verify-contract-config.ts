// @ts-expect-error - hardhat exports ethers but TypeScript types may not reflect it
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Direcciones actuales desde frontend/lib/contracts/addresses.ts
const CONTRACTS = {
  PREDICTION_MARKET_CORE: "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1",
  AI_ORACLE: "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c",
  INSURANCE_POOL: "0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA",
  REPUTATION_STAKING: "0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7",
  DAO_GOVERNANCE: "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123",
  BINARY_MARKET: "0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d",
  CONDITIONAL_MARKET: "0x41C2b1FB595Ad18cb111c3a3Fc1B2d6307e43741",
  SUBJECTIVE_MARKET: "0xAE88cE8f797FCBD36b0Ae78f80FDb11774d766f8",
};

async function main() {
  console.log("🔍 Verificando configuración de contratos desplegados\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Wallet: ${deployer.address}\n`);

  // Verificar Binary Market
  console.log("1️⃣  Verificando Binary Market");
  console.log("-".repeat(80));
  const binaryMarket = await ethers.getContractAt(
    "BinaryMarket",
    CONTRACTS.BINARY_MARKET
  );
  const binaryCore = await binaryMarket.coreContract();
  console.log(`   Core configurado: ${binaryCore}`);
  console.log(`   Core esperado:    ${CONTRACTS.PREDICTION_MARKET_CORE}`);
  if (binaryCore.toLowerCase() === CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase()) {
    console.log("   ✅ Configuración correcta\n");
  } else {
    console.log("   ❌ Configuración incorrecta - necesita actualización\n");
  }

  // Verificar Conditional Market
  console.log("2️⃣  Verificando Conditional Market");
  console.log("-".repeat(80));
  const conditionalMarket = await ethers.getContractAt(
    "ConditionalMarket",
    CONTRACTS.CONDITIONAL_MARKET
  );
  const conditionalCore = await conditionalMarket.coreContract();
  console.log(`   Core configurado: ${conditionalCore}`);
  console.log(`   Core esperado:    ${CONTRACTS.PREDICTION_MARKET_CORE}`);
  if (conditionalCore.toLowerCase() === CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase()) {
    console.log("   ✅ Configuración correcta\n");
  } else {
    console.log("   ❌ Configuración incorrecta - necesita actualización\n");
  }

  // Verificar Subjective Market
  console.log("3️⃣  Verificando Subjective Market");
  console.log("-".repeat(80));
  const subjectiveMarket = await ethers.getContractAt(
    "SubjectiveMarket",
    CONTRACTS.SUBJECTIVE_MARKET
  );
  const subjectiveCore = await subjectiveMarket.coreContract();
  console.log(`   Core configurado: ${subjectiveCore}`);
  console.log(`   Core esperado:    ${CONTRACTS.PREDICTION_MARKET_CORE}`);
  if (subjectiveCore.toLowerCase() === CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase()) {
    console.log("   ✅ Configuración correcta\n");
  } else {
    console.log("   ❌ Configuración incorrecta - necesita actualización\n");
  }

  // Verificar Reputation Staking
  console.log("4️⃣  Verificando Reputation Staking");
  console.log("-".repeat(80));
  const reputationStaking = await ethers.getContractAt(
    "ReputationStaking",
    CONTRACTS.REPUTATION_STAKING
  );
  const repCore = await reputationStaking.coreContract();
  console.log(`   Core configurado: ${repCore}`);
  console.log(`   Core esperado:    ${CONTRACTS.PREDICTION_MARKET_CORE}`);
  if (repCore.toLowerCase() === CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase()) {
    console.log("   ✅ Configuración correcta\n");
  } else {
    console.log("   ❌ Configuración incorrecta - necesita actualización\n");
  }

  // Verificar Insurance Pool
  console.log("5️⃣  Verificando Insurance Pool");
  console.log("-".repeat(80));
  const insurancePool = await ethers.getContractAt(
    "InsurancePool",
    CONTRACTS.INSURANCE_POOL
  );
  const insuranceCore = await insurancePool.coreContract();
  console.log(`   Core configurado: ${insuranceCore}`);
  console.log(`   Core esperado:    ${CONTRACTS.PREDICTION_MARKET_CORE}`);
  if (insuranceCore.toLowerCase() === CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase()) {
    console.log("   ✅ Configuración correcta\n");
  } else {
    console.log("   ❌ Configuración incorrecta - necesita actualización\n");
  }

  // Verificar AI Oracle
  console.log("6️⃣  Verificando AI Oracle");
  console.log("-".repeat(80));
  const aiOracle = await ethers.getContractAt(
    "AIOracle",
    CONTRACTS.AI_ORACLE
  );
  const oracleCore = await aiOracle.predictionMarket();
  console.log(`   Core configurado: ${oracleCore}`);
  console.log(`   Core esperado:    ${CONTRACTS.PREDICTION_MARKET_CORE}`);
  if (oracleCore.toLowerCase() === CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase()) {
    console.log("   ✅ Configuración correcta\n");
  } else {
    console.log("   ❌ Configuración incorrecta - necesita actualización\n");
  }

  // Verificar DAO Governance
  console.log("7️⃣  Verificando DAO Governance");
  console.log("-".repeat(80));
  const daoGovernance = await ethers.getContractAt(
    "DAOGovernance",
    CONTRACTS.DAO_GOVERNANCE
  );
  const daoCore = await daoGovernance.coreContract();
  console.log(`   Core configurado: ${daoCore}`);
  console.log(`   Core esperado:    ${CONTRACTS.PREDICTION_MARKET_CORE}`);
  if (daoCore.toLowerCase() === CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase()) {
    console.log("   ✅ Configuración correcta\n");
  } else {
    console.log("   ❌ Configuración incorrecta - necesita actualización\n");
  }

  console.log("=".repeat(80));
  console.log("✅ Verificación completada");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

