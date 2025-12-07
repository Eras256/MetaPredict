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

  console.log("=".repeat(80));
  console.log("✅ Proceso completado");
  console.log("\n💡 Ejecuta 'pnpm hardhat run scripts/verify-contract-config.ts --network opBNBTestnet' para verificar");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

