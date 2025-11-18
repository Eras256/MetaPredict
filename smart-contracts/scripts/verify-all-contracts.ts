import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load .env from root directory
const envPath = path.resolve(__dirname, '../../.env');
const envLocalPath = path.resolve(__dirname, '../../.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

// @ts-ignore - Hardhat types may not be fully updated
import { ethers } from "hardhat";

/**
 * Script para verificar la configuración de TODOS los contratos
 * 
 * Verifica que todos los contratos tengan configurado correctamente el coreContract
 * y que no haya problemas similares al "Only core" error
 */

const CORE_ADDRESS = "0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC";

// Direcciones de los contratos desplegados
const CONTRACTS = {
  BINARY_MARKET: "0x44bF3De950526d5BDbfaA284F6430c72Ea99163B", // Corregido con nuevo Core
  CONDITIONAL_MARKET: "0x45E223eAB99761A7E60eF7690420C178FEBD23df",
  SUBJECTIVE_MARKET: "0xaBb50827b49E7c725B6A8B735348D3A2a34E70cE",
  INSURANCE_POOL: "0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA",
  REPUTATION_STAKING: "0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7",
  DAO_GOVERNANCE: "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123",
  OMNI_ROUTER: "0x11C1124384e463d99Ba84348280e318FbeE544d0",
  AI_ORACLE: "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c",
};

interface ContractCheck {
  name: string;
  address: string;
  hasCoreContract: boolean;
  coreContractValue?: string;
  isCorrect: boolean;
  isImmutable: boolean;
  canFix: boolean;
  error?: string;
}

async function checkContract(
  name: string,
  address: string,
  factory: any,
  isImmutable: boolean
): Promise<ContractCheck> {
  try {
    const contract = factory.attach(address);
    
    // Intentar leer coreContract
    let coreContractValue: string | undefined;
    let hasCoreContract = false;
    
    try {
      coreContractValue = await contract.coreContract();
      hasCoreContract = true;
    } catch (error: any) {
      // Algunos contratos pueden tener el campo con otro nombre
      try {
        coreContractValue = await contract.predictionMarket();
        hasCoreContract = true;
      } catch (e) {
        // No tiene coreContract
      }
    }
    
    const isCorrect = coreContractValue?.toLowerCase() === CORE_ADDRESS.toLowerCase();
    
    return {
      name,
      address,
      hasCoreContract,
      coreContractValue,
      isCorrect,
      isImmutable,
      canFix: !isImmutable && !isCorrect,
    };
  } catch (error: any) {
    return {
      name,
      address,
      hasCoreContract: false,
      isCorrect: false,
      isImmutable,
      canFix: false,
      error: error.message,
    };
  }
}

async function main() {
  console.log("🔍 Verificando configuración de TODOS los contratos...\n");
  console.log("📝 Core address:", CORE_ADDRESS, "\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address, "\n");

  const results: ContractCheck[] = [];

  // 1. Verificar BinaryMarket (ya corregido, pero verificamos)
  console.log("1️⃣ Verificando BinaryMarket...");
  const BinaryMarketFactory = await ethers.getContractFactory("BinaryMarket");
  const binaryCheck = await checkContract(
    "BinaryMarket",
    CONTRACTS.BINARY_MARKET,
    BinaryMarketFactory,
    true // immutable
  );
  results.push(binaryCheck);
  console.log(`   ${binaryCheck.isCorrect ? '✅' : '❌'} coreContract: ${binaryCheck.coreContractValue || 'N/A'}`);
  if (!binaryCheck.isCorrect) {
    console.log(`   ⚠️  INCORRECTO - Necesita redesplegar (immutable)`);
  }
  console.log("");

  // 2. Verificar ConditionalMarket
  console.log("2️⃣ Verificando ConditionalMarket...");
  const ConditionalMarketFactory = await ethers.getContractFactory("ConditionalMarket");
  const conditionalCheck = await checkContract(
    "ConditionalMarket",
    CONTRACTS.CONDITIONAL_MARKET,
    ConditionalMarketFactory,
    true // immutable
  );
  results.push(conditionalCheck);
  console.log(`   ${conditionalCheck.isCorrect ? '✅' : '❌'} coreContract: ${conditionalCheck.coreContractValue || 'N/A'}`);
  if (!conditionalCheck.isCorrect) {
    console.log(`   ⚠️  INCORRECTO - Necesita redesplegar (immutable)`);
  }
  console.log("");

  // 3. Verificar SubjectiveMarket
  console.log("3️⃣ Verificando SubjectiveMarket...");
  const SubjectiveMarketFactory = await ethers.getContractFactory("SubjectiveMarket");
  const subjectiveCheck = await checkContract(
    "SubjectiveMarket",
    CONTRACTS.SUBJECTIVE_MARKET,
    SubjectiveMarketFactory,
    true // immutable
  );
  results.push(subjectiveCheck);
  console.log(`   ${subjectiveCheck.isCorrect ? '✅' : '❌'} coreContract: ${subjectiveCheck.coreContractValue || 'N/A'}`);
  if (!subjectiveCheck.isCorrect) {
    console.log(`   ⚠️  INCORRECTO - Necesita redesplegar (immutable)`);
  }
  console.log("");

  // 4. Verificar InsurancePool (tiene setCoreContract)
  console.log("4️⃣ Verificando InsurancePool...");
  const InsurancePoolFactory = await ethers.getContractFactory("InsurancePool");
  const insuranceCheck = await checkContract(
    "InsurancePool",
    CONTRACTS.INSURANCE_POOL,
    InsurancePoolFactory,
    false // tiene setCoreContract
  );
  results.push(insuranceCheck);
  console.log(`   ${insuranceCheck.isCorrect ? '✅' : '❌'} coreContract: ${insuranceCheck.coreContractValue || 'N/A'}`);
  if (!insuranceCheck.isCorrect && insuranceCheck.canFix) {
    console.log(`   ⚠️  INCORRECTO - Puede corregirse con setCoreContract()`);
  }
  console.log("");

  // 5. Verificar ReputationStaking (tiene setCoreContract)
  console.log("5️⃣ Verificando ReputationStaking...");
  const ReputationStakingFactory = await ethers.getContractFactory("ReputationStaking");
  const reputationCheck = await checkContract(
    "ReputationStaking",
    CONTRACTS.REPUTATION_STAKING,
    ReputationStakingFactory,
    false // tiene setCoreContract
  );
  results.push(reputationCheck);
  console.log(`   ${reputationCheck.isCorrect ? '✅' : '❌'} coreContract: ${reputationCheck.coreContractValue || 'N/A'}`);
  if (!reputationCheck.isCorrect && reputationCheck.canFix) {
    console.log(`   ⚠️  INCORRECTO - Puede corregirse con setCoreContract()`);
  }
  console.log("");

  // 6. Verificar DAOGovernance (tiene setCoreContract)
  console.log("6️⃣ Verificando DAOGovernance...");
  const DAOGovernanceFactory = await ethers.getContractFactory("DAOGovernance");
  const daoCheck = await checkContract(
    "DAOGovernance",
    CONTRACTS.DAO_GOVERNANCE,
    DAOGovernanceFactory,
    false // tiene setCoreContract
  );
  results.push(daoCheck);
  console.log(`   ${daoCheck.isCorrect ? '✅' : '❌'} coreContract: ${daoCheck.coreContractValue || 'N/A'}`);
  if (!daoCheck.isCorrect && daoCheck.canFix) {
    console.log(`   ⚠️  INCORRECTO - Puede corregirse con setCoreContract()`);
  }
  console.log("");

  // 7. Verificar OmniRouter (tiene setCoreContract)
  console.log("7️⃣ Verificando OmniRouter...");
  const OmniRouterFactory = await ethers.getContractFactory("OmniRouter");
  const routerCheck = await checkContract(
    "OmniRouter",
    CONTRACTS.OMNI_ROUTER,
    OmniRouterFactory,
    false // tiene setCoreContract
  );
  results.push(routerCheck);
  console.log(`   ${routerCheck.isCorrect ? '✅' : '❌'} coreContract: ${routerCheck.coreContractValue || 'N/A'}`);
  if (!routerCheck.isCorrect && routerCheck.canFix) {
    console.log(`   ⚠️  INCORRECTO - Puede corregirse con setCoreContract()`);
  }
  console.log("");

  // 8. Verificar AIOracle (usa predictionMarket, no coreContract)
  console.log("8️⃣ Verificando AIOracle...");
  try {
    const AIOracleFactory = await ethers.getContractFactory("AIOracle");
    const aiOracle = AIOracleFactory.attach(CONTRACTS.AI_ORACLE);
    const predictionMarket = await aiOracle.predictionMarket();
    const isCorrect = predictionMarket.toLowerCase() === CORE_ADDRESS.toLowerCase();
    results.push({
      name: "AIOracle",
      address: CONTRACTS.AI_ORACLE,
      hasCoreContract: true,
      coreContractValue: predictionMarket,
      isCorrect,
      isImmutable: false,
      canFix: !isCorrect,
    });
    console.log(`   ${isCorrect ? '✅' : '❌'} predictionMarket: ${predictionMarket}`);
    if (!isCorrect) {
      console.log(`   ⚠️  INCORRECTO - Puede corregirse con setPredictionMarket()`);
    }
  } catch (error: any) {
    results.push({
      name: "AIOracle",
      address: CONTRACTS.AI_ORACLE,
      hasCoreContract: false,
      isCorrect: false,
      isImmutable: false,
      canFix: false,
      error: error.message,
    });
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log("");

  // Resumen
  console.log("=".repeat(60));
  console.log("📊 RESUMEN DE VERIFICACIÓN");
  console.log("=".repeat(60));
  
  const correct = results.filter(r => r.isCorrect).length;
  const incorrect = results.filter(r => !r.isCorrect).length;
  const canFix = results.filter(r => !r.isCorrect && r.canFix).length;
  const needRedeploy = results.filter(r => !r.isCorrect && r.isImmutable).length;

  console.log(`\n✅ Correctos: ${correct}/${results.length}`);
  console.log(`❌ Incorrectos: ${incorrect}/${results.length}`);
  console.log(`🔧 Pueden corregirse: ${canFix}`);
  console.log(`⚠️  Necesitan redesplegar: ${needRedeploy}\n`);

  if (incorrect > 0) {
    console.log("❌ CONTRATOS CON PROBLEMAS:\n");
    results.forEach(result => {
      if (!result.isCorrect) {
        console.log(`   • ${result.name} (${result.address})`);
        console.log(`     - coreContract actual: ${result.coreContractValue || 'N/A'}`);
        console.log(`     - Esperado: ${CORE_ADDRESS}`);
        if (result.isImmutable) {
          console.log(`     - ⚠️  ACCIÓN: Redesplegar (immutable)`);
        } else if (result.canFix) {
          console.log(`     - ✅ ACCIÓN: Llamar setCoreContract()`);
        }
        if (result.error) {
          console.log(`     - Error: ${result.error}`);
        }
        console.log("");
      }
    });
  } else {
    console.log("✅ ✅ TODOS LOS CONTRATOS ESTÁN CONFIGURADOS CORRECTAMENTE!\n");
  }

  // Si hay contratos que pueden corregirse, ofrecer script de corrección
  if (canFix > 0) {
    console.log("💡 Puedes ejecutar un script para corregir los contratos configurables.");
    console.log("   Script: fix-configurable-contracts.ts\n");
  }

  if (needRedeploy > 0) {
    console.log("⚠️  Hay contratos que necesitan redesplegarse (immutable).");
    console.log("   Similar al fix-binary-market.ts, necesitas crear scripts para cada uno.\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

