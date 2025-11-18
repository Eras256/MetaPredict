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

// Helper function to get address
async function getAddress(contract: any): Promise<string> {
  if (typeof contract.getAddress === 'function') {
    return await contract.getAddress();
  }
  return contract.address;
}

/**
 * Script para redesplegar el Core Contract con la versión actualizada
 * 
 * Este script:
 * 1. Obtiene todas las direcciones actuales de los módulos
 * 2. Redespliega el Core contract con el código actualizado
 * 3. Configura todos los módulos con setCoreContract
 * 4. Actualiza las referencias necesarias
 */

// Direcciones actuales de los contratos desplegados
const CURRENT_ADDRESSES = {
  BINARY_MARKET: "0x58004f3DbFfE94D4Fe398E0d4FC8B90eb4C945CB", // Ya corregido
  CONDITIONAL_MARKET: "0xd0FBDB61F04Cee610bF53eD1Bef4Bd2356EffF1b", // Necesita corrección
  SUBJECTIVE_MARKET: "0xE933FB3bc9BfD23c0061E38a88b81702345E65d3", // Necesita corrección
  AI_ORACLE: "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c",
  REPUTATION_STAKING: "0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7",
  INSURANCE_POOL: "0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA",
  OMNI_ROUTER: "0x11C1124384e463d99Ba84348280e318FbeE544d0",
  DAO_GOVERNANCE: "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123",
  OLD_CORE: "0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B",
};

