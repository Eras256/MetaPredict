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
  console.log("🚀 Redesplegando contratos de mercado con la dirección correcta del Core...\n");

  // Dirección del Core Contract (debe ser la correcta)
  const CORE_CONTRACT = "0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B";
  
  // Direcciones actuales del Core y otros módulos (necesarias para actualizar el Core)
  const CURRENT_CORE = "0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B";
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

  // 1. Desplegar BinaryMarket con la dirección correcta del Core
  console.log("📝 Desplegando BinaryMarket...");
  const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
  const binaryMarket = await BinaryMarket.deploy(CORE_CONTRACT);
  await binaryMarket.waitForDeployment();
  const binaryMarketAddress = await getAddress(binaryMarket);
  console.log("✅ BinaryMarket desplegado:", binaryMarketAddress);
  console.log("   coreContract configurado:", await binaryMarket.coreContract(), "\n");

  // 2. Desplegar ConditionalMarket con la dirección correcta del Core
  console.log("📝 Desplegando ConditionalMarket...");
  const ConditionalMarket = await ethers.getContractFactory("ConditionalMarket");
  const conditionalMarket = await ConditionalMarket.deploy(CORE_CONTRACT);
  await conditionalMarket.waitForDeployment();
  const conditionalMarketAddress = await getAddress(conditionalMarket);
  console.log("✅ ConditionalMarket desplegado:", conditionalMarketAddress);
  console.log("   coreContract configurado:", await conditionalMarket.coreContract(), "\n");

  // 3. Desplegar SubjectiveMarket con la dirección correcta del Core
  console.log("📝 Desplegando SubjectiveMarket...");
  const SubjectiveMarket = await ethers.getContractFactory("SubjectiveMarket");
  const subjectiveMarket = await SubjectiveMarket.deploy(CORE_CONTRACT, DAO_GOVERNANCE);
  await subjectiveMarket.waitForDeployment();
  const subjectiveMarketAddress = await getAddress(subjectiveMarket);
  console.log("✅ SubjectiveMarket desplegado:", subjectiveMarketAddress);
  console.log("   coreContract configurado:", await subjectiveMarket.coreContract(), "\n");

  // 4. Actualizar el Core Contract con las nuevas direcciones
  console.log("📝 Actualizando PredictionMarketCore con las nuevas direcciones...");
  const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
  const core = PredictionMarketCore.attach(CURRENT_CORE);

  // Verificar que somos el owner del Core
  const owner = await core.owner();
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("❌ ERROR: No eres el owner del Core Contract.");
    console.error("   Owner actual:", owner);
    console.error("   Tu dirección:", deployer.address);
    console.error("\n   Necesitas ser el owner para actualizar los módulos.");
    return;
  }

  console.log("✅ Eres el owner del Core Contract. Actualizando módulos...\n");

  // Actualizar BinaryMarket
  console.log("   Actualizando binaryMarket...");
  try {
    const tx1 = await core.updateModule("binaryMarket", binaryMarketAddress);
    await tx1.wait();
    console.log("   ✅ binaryMarket actualizado");
  } catch (error: any) {
    console.error("   ❌ Error actualizando binaryMarket:", error.message);
    throw error;
  }

  // Actualizar ConditionalMarket
  console.log("   Actualizando conditionalMarket...");
  let conditionalUpdated = false;
  try {
    const tx2 = await core.updateModule("conditionalMarket", conditionalMarketAddress);
    await tx2.wait();
    console.log("   ✅ conditionalMarket actualizado");
    conditionalUpdated = true;
  } catch (error: any) {
    console.error("   ⚠️  No se pudo actualizar conditionalMarket:", error.message);
    console.error("   💡 Esto puede ser porque el Core desplegado tiene una versión anterior.");
    console.error("   💡 El ConditionalMarket fue redesplegado pero el Core no lo reconoce.");
    console.error("   💡 Puedes actualizar el Core manualmente o redesplegar el Core también.\n");
    // Continuar con los otros módulos
  }

  // Actualizar SubjectiveMarket
  console.log("   Actualizando subjectiveMarket...");
  let subjectiveUpdated = false;
  try {
    const tx3 = await core.updateModule("subjectiveMarket", subjectiveMarketAddress);
    await tx3.wait();
    console.log("   ✅ subjectiveMarket actualizado\n");
    subjectiveUpdated = true;
  } catch (error: any) {
    console.error("   ⚠️  No se pudo actualizar subjectiveMarket:", error.message);
    console.error("   💡 Esto puede ser porque el Core desplegado tiene una versión anterior.");
    console.error("   💡 El SubjectiveMarket fue redesplegado pero el Core no lo reconoce.\n");
    // Continuar con el resto del script
  }

  // 5. Transferir ownership de los nuevos contratos al Core
  console.log("📝 Transfiriendo ownership de los contratos al Core...");
  await binaryMarket.transferOwnership(CORE_CONTRACT);
  console.log("   ✅ BinaryMarket ownership transferido");
  await conditionalMarket.transferOwnership(CORE_CONTRACT);
  console.log("   ✅ ConditionalMarket ownership transferido");
  await subjectiveMarket.transferOwnership(CORE_CONTRACT);
  console.log("   ✅ SubjectiveMarket ownership transferido\n");

  // 6. Verificar configuración
  console.log("🔍 Verificando configuración final...");
  const binaryCore = await binaryMarket.coreContract();
  const conditionalCore = await conditionalMarket.coreContract();
  const subjectiveCore = await subjectiveMarket.coreContract();

  console.log("   BinaryMarket.coreContract:", binaryCore);
  console.log("   ConditionalMarket.coreContract:", conditionalCore);
  console.log("   SubjectiveMarket.coreContract:", subjectiveCore);
  console.log("   Core Contract esperado:", CORE_CONTRACT);

  console.log("\n📊 Resumen de actualizaciones:");
  console.log("   BinaryMarket:", binaryCore.toLowerCase() === CORE_CONTRACT.toLowerCase() ? "✅ Correcto" : "❌ Incorrecto");
  console.log("   ConditionalMarket:", conditionalCore.toLowerCase() === CORE_CONTRACT.toLowerCase() ? "✅ Correcto" : "❌ Incorrecto");
  console.log("   SubjectiveMarket:", subjectiveCore.toLowerCase() === CORE_CONTRACT.toLowerCase() ? "✅ Correcto" : "❌ Incorrecto");
  
  if (binaryCore.toLowerCase() === CORE_CONTRACT.toLowerCase()) {
    console.log("\n✅ ¡BinaryMarket está correctamente configurado y actualizado en el Core!");
    console.log("   Esto debería resolver el error 'Only core' para mercados binarios y apuestas.\n");
  }
  
  if (!conditionalUpdated || !subjectiveUpdated) {
    console.log("\n⚠️  NOTA IMPORTANTE:");
    console.log("   El Core desplegado parece tener una versión anterior que no reconoce");
    console.log("   'conditionalMarket' y 'subjectiveMarket' en updateModule.");
    console.log("   Los contratos fueron redesplegados correctamente, pero el Core no los reconoce.");
    console.log("   Opciones:");
    console.log("   1. Actualizar el Core manualmente (si tiene otra función)");
    console.log("   2. Redesplegar el Core con la versión actual del código");
    console.log("   3. Usar solo BinaryMarket por ahora (que sí funciona)\n");
  }

  // 7. Guardar nuevas direcciones
  const newAddresses = {
    network: "opBNB Testnet",
    chainId: 5611,
    token: "BNB (native)",
    contracts: {
      core: CORE_CONTRACT,
      markets: {
        binary: binaryMarketAddress,
        conditional: conditionalMarketAddress,
        subjective: subjectiveMarketAddress,
      },
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    note: "Redesplegado para corregir coreContract configuration",
  };

  console.log("\n📋 NUEVAS DIRECCIONES:");
  console.log(JSON.stringify(newAddresses, null, 2));

  // Guardar en archivo
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "opbnb-testnet-redeployed-markets.json"),
    JSON.stringify(newAddresses, null, 2)
  );

  console.log("\n✅ Direcciones guardadas en deployments/opbnb-testnet-redeployed-markets.json");
  console.log("\n📝 PRÓXIMOS PASOS:");
  console.log("   1. Actualizar frontend/lib/contracts/addresses.ts con las nuevas direcciones:");
  console.log("      BINARY_MARKET:", binaryMarketAddress);
  console.log("      CONDITIONAL_MARKET:", conditionalMarketAddress);
  console.log("      SUBJECTIVE_MARKET:", subjectiveMarketAddress);
  console.log("   2. Verificar los contratos en opBNBScan");
  console.log("   3. Probar crear un mercado y apostar para confirmar que funciona");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

