// @ts-expect-error - hardhat exports ethers but TypeScript types may not reflect it
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const CONTRACTS = {
  PREDICTION_MARKET_CORE: "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1",
  AI_ORACLE: "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c",
  INSURANCE_POOL: "0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA",
  REPUTATION_STAKING: "0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7",
  DAO_GOVERNANCE: "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123",
  DATA_STREAMS_INTEGRATION: "0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3",
};

// Direcciones del frontend desde addresses.ts
const FRONTEND_ADDRESSES = {
  PREDICTION_MARKET: "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1",
  CORE_CONTRACT: "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1",
  AI_ORACLE: "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c",
  INSURANCE_POOL: "0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA",
  REPUTATION_STAKING: "0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7",
  DAO_GOVERNANCE: "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123",
  DATA_STREAMS_INTEGRATION: "0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3",
};

async function main() {
  console.log("🔍 Verificando Integración Frontend - Smart Contracts\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Verificando desde: ${deployer.address}\n`);

  const results: Array<{ contract: string; frontend: string; onchain: string; match: boolean; details?: string }> = [];

  // 1. Verificar Core Contract
  console.log("1️⃣  Verificando Core Contract (PredictionMarketCore)\n");
  console.log("-".repeat(80));
  try {
    const core = await ethers.getContractAt("PredictionMarketCore", CONTRACTS.PREDICTION_MARKET_CORE);
    const code = await ethers.provider.getCode(CONTRACTS.PREDICTION_MARKET_CORE);
    const isDeployed = code !== "0x";
    
    const match = CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase() === FRONTEND_ADDRESSES.CORE_CONTRACT.toLowerCase();
    results.push({
      contract: "CORE_CONTRACT",
      frontend: FRONTEND_ADDRESSES.CORE_CONTRACT,
      onchain: CONTRACTS.PREDICTION_MARKET_CORE,
      match,
      details: isDeployed ? "✅ Desplegado y verificado" : "❌ No desplegado"
    });

    console.log(`   Frontend: ${FRONTEND_ADDRESSES.CORE_CONTRACT}`);
    console.log(`   On-chain: ${CONTRACTS.PREDICTION_MARKET_CORE}`);
    console.log(`   Match: ${match ? "✅" : "❌"}`);
    console.log(`   Status: ${isDeployed ? "✅ Desplegado" : "❌ No encontrado"}\n`);
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // 2. Verificar AI Oracle
  console.log("2️⃣  Verificando AI Oracle\n");
  console.log("-".repeat(80));
  try {
    const aiOracle = await ethers.getContractAt("AIOracle", CONTRACTS.AI_ORACLE);
    const predictionMarket = await aiOracle.predictionMarket();
    const backendUrl = await aiOracle.backendUrl();
    
    const match = CONTRACTS.AI_ORACLE.toLowerCase() === FRONTEND_ADDRESSES.AI_ORACLE.toLowerCase();
    const coreMatch = predictionMarket.toLowerCase() === CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase();
    
    results.push({
      contract: "AI_ORACLE",
      frontend: FRONTEND_ADDRESSES.AI_ORACLE,
      onchain: CONTRACTS.AI_ORACLE,
      match,
      details: `Core: ${coreMatch ? "✅" : "❌"}, Backend: ${backendUrl}`
    });

    console.log(`   Frontend: ${FRONTEND_ADDRESSES.AI_ORACLE}`);
    console.log(`   On-chain: ${CONTRACTS.AI_ORACLE}`);
    console.log(`   Match: ${match ? "✅" : "❌"}`);
    console.log(`   Core Contract: ${predictionMarket}`);
    console.log(`   Core Match: ${coreMatch ? "✅" : "❌"}`);
    console.log(`   Backend URL: ${backendUrl}\n`);
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // 3. Verificar Insurance Pool
  console.log("3️⃣  Verificando Insurance Pool\n");
  console.log("-".repeat(80));
  try {
    const insurancePool = await ethers.getContractAt("InsurancePool", CONTRACTS.INSURANCE_POOL);
    const coreContract = await insurancePool.coreContract();
    
    const match = CONTRACTS.INSURANCE_POOL.toLowerCase() === FRONTEND_ADDRESSES.INSURANCE_POOL.toLowerCase();
    const coreMatch = coreContract.toLowerCase() === CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase();
    
    results.push({
      contract: "INSURANCE_POOL",
      frontend: FRONTEND_ADDRESSES.INSURANCE_POOL,
      onchain: CONTRACTS.INSURANCE_POOL,
      match,
      details: `Core: ${coreMatch ? "✅" : "❌"}`
    });

    console.log(`   Frontend: ${FRONTEND_ADDRESSES.INSURANCE_POOL}`);
    console.log(`   On-chain: ${CONTRACTS.INSURANCE_POOL}`);
    console.log(`   Match: ${match ? "✅" : "❌"}`);
    console.log(`   Core Contract: ${coreContract}`);
    console.log(`   Core Match: ${coreMatch ? "✅" : "❌"}\n`);
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // 4. Verificar Reputation Staking
  console.log("4️⃣  Verificando Reputation Staking\n");
  console.log("-".repeat(80));
  try {
    const reputationStaking = await ethers.getContractAt("ReputationStaking", CONTRACTS.REPUTATION_STAKING);
    const coreContract = await reputationStaking.coreContract();
    
    const match = CONTRACTS.REPUTATION_STAKING.toLowerCase() === FRONTEND_ADDRESSES.REPUTATION_STAKING.toLowerCase();
    const coreMatch = coreContract.toLowerCase() === CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase();
    
    results.push({
      contract: "REPUTATION_STAKING",
      frontend: FRONTEND_ADDRESSES.REPUTATION_STAKING,
      onchain: CONTRACTS.REPUTATION_STAKING,
      match,
      details: `Core: ${coreMatch ? "✅" : "❌"}`
    });

    console.log(`   Frontend: ${FRONTEND_ADDRESSES.REPUTATION_STAKING}`);
    console.log(`   On-chain: ${CONTRACTS.REPUTATION_STAKING}`);
    console.log(`   Match: ${match ? "✅" : "❌"}`);
    console.log(`   Core Contract: ${coreContract}`);
    console.log(`   Core Match: ${coreMatch ? "✅" : "❌"}\n`);
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // 5. Verificar DAO Governance
  console.log("5️⃣  Verificando DAO Governance\n");
  console.log("-".repeat(80));
  try {
    const daoGovernance = await ethers.getContractAt("DAOGovernance", CONTRACTS.DAO_GOVERNANCE);
    const coreContract = await daoGovernance.coreContract();
    
    const match = CONTRACTS.DAO_GOVERNANCE.toLowerCase() === FRONTEND_ADDRESSES.DAO_GOVERNANCE.toLowerCase();
    const coreMatch = coreContract.toLowerCase() === CONTRACTS.PREDICTION_MARKET_CORE.toLowerCase();
    
    results.push({
      contract: "DAO_GOVERNANCE",
      frontend: FRONTEND_ADDRESSES.DAO_GOVERNANCE,
      onchain: CONTRACTS.DAO_GOVERNANCE,
      match,
      details: `Core: ${coreMatch ? "✅" : "❌"}`
    });

    console.log(`   Frontend: ${FRONTEND_ADDRESSES.DAO_GOVERNANCE}`);
    console.log(`   On-chain: ${CONTRACTS.DAO_GOVERNANCE}`);
    console.log(`   Match: ${match ? "✅" : "❌"}`);
    console.log(`   Core Contract: ${coreContract}`);
    console.log(`   Core Match: ${coreMatch ? "✅" : "❌"}\n`);
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // 6. Verificar Data Streams Integration
  console.log("6️⃣  Verificando Chainlink Data Streams Integration\n");
  console.log("-".repeat(80));
  try {
    const dataStreams = await ethers.getContractAt("ChainlinkDataStreamsIntegration", CONTRACTS.DATA_STREAMS_INTEGRATION);
    const verifierProxy = await dataStreams.verifierProxy();
    
    const match = CONTRACTS.DATA_STREAMS_INTEGRATION.toLowerCase() === FRONTEND_ADDRESSES.DATA_STREAMS_INTEGRATION.toLowerCase();
    
    results.push({
      contract: "DATA_STREAMS_INTEGRATION",
      frontend: FRONTEND_ADDRESSES.DATA_STREAMS_INTEGRATION,
      onchain: CONTRACTS.DATA_STREAMS_INTEGRATION,
      match,
      details: `Verifier: ${verifierProxy}`
    });

    console.log(`   Frontend: ${FRONTEND_ADDRESSES.DATA_STREAMS_INTEGRATION}`);
    console.log(`   On-chain: ${CONTRACTS.DATA_STREAMS_INTEGRATION}`);
    console.log(`   Match: ${match ? "✅" : "❌"}`);
    console.log(`   Verifier Proxy: ${verifierProxy}\n`);
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Resumen
  console.log("=".repeat(80));
  console.log("📊 Resumen de Verificación\n");
  console.log("=".repeat(80));

  const allMatch = results.every(r => r.match);
  const totalContracts = results.length;
  const matchedContracts = results.filter(r => r.match).length;

  console.log(`✅ Contratos verificados: ${totalContracts}`);
  console.log(`✅ Direcciones coinciden: ${matchedContracts}/${totalContracts}`);
  console.log(`✅ Estado general: ${allMatch ? "✅ TODO CORRECTO" : "⚠️  REVISAR"}\n`);

  console.log("Detalles por contrato:\n");
  results.forEach(r => {
    const status = r.match ? "✅" : "❌";
    console.log(`${status} ${r.contract.padEnd(25)} ${r.match ? "MATCH" : "MISMATCH"}`);
    if (r.details) {
      console.log(`   ${r.details}`);
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log(allMatch ? "✅ Integración Frontend-Smart Contracts: CORRECTA" : "⚠️  Integración Frontend-Smart Contracts: REQUIERE REVISIÓN");
  console.log("=".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

