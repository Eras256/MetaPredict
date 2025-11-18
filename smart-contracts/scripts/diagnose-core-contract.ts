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

const CORE_ADDRESS = "0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B";

async function main() {
  console.log("🔍 Diagnosticando Core Contract...\n");
  console.log("📝 Core address:", CORE_ADDRESS, "\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address, "\n");

  const CoreFactory = await ethers.getContractFactory("PredictionMarketCore");
  const core = CoreFactory.attach(CORE_ADDRESS);

  // 1. Verificar owner
  console.log("1️⃣ Verificando owner...");
  const owner = await core.owner();
  console.log("   Owner:", owner);
  console.log("   Deployer:", deployer.address);
  console.log("   Es owner:", owner.toLowerCase() === deployer.address.toLowerCase(), "\n");

  // 2. Verificar direcciones actuales de los módulos
  console.log("2️⃣ Verificando direcciones actuales de módulos...");
  try {
    const binaryMarket = await core.binaryMarket();
    console.log("   binaryMarket:", binaryMarket);
  } catch (e: any) {
    console.log("   ❌ Error al leer binaryMarket:", e.message);
  }

  try {
    const conditionalMarket = await core.conditionalMarket();
    console.log("   conditionalMarket:", conditionalMarket);
  } catch (e: any) {
    console.log("   ❌ Error al leer conditionalMarket:", e.message);
  }

  try {
    const subjectiveMarket = await core.subjectiveMarket();
    console.log("   subjectiveMarket:", subjectiveMarket);
  } catch (e: any) {
    console.log("   ❌ Error al leer subjectiveMarket:", e.message);
  }
  console.log("");

  // 3. Intentar llamar updateModule con diferentes nombres
  console.log("3️⃣ Probando updateModule con diferentes nombres...");
  const testAddress = "0x0000000000000000000000000000000000000001";
  
  const moduleNames = [
    "binaryMarket",
    "conditionalMarket",
    "subjectiveMarket",
    "aiOracle",
    "reputationStaking",
    "insurancePool",
    "crossChainRouter",
    "daoGovernance",
  ];

  for (const moduleName of moduleNames) {
    try {
      // Solo estimar gas, no ejecutar
      const gasEstimate = await core.updateModule.estimateGas(moduleName, testAddress);
      console.log(`   ✅ "${moduleName}": Gas estimate = ${gasEstimate.toString()}`);
    } catch (error: any) {
      if (error.message.includes("Invalid module")) {
        console.log(`   ❌ "${moduleName}": Invalid module`);
      } else {
        console.log(`   ⚠️  "${moduleName}": ${error.message.substring(0, 50)}...`);
      }
    }
  }
  console.log("");

  // 4. Verificar si el contrato tiene la función updateModule
  console.log("4️⃣ Verificando función updateModule...");
  try {
    const code = await ethers.provider.getCode(CORE_ADDRESS);
    if (code === "0x") {
      console.log("   ❌ El contrato no existe en esta dirección!");
    } else {
      console.log("   ✅ El contrato existe");
      console.log("   📝 Tamaño del código:", code.length, "caracteres");
      
      // Buscar si tiene "conditionalMarket" en el código
      if (code.toLowerCase().includes("conditionalmarket")) {
        console.log("   ✅ El código contiene 'conditionalMarket'");
      } else {
        console.log("   ⚠️  El código NO contiene 'conditionalMarket'");
        console.log("   ⚠️  El contrato puede ser una versión anterior");
      }
    }
  } catch (error: any) {
    console.log("   ❌ Error:", error.message);
  }
  console.log("");

  // 5. Resumen
  console.log("=".repeat(60));
  console.log("📊 RESUMEN DEL DIAGNÓSTICO");
  console.log("=".repeat(60));
  console.log("\n💡 Si 'conditionalMarket' muestra 'Invalid module':");
  console.log("   - El contrato Core desplegado puede ser una versión anterior");
  console.log("   - Necesita verificar el código en opBNBScan");
  console.log("   - Puede necesitar redesplegar el Core contract\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