async function main() {
  console.log("🚀 Redesplegando Core Contract con versión actualizada...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address, "\n");

  // 1. Primero, redesplegar ConditionalMarket y SubjectiveMarket con Core temporal
  console.log("1️⃣ Redesplegando ConditionalMarket y SubjectiveMarket...");
  console.log("   (Usaremos una dirección temporal del Core, luego la actualizaremos)\n");

  const ConditionalMarketFactory = await ethers.getContractFactory("ConditionalMarket");
  const SubjectiveMarketFactory = await ethers.getContractFactory("SubjectiveMarket");

  // Desplegar ConditionalMarket con dirección temporal (será actualizada después)
  console.log("   📝 Desplegando ConditionalMarket...");
  const newConditionalMarket = await ConditionalMarketFactory.deploy(
    deployer.address // Temporal, será actualizado después
  );
  await newConditionalMarket.waitForDeployment();
  const newConditionalMarketAddress = await getAddress(newConditionalMarket);
  console.log("   ✅ Nuevo ConditionalMarket:", newConditionalMarketAddress, "\n");

  // Desplegar SubjectiveMarket con dirección temporal
  console.log("   📝 Desplegando SubjectiveMarket...");
  const newSubjectiveMarket = await SubjectiveMarketFactory.deploy(
    deployer.address, // Temporal
    CURRENT_ADDRESSES.DAO_GOVERNANCE
  );
  await newSubjectiveMarket.waitForDeployment();
  const newSubjectiveMarketAddress = await getAddress(newSubjectiveMarket);
  console.log("   ✅ Nuevo SubjectiveMarket:", newSubjectiveMarketAddress, "\n");

  // 2. Redesplegar el Core Contract con todas las direcciones
  console.log("2️⃣ Redesplegando Core Contract...");
  const CoreFactory = await ethers.getContractFactory("PredictionMarketCore");
  
  const newCore = await CoreFactory.deploy(
    CURRENT_ADDRESSES.BINARY_MARKET,
    newConditionalMarketAddress, // Nuevo ConditionalMarket
    newSubjectiveMarketAddress, // Nuevo SubjectiveMarket
    CURRENT_ADDRESSES.AI_ORACLE,
    CURRENT_ADDRESSES.REPUTATION_STAKING,
    CURRENT_ADDRESSES.INSURANCE_POOL,
    CURRENT_ADDRESSES.OMNI_ROUTER,
    CURRENT_ADDRESSES.DAO_GOVERNANCE
  );
  await newCore.waitForDeployment();
  const newCoreAddress = await getAddress(newCore);
  console.log("   ✅ Nuevo Core Contract:", newCoreAddress, "\n");

  // 3. Actualizar ConditionalMarket y SubjectiveMarket con la nueva dirección del Core
  console.log("3️⃣ Actualizando ConditionalMarket y SubjectiveMarket...");
  console.log("   ⚠️  Nota: Como coreContract es immutable, necesitamos redesplegar estos contratos");
  console.log("   🔧 Redesplegando con la dirección correcta del Core...\n");

  // Redesplegar ConditionalMarket con la dirección correcta del Core
  const finalConditionalMarket = await ConditionalMarketFactory.deploy(newCoreAddress);
  await finalConditionalMarket.waitForDeployment();
  const finalConditionalMarketAddress = await getAddress(finalConditionalMarket);
  console.log("   ✅ ConditionalMarket final:", finalConditionalMarketAddress, "\n");

  // Redesplegar SubjectiveMarket con la dirección correcta del Core
  const finalSubjectiveMarket = await SubjectiveMarketFactory.deploy(
    newCoreAddress,
    CURRENT_ADDRESSES.DAO_GOVERNANCE
  );
  await finalSubjectiveMarket.waitForDeployment();
  const finalSubjectiveMarketAddress = await getAddress(finalSubjectiveMarket);
  console.log("   ✅ SubjectiveMarket final:", finalSubjectiveMarketAddress, "\n");

  // 4. Actualizar el Core con las direcciones finales
  console.log("4️⃣ Actualizando Core con direcciones finales...");
  await newCore.updateModule("conditionalMarket", finalConditionalMarketAddress);
  await newCore.updateModule("subjectiveMarket", finalSubjectiveMarketAddress);
  console.log("   ✅ Core actualizado\n");

  // 5. Transferir ownership de los market contracts al Core
  console.log("5️⃣ Transfiriendo ownership de market contracts al Core...");
  await finalConditionalMarket.transferOwnership(newCoreAddress);
  await finalSubjectiveMarket.transferOwnership(newCoreAddress);
  console.log("   ✅ Ownership transferido\n");

  // 6. Configurar todos los módulos con setCoreContract
  console.log("6️⃣ Configurando módulos con setCoreContract...");
  
  const InsurancePoolFactory = await ethers.getContractFactory("InsurancePool");
  const insurancePool = InsurancePoolFactory.attach(CURRENT_ADDRESSES.INSURANCE_POOL);
  await insurancePool.setCoreContract(newCoreAddress);
  console.log("   ✅ InsurancePool configurado");

  const ReputationStakingFactory = await ethers.getContractFactory("ReputationStaking");
  const reputationStaking = ReputationStakingFactory.attach(CURRENT_ADDRESSES.REPUTATION_STAKING);
  await reputationStaking.setCoreContract(newCoreAddress);
  console.log("   ✅ ReputationStaking configurado");

  const DAOGovernanceFactory = await ethers.getContractFactory("DAOGovernance");
  const daoGovernance = DAOGovernanceFactory.attach(CURRENT_ADDRESSES.DAO_GOVERNANCE);
  await daoGovernance.setCoreContract(newCoreAddress);
  console.log("   ✅ DAOGovernance configurado");

  const OmniRouterFactory = await ethers.getContractFactory("OmniRouter");
  const omniRouter = OmniRouterFactory.attach(CURRENT_ADDRESSES.OMNI_ROUTER);
  await omniRouter.setCoreContract(newCoreAddress);
  console.log("   ✅ OmniRouter configurado");

  const AIOracleFactory = await ethers.getContractFactory("AIOracle");
  const aiOracle = AIOracleFactory.attach(CURRENT_ADDRESSES.AI_ORACLE);
  await aiOracle.setPredictionMarket(newCoreAddress);
  console.log("   ✅ AIOracle configurado\n");

  // 7. Actualizar BinaryMarket en el Core (por si acaso)
  console.log("7️⃣ Verificando BinaryMarket en Core...");
  const binaryMarketInCore = await newCore.binaryMarket();
  if (binaryMarketInCore.toLowerCase() !== CURRENT_ADDRESSES.BINARY_MARKET.toLowerCase()) {
    await newCore.updateModule("binaryMarket", CURRENT_ADDRESSES.BINARY_MARKET);
    console.log("   ✅ BinaryMarket actualizado en Core");
  } else {
    console.log("   ✅ BinaryMarket ya está correcto");
  }
  console.log("");

  // 8. Verificar todas las configuraciones
  console.log("8️⃣ Verificando todas las configuraciones...");
  const conditionalInCore = await newCore.conditionalMarket();
  const subjectiveInCore = await newCore.subjectiveMarket();
  
  console.log("   Core → ConditionalMarket:", conditionalInCore);
  console.log("   Core → SubjectiveMarket:", subjectiveInCore);
  
  if (conditionalInCore.toLowerCase() === finalConditionalMarketAddress.toLowerCase() &&
      subjectiveInCore.toLowerCase() === finalSubjectiveMarketAddress.toLowerCase()) {
    console.log("   ✅ ✅ Todas las configuraciones son correctas!\n");
  } else {
    console.log("   ❌ ERROR: Las configuraciones no coinciden!");
    throw new Error("Configuración incorrecta");
  }

  // 9. Guardar las nuevas direcciones
  console.log("9️⃣ Guardando nuevas direcciones...");
  const deploymentsPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsPath)) {
    fs.mkdirSync(deploymentsPath, { recursive: true });
  }

  const network = await ethers.provider.getNetwork();
  const deploymentFile = path.join(deploymentsPath, `opbnb-testnet.json`);
  
  let deployments: any = {};
  if (fs.existsSync(deploymentFile)) {
    deployments = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
  }

  deployments.core = newCoreAddress;
  deployments.oldCore = CURRENT_ADDRESSES.OLD_CORE;
  if (!deployments.contracts) {
    deployments.contracts = {};
  }
  deployments.contracts.core = newCoreAddress;
  if (!deployments.contracts.markets) {
    deployments.contracts.markets = {};
  }
  deployments.contracts.markets.conditional = finalConditionalMarketAddress;
  deployments.contracts.markets.subjective = finalSubjectiveMarketAddress;
  deployments.conditionalMarket = finalConditionalMarketAddress;
  deployments.subjectiveMarket = finalSubjectiveMarketAddress;
  deployments.network = network.name;
  deployments.chainId = network.chainId.toString();
  deployments.updatedAt = new Date().toISOString();
  deployments.redeployed = true;

  fs.writeFileSync(deploymentFile, JSON.stringify(deployments, null, 2));
  console.log("   ✅ Direcciones guardadas en:", deploymentFile, "\n");

  // 10. Resumen final
  console.log("=".repeat(60));
  console.log("✅ ✅ REDESPLIEGUE COMPLETADO EXITOSAMENTE");
  console.log("=".repeat(60));
  console.log("\n📋 Resumen:");
  console.log("   • Core anterior:", CURRENT_ADDRESSES.OLD_CORE);
  console.log("   • Core nuevo:", newCoreAddress);
  console.log("   • ConditionalMarket nuevo:", finalConditionalMarketAddress);
  console.log("   • SubjectiveMarket nuevo:", finalSubjectiveMarketAddress);
  console.log("   • Todos los módulos configurados: ✅");
  console.log("\n🔗 Verificar en opBNBScan:");
  console.log(`   • Nuevo Core: https://testnet.opbnbscan.com/address/${newCoreAddress}`);
  console.log(`   • Nuevo ConditionalMarket: https://testnet.opbnbscan.com/address/${finalConditionalMarketAddress}`);
  console.log(`   • Nuevo SubjectiveMarket: https://testnet.opbnbscan.com/address/${finalSubjectiveMarketAddress}`);
  console.log("\n📝 Próximos pasos:");
  console.log("   1. Actualizar NEXT_PUBLIC_CORE_CONTRACT_ADDRESS en .env.local");
  console.log("   2. Actualizar NEXT_PUBLIC_CORE_CONTRACT_ADDRESS en Vercel");
  console.log("   3. Actualizar NEXT_PUBLIC_CONDITIONAL_MARKET_ADDRESS en Vercel");
  console.log("   4. Actualizar NEXT_PUBLIC_SUBJECTIVE_MARKET_ADDRESS en Vercel");
  console.log("   5. Probar crear mercados en /demo");
  console.log("\n⚠️  IMPORTANTE:");
  console.log("   • El Core anterior quedará obsoleto");
  console.log("   • Todos los módulos ahora apuntan al nuevo Core");
  console.log("   • Actualiza TODAS las variables de entorno");
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

