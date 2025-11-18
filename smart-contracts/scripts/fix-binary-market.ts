import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load .env from root directory (1 level up from smart-contracts/)
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
 * Script para verificar y corregir la configuración del BinaryMarket
 * 
 * Este script:
 * 1. Verifica la configuración actual del BinaryMarket desplegado
 * 2. Si coreContract está mal configurado, redespliega BinaryMarket con la dirección correcta
 * 3. Actualiza el Core con la nueva dirección del BinaryMarket
 */

const CORE_ADDRESS = "0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC";
const CURRENT_BINARY_MARKET = "0x58004f3DbFfE94D4Fe398E0d4FC8B90eb4C945CB";

async function main() {
  console.log("🔍 Verificando configuración del BinaryMarket...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);
  console.log("📝 Core address:", CORE_ADDRESS);
  console.log("📝 Current BinaryMarket address:", CURRENT_BINARY_MARKET, "\n");

  // 1. Verificar configuración actual
  console.log("1️⃣ Verificando configuración actual del BinaryMarket...");
  const BinaryMarketFactory = await ethers.getContractFactory("BinaryMarket");
  const currentBinaryMarket = BinaryMarketFactory.attach(CURRENT_BINARY_MARKET);
  
  try {
    const currentCoreContract = await currentBinaryMarket.coreContract();
    console.log("   ✅ coreContract actual:", currentCoreContract);
    
    if (currentCoreContract.toLowerCase() === CORE_ADDRESS.toLowerCase()) {
      console.log("   ✅ ✅ La configuración es CORRECTA! No se necesita acción.\n");
      return;
    } else {
      console.log("   ❌ La configuración es INCORRECTA!");
      console.log("   ❌ Esperado:", CORE_ADDRESS);
      console.log("   ❌ Actual:", currentCoreContract);
      console.log("   🔧 Necesita redesplegar BinaryMarket...\n");
    }
  } catch (error: any) {
    console.log("   ⚠️ Error al verificar:", error.message);
    console.log("   🔧 Continuando con redespliegue...\n");
  }

  // 2. Verificar que el Core existe
  console.log("2️⃣ Verificando que el Core contract existe...");
  const CoreFactory = await ethers.getContractFactory("PredictionMarketCore");
  const core = CoreFactory.attach(CORE_ADDRESS);
  
  try {
    const coreOwner = await core.owner();
    console.log("   ✅ Core owner:", coreOwner);
    
    if (coreOwner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log("   ⚠️ ADVERTENCIA: El deployer no es el owner del Core!");
      console.log("   ⚠️ Necesitas usar la cuenta que es owner del Core para actualizar.");
      console.log("   ⚠️ Owner actual:", coreOwner);
      console.log("   ⚠️ Deployer:", deployer.address);
      console.log("\n   💡 Solución: Usa la cuenta owner para ejecutar este script.\n");
      return;
    }
    console.log("   ✅ El deployer es el owner del Core\n");
  } catch (error: any) {
    console.log("   ❌ Error al verificar Core:", error.message);
    throw error;
  }

  // 3. Redesplegar BinaryMarket con la dirección correcta del Core
  console.log("3️⃣ Redesplegando BinaryMarket con la dirección correcta del Core...");
  const newBinaryMarket = await BinaryMarketFactory.deploy(CORE_ADDRESS);
  await newBinaryMarket.waitForDeployment();
  const newBinaryMarketAddress = await newBinaryMarket.getAddress();
  console.log("   ✅ Nuevo BinaryMarket desplegado:", newBinaryMarketAddress, "\n");

  // 4. Verificar la nueva configuración
  console.log("4️⃣ Verificando la nueva configuración...");
  const newCoreContract = await newBinaryMarket.coreContract();
  if (newCoreContract.toLowerCase() === CORE_ADDRESS.toLowerCase()) {
    console.log("   ✅ ✅ Configuración correcta verificada!\n");
  } else {
    console.log("   ❌ ERROR: La configuración sigue siendo incorrecta!");
    throw new Error("Configuración incorrecta después del deploy");
  }

  // 5. Transferir ownership del nuevo BinaryMarket al Core
  console.log("5️⃣ Transfiriendo ownership del nuevo BinaryMarket al Core...");
  await newBinaryMarket.transferOwnership(CORE_ADDRESS);
  console.log("   ✅ Ownership transferido\n");

  // 6. Actualizar el Core con la nueva dirección del BinaryMarket
  console.log("6️⃣ Actualizando el Core con la nueva dirección del BinaryMarket...");
  const updateTx = await core.updateModule("binaryMarket", newBinaryMarketAddress);
  await updateTx.wait();
  console.log("   ✅ Core actualizado");
  console.log("   📝 Transaction hash:", updateTx.hash, "\n");

  // 7. Verificar que el Core tiene la nueva dirección
  console.log("7️⃣ Verificando que el Core tiene la nueva dirección...");
  const binaryMarketInCore = await core.binaryMarket();
  if (binaryMarketInCore.toLowerCase() === newBinaryMarketAddress.toLowerCase()) {
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

  deployments.binaryMarket = newBinaryMarketAddress;
  deployments.core = CORE_ADDRESS;
  deployments.network = network.name;
  deployments.chainId = network.chainId.toString();
  deployments.updatedAt = new Date().toISOString();

  fs.writeFileSync(deploymentFile, JSON.stringify(deployments, null, 2));
  console.log("   ✅ Direcciones guardadas en:", deploymentFile, "\n");

  // 9. Resumen final
  console.log("=".repeat(60));
  console.log("✅ ✅ CORRECCIÓN COMPLETADA EXITOSAMENTE");
  console.log("=".repeat(60));
  console.log("\n📋 Resumen:");
  console.log("   • BinaryMarket anterior:", CURRENT_BINARY_MARKET);
  console.log("   • BinaryMarket nuevo:", newBinaryMarketAddress);
  console.log("   • Core address:", CORE_ADDRESS);
  console.log("   • coreContract configurado correctamente: ✅");
  console.log("   • Core actualizado con nueva dirección: ✅");
  console.log("\n🔗 Verificar en opBNBScan:");
  console.log(`   • Nuevo BinaryMarket: https://testnet.opbnbscan.com/address/${newBinaryMarketAddress}`);
  console.log(`   • Core: https://testnet.opbnbscan.com/address/${CORE_ADDRESS}`);
  console.log("\n📝 Próximos pasos:");
  console.log("   1. Actualizar NEXT_PUBLIC_BINARY_MARKET_ADDRESS en .env.local");
  console.log("   2. Actualizar NEXT_PUBLIC_BINARY_MARKET_ADDRESS en Vercel");
  console.log("   3. Probar crear un mercado en /demo");
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

