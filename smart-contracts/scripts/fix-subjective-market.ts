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

const CORE_ADDRESS = "0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B";
const CURRENT_SUBJECTIVE_MARKET = "0xE933FB3bc9BfD23c0061E38a88b81702345E65d3";
const DAO_GOVERNANCE = "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123";

async function main() {
  console.log("🔍 Verificando y corrigiendo SubjectiveMarket...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);
  console.log("📝 Core address:", CORE_ADDRESS);
  console.log("📝 Current SubjectiveMarket address:", CURRENT_SUBJECTIVE_MARKET, "\n");

  // 1. Verificar configuración actual
  console.log("1️⃣ Verificando configuración actual del SubjectiveMarket...");
  const SubjectiveMarketFactory = await ethers.getContractFactory("SubjectiveMarket");
  const currentSubjectiveMarket = SubjectiveMarketFactory.attach(CURRENT_SUBJECTIVE_MARKET);
  
  try {
    const currentCoreContract = await currentSubjectiveMarket.coreContract();
    console.log("   ✅ coreContract actual:", currentCoreContract);
    
    if (currentCoreContract.toLowerCase() === CORE_ADDRESS.toLowerCase()) {
      console.log("   ✅ ✅ La configuración es CORRECTA! No se necesita acción.\n");
      return;
    } else {
      console.log("   ❌ La configuración es INCORRECTA!");
      console.log("   ❌ Esperado:", CORE_ADDRESS);
      console.log("   ❌ Actual:", currentCoreContract);
      console.log("   🔧 Necesita redesplegar SubjectiveMarket...\n");
    }
  } catch (error: any) {
    console.log("   ⚠️ Error al verificar:", error.message);
    console.log("   🔧 Continuando con redespliegue...\n");
  }

  // 2. Verificar que el Core existe y el deployer es owner
  console.log("2️⃣ Verificando que el Core contract existe...");
  const CoreFactory = await ethers.getContractFactory("PredictionMarketCore");
  const core = CoreFactory.attach(CORE_ADDRESS);
  
  try {
    const coreOwner = await core.owner();
    console.log("   ✅ Core owner:", coreOwner);
    
    if (coreOwner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log("   ⚠️ ADVERTENCIA: El deployer no es el owner del Core!");
      console.log("   ⚠️ Necesitas usar la cuenta que es owner del Core para actualizar.");
      return;
    }
    console.log("   ✅ El deployer es el owner del Core\n");
  } catch (error: any) {
    console.log("   ❌ Error al verificar Core:", error.message);
    throw error;
  }

  // 3. Redesplegar SubjectiveMarket con la dirección correcta del Core
  console.log("3️⃣ Redesplegando SubjectiveMarket con la dirección correcta del Core...");
  const newSubjectiveMarket = await SubjectiveMarketFactory.deploy(CORE_ADDRESS, DAO_GOVERNANCE);
  await newSubjectiveMarket.waitForDeployment();
  const newSubjectiveMarketAddress = await getAddress(newSubjectiveMarket);
  console.log("   ✅ Nuevo SubjectiveMarket desplegado:", newSubjectiveMarketAddress, "\n");

  // 4. Verificar la nueva configuración
  console.log("4️⃣ Verificando la nueva configuración...");
  const newCoreContract = await newSubjectiveMarket.coreContract();
  if (newCoreContract.toLowerCase() === CORE_ADDRESS.toLowerCase()) {
    console.log("   ✅ ✅ Configuración correcta verificada!\n");
  } else {
    console.log("   ❌ ERROR: La configuración sigue siendo incorrecta!");
    throw new Error("Configuración incorrecta después del deploy");
  }

  // 5. Transferir ownership del nuevo SubjectiveMarket al Core
  console.log("5️⃣ Transfiriendo ownership del nuevo SubjectiveMarket al Core...");
  await newSubjectiveMarket.transferOwnership(CORE_ADDRESS);
  console.log("   ✅ Ownership transferido\n");

  // 6. Actualizar el Core con la nueva dirección del SubjectiveMarket
  console.log("6️⃣ Actualizando el Core con la nueva dirección del SubjectiveMarket...");
  const updateTx = await core.updateModule("subjectiveMarket", newSubjectiveMarketAddress);
  await updateTx.wait();
  console.log("   ✅ Core actualizado");
  console.log("   📝 Transaction hash:", updateTx.hash, "\n");

  // 7. Verificar que el Core tiene la nueva dirección
  console.log("7️⃣ Verificando que el Core tiene la nueva dirección...");
  const subjectiveMarketInCore = await core.subjectiveMarket();
  if (subjectiveMarketInCore.toLowerCase() === newSubjectiveMarketAddress.toLowerCase()) {
    console.log("   ✅ ✅ Core actualizado correctamente!\n");
  } else {
    console.log("   ❌ ERROR: El Core no tiene la nueva dirección!");
    throw new Error("Core no actualizado correctamente");
  }

  // 8. Guardar las nuevas direcciones
  console.log("8️⃣ Guardando nuevas direcciones...");
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

  if (!deployments.contracts) {
    deployments.contracts = {};
  }
  if (!deployments.contracts.markets) {
    deployments.contracts.markets = {};
  }
  deployments.contracts.markets.subjective = newSubjectiveMarketAddress;
  deployments.subjectiveMarket = newSubjectiveMarketAddress;
  deployments.updatedAt = new Date().toISOString();

  fs.writeFileSync(deploymentFile, JSON.stringify(deployments, null, 2));
  console.log("   ✅ Direcciones guardadas en:", deploymentFile, "\n");

  // 9. Resumen final
  console.log("=".repeat(60));
  console.log("✅ ✅ CORRECCIÓN COMPLETADA EXITOSAMENTE");
  console.log("=".repeat(60));
  console.log("\n📋 Resumen:");
  console.log("   • SubjectiveMarket anterior:", CURRENT_SUBJECTIVE_MARKET);
  console.log("   • SubjectiveMarket nuevo:", newSubjectiveMarketAddress);
  console.log("   • Core address:", CORE_ADDRESS);
  console.log("   • coreContract configurado correctamente: ✅");
  console.log("   • Core actualizado con nueva dirección: ✅");
  console.log("\n🔗 Verificar en opBNBScan:");
  console.log(`   • Nuevo SubjectiveMarket: https://testnet.opbnbscan.com/address/${newSubjectiveMarketAddress}`);
  console.log(`   • Core: https://testnet.opbnbscan.com/address/${CORE_ADDRESS}`);
  console.log("\n📝 Próximos pasos:");
  console.log("   1. Actualizar NEXT_PUBLIC_SUBJECTIVE_MARKET_ADDRESS en .env.local");
  console.log("   2. Actualizar NEXT_PUBLIC_SUBJECTIVE_MARKET_ADDRESS en Vercel");
  console.log("   3. Probar crear un mercado subjetivo en /demo");
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

