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

async function main() {
  console.log("🚀 Redesplegando Core Contract completo con todas las direcciones correctas...\n");

  // NOTA: Los contratos de mercado necesitan ser redesplegados con la nueva dirección del Core
  // porque coreContract es immutable. Primero desplegamos el Core, luego redesplegamos los mercados.
  
  // Direcciones de otros módulos (usar las existentes)
  const AI_ORACLE = "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c";
  const REPUTATION_STAKING = "0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7";
  const INSURANCE_POOL = "0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA";
  const CROSS_CHAIN_ROUTER = "0x11C1124384e463d99Ba84348280e318FbeE544d0";
  const DAO_GOVERNANCE = "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123";

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  console.log("📝 Desplegando con cuenta:", deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "BNB\n");

  if (balance < ethers.parseEther("0.01")) {
    console.warn("⚠️  ADVERTENCIA: Balance bajo! Puede que no tengas suficiente para el despliegue.\n");
  }

  const getAddress = async (contract: any) => await contract.getAddress();

  // 1. Primero, desplegar nuevos contratos de mercado con dirección temporal
  // (luego los redesplegaremos con la dirección del Core)
  console.log("📝 Paso 1: Desplegando contratos de mercado con dirección temporal...");
  const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
  const binaryMarketTemp = await BinaryMarket.deploy(deployer.address);
  await binaryMarketTemp.waitForDeployment();
  const binaryMarketTempAddress = await getAddress(binaryMarketTemp);
  console.log("   BinaryMarket temporal:", binaryMarketTempAddress);

  const ConditionalMarket = await ethers.getContractFactory("ConditionalMarket");
  const conditionalMarketTemp = await ConditionalMarket.deploy(deployer.address);
  await conditionalMarketTemp.waitForDeployment();
  const conditionalMarketTempAddress = await getAddress(conditionalMarketTemp);
  console.log("   ConditionalMarket temporal:", conditionalMarketTempAddress);

  const SubjectiveMarket = await ethers.getContractFactory("SubjectiveMarket");
  const subjectiveMarketTemp = await SubjectiveMarket.deploy(deployer.address, DAO_GOVERNANCE);
  await subjectiveMarketTemp.waitForDeployment();
  const subjectiveMarketTempAddress = await getAddress(subjectiveMarketTemp);
  console.log("   SubjectiveMarket temporal:", subjectiveMarketTempAddress);
  console.log("");

  // 2. Desplegar nuevo Core Contract con direcciones temporales
  console.log("📝 Paso 2: Desplegando nuevo PredictionMarketCore...");
  console.log("   BinaryMarket (temp):", binaryMarketTempAddress);
  console.log("   ConditionalMarket (temp):", conditionalMarketTempAddress);
  console.log("   SubjectiveMarket (temp):", subjectiveMarketTempAddress);
  console.log("   AIOracle:", AI_ORACLE);
  console.log("   ReputationStaking:", REPUTATION_STAKING);
  console.log("   InsurancePool:", INSURANCE_POOL);
  console.log("   CrossChainRouter:", CROSS_CHAIN_ROUTER);
  console.log("   DAOGovernance:", DAO_GOVERNANCE);
  console.log("");

  const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
  const core = await PredictionMarketCore.deploy(
    binaryMarketTempAddress,
    conditionalMarketTempAddress,
    subjectiveMarketTempAddress,
    AI_ORACLE,
    REPUTATION_STAKING,
    INSURANCE_POOL,
    CROSS_CHAIN_ROUTER,
    DAO_GOVERNANCE
  );
  await core.waitForDeployment();
  const coreAddress = await getAddress(core);
  console.log("✅ Nuevo Core Contract desplegado:", coreAddress, "\n");

  // 3. Redesplegar contratos de mercado con la dirección correcta del Core
  console.log("📝 Paso 3: Redesplegando contratos de mercado con la dirección correcta del Core...");
  const binaryMarket = await BinaryMarket.deploy(coreAddress);
  await binaryMarket.waitForDeployment();
  const binaryMarketAddress = await getAddress(binaryMarket);
  console.log("   ✅ BinaryMarket redesplegado:", binaryMarketAddress);

  const conditionalMarket = await ConditionalMarket.deploy(coreAddress);
  await conditionalMarket.waitForDeployment();
  const conditionalMarketAddress = await getAddress(conditionalMarket);
  console.log("   ✅ ConditionalMarket redesplegado:", conditionalMarketAddress);

  const subjectiveMarket = await SubjectiveMarket.deploy(coreAddress, DAO_GOVERNANCE);
  await subjectiveMarket.waitForDeployment();
  const subjectiveMarketAddress = await getAddress(subjectiveMarket);
  console.log("   ✅ SubjectiveMarket redesplegado:", subjectiveMarketAddress);
  console.log("");

  // 4. Actualizar el Core con las nuevas direcciones de los mercados
  console.log("📝 Paso 4: Actualizando Core con las nuevas direcciones de los mercados...");
  const owner = await core.owner();
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("❌ ERROR: No eres el owner del Core Contract.");
    console.error("   Owner actual:", owner);
    console.error("   Tu dirección:", deployer.address);
    return;
  }

  await core.updateModule("binaryMarket", binaryMarketAddress);
  console.log("   ✅ BinaryMarket actualizado en Core");
  await core.updateModule("conditionalMarket", conditionalMarketAddress);
  console.log("   ✅ ConditionalMarket actualizado en Core");
  await core.updateModule("subjectiveMarket", subjectiveMarketAddress);
  console.log("   ✅ SubjectiveMarket actualizado en Core");
  console.log("");

  // 5. Verificar que el Core tiene las direcciones correctas
  console.log("🔍 Paso 5: Verificando configuración del nuevo Core...");
  const binaryMarketInCore = await core.binaryMarket();
  const conditionalMarketInCore = await core.conditionalMarket();
  const subjectiveMarketInCore = await core.subjectiveMarket();

  console.log("   BinaryMarket:", binaryMarketInCore);
  console.log("   ¿Correcto?:", binaryMarketInCore.toLowerCase() === binaryMarketAddress.toLowerCase() ? "✅" : "❌");
  console.log("   ConditionalMarket:", conditionalMarketInCore);
  console.log("   ¿Correcto?:", conditionalMarketInCore.toLowerCase() === conditionalMarketAddress.toLowerCase() ? "✅" : "❌");
  console.log("   SubjectiveMarket:", subjectiveMarketInCore);
  console.log("   ¿Correcto?:", subjectiveMarketInCore.toLowerCase() === subjectiveMarketAddress.toLowerCase() ? "✅" : "❌");
  console.log("");

  // 6. Verificar que los contratos de mercado tienen el coreContract correcto
  console.log("🔍 Paso 6: Verificando coreContract en los contratos de mercado...");
  const binaryCoreContract = await binaryMarket.coreContract();
  const conditionalCoreContract = await conditionalMarket.coreContract();
  const subjectiveCoreContract = await subjectiveMarket.coreContract();
  
  console.log("   BinaryMarket.coreContract:", binaryCoreContract);
  console.log("   ConditionalMarket.coreContract:", conditionalCoreContract);
  console.log("   SubjectiveMarket.coreContract:", subjectiveCoreContract);
  console.log("   Nuevo Core:", coreAddress);
  
  const allCorrect = 
    binaryCoreContract.toLowerCase() === coreAddress.toLowerCase() &&
    conditionalCoreContract.toLowerCase() === coreAddress.toLowerCase() &&
    subjectiveCoreContract.toLowerCase() === coreAddress.toLowerCase();
  
  console.log("   ¿Todos correctos?:", allCorrect ? "✅" : "❌");
  
  if (!allCorrect) {
    console.error("\n❌ ERROR: Algunos contratos de mercado no tienen el coreContract correcto!");
    return;
  }
  console.log("");

  // 7. Transferir ownership de los contratos de mercado al nuevo Core
  console.log("📝 Paso 7: Transfiriendo ownership de los contratos de mercado al nuevo Core...");
  await binaryMarket.transferOwnership(coreAddress);
  console.log("   ✅ BinaryMarket ownership transferido");
  await conditionalMarket.transferOwnership(coreAddress);
  console.log("   ✅ ConditionalMarket ownership transferido");
  await subjectiveMarket.transferOwnership(coreAddress);
  console.log("   ✅ SubjectiveMarket ownership transferido\n");

  // 8. Configurar otros módulos para que apunten al nuevo Core
  console.log("📝 Configurando otros módulos para usar el nuevo Core...");
  
  try {
    const InsurancePool = await ethers.getContractFactory("InsurancePool");
    const insurancePool = InsurancePool.attach(INSURANCE_POOL);
    const insuranceOwner = await insurancePool.owner();
    if (insuranceOwner.toLowerCase() === deployer.address.toLowerCase()) {
      await insurancePool.setCoreContract(coreAddress);
      console.log("   ✅ InsurancePool configurado");
    } else {
      console.log("   ⚠️  InsurancePool: No eres el owner, no se puede actualizar");
    }
  } catch (error: any) {
    console.log("   ⚠️  InsurancePool: Error al configurar:", error.message);
  }

  try {
    const ReputationStaking = await ethers.getContractFactory("ReputationStaking");
    const reputationStaking = ReputationStaking.attach(REPUTATION_STAKING);
    const repOwner = await reputationStaking.owner();
    if (repOwner.toLowerCase() === deployer.address.toLowerCase()) {
      await reputationStaking.setCoreContract(coreAddress);
      console.log("   ✅ ReputationStaking configurado");
    } else {
      console.log("   ⚠️  ReputationStaking: No eres el owner, no se puede actualizar");
    }
  } catch (error: any) {
    console.log("   ⚠️  ReputationStaking: Error al configurar:", error.message);
  }

  try {
    const AIOracle = await ethers.getContractFactory("AIOracle");
    const aiOracle = AIOracle.attach(AI_ORACLE);
    const oracleOwner = await aiOracle.owner();
    if (oracleOwner.toLowerCase() === deployer.address.toLowerCase()) {
      await aiOracle.setPredictionMarket(coreAddress);
      console.log("   ✅ AIOracle configurado");
    } else {
      console.log("   ⚠️  AIOracle: No eres el owner, no se puede actualizar");
    }
  } catch (error: any) {
    console.log("   ⚠️  AIOracle: Error al configurar:", error.message);
  }

  try {
    const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
    const daoGovernance = DAOGovernance.attach(DAO_GOVERNANCE);
    const daoOwner = await daoGovernance.owner();
    if (daoOwner.toLowerCase() === deployer.address.toLowerCase()) {
      await daoGovernance.setCoreContract(coreAddress);
      console.log("   ✅ DAOGovernance configurado");
    } else {
      console.log("   ⚠️  DAOGovernance: No eres el owner, no se puede actualizar");
    }
  } catch (error: any) {
    console.log("   ⚠️  DAOGovernance: Error al configurar:", error.message);
  }

  try {
    const OmniRouter = await ethers.getContractFactory("OmniRouter");
    const omniRouter = OmniRouter.attach(CROSS_CHAIN_ROUTER);
    const routerOwner = await omniRouter.owner();
    if (routerOwner.toLowerCase() === deployer.address.toLowerCase()) {
      await omniRouter.setCoreContract(coreAddress);
      console.log("   ✅ OmniRouter configurado");
    } else {
      console.log("   ⚠️  OmniRouter: No eres el owner, no se puede actualizar");
    }
  } catch (error: any) {
    console.log("   ⚠️  OmniRouter: Error al configurar:", error.message);
  }

  console.log("");

  // 9. Guardar nuevas direcciones
  const newAddresses = {
    network: "opBNB Testnet",
    chainId: 5611,
    token: "BNB (native)",
    contracts: {
      core: coreAddress,
      binaryMarket: binaryMarketAddress,
      conditionalMarket: conditionalMarketAddress,
      subjectiveMarket: subjectiveMarketAddress,
      aiOracle: AI_ORACLE,
      reputationStaking: REPUTATION_STAKING,
      insurancePool: INSURANCE_POOL,
      crossChainRouter: CROSS_CHAIN_ROUTER,
      daoGovernance: DAO_GOVERNANCE,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    note: "Core y mercados redesplegados completamente con todas las direcciones correctas",
  };

  console.log("\n📋 NUEVAS DIRECCIONES:");
  console.log(JSON.stringify(newAddresses, null, 2));

  // Guardar en archivo
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "opbnb-testnet-new-core.json"),
    JSON.stringify(newAddresses, null, 2)
  );

  console.log("\n✅ Direcciones guardadas en deployments/opbnb-testnet-new-core.json");
  console.log("\n📝 PRÓXIMOS PASOS:");
  console.log("   1. Actualizar frontend/lib/contracts/addresses.ts con la nueva dirección del Core:");
  console.log("      CORE_CONTRACT:", coreAddress);
  console.log("      PREDICTION_MARKET:", coreAddress);
  console.log("   2. Verificar el nuevo Core en opBNBScan");
  console.log("   3. Probar crear un mercado y apostar para confirmar que funciona");
  console.log("\n⚠️  NOTA: El Core anterior seguirá existiendo pero no se usará.");
  console.log("   Todos los nuevos mercados y apuestas usarán el nuevo Core.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

