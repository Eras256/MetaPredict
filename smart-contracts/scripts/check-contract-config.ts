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
  console.log("🔍 Verificando configuración de contratos...\n");

  // Direcciones desde addresses.ts
  const CORE_CONTRACT = "0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B";
  const BINARY_MARKET = "0xA62769c5C4D3f9EB64964241cB1F145bB0294F7E";
  const CONDITIONAL_MARKET = "0xd0FBDB61F04Cee610bF53eD1Bef4Bd2356EffF1b";
  const SUBJECTIVE_MARKET = "0xE933FB3bc9BfD23c0061E38a88b81702345E65d3";

  console.log("📋 Direcciones:");
  console.log("   Core Contract:", CORE_CONTRACT);
  console.log("   Binary Market:", BINARY_MARKET);
  console.log("   Conditional Market:", CONDITIONAL_MARKET);
  console.log("   Subjective Market:", SUBJECTIVE_MARKET);
  console.log("");

  // Obtener instancias de contratos
  const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
  const binaryMarket = BinaryMarket.attach(BINARY_MARKET);

  const ConditionalMarket = await ethers.getContractFactory("ConditionalMarket");
  const conditionalMarket = ConditionalMarket.attach(CONDITIONAL_MARKET);

  const SubjectiveMarket = await ethers.getContractFactory("SubjectiveMarket");
  const subjectiveMarket = SubjectiveMarket.attach(SUBJECTIVE_MARKET);

  // Leer coreContract desde cada contrato de mercado
  console.log("🔍 Configuración actual:");
  const binaryCoreContract = await binaryMarket.coreContract();
  const conditionalCoreContract = await conditionalMarket.coreContract();
  const subjectiveCoreContract = await subjectiveMarket.coreContract();

  console.log("   BinaryMarket.coreContract:", binaryCoreContract);
  console.log("   ConditionalMarket.coreContract:", conditionalCoreContract);
  console.log("   SubjectiveMarket.coreContract:", subjectiveCoreContract);
  console.log("   Core Contract esperado:", CORE_CONTRACT);
  console.log("");

  let hasError = false;

  if (binaryCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
    console.log("❌ PROBLEMA EN BinaryMarket:");
    console.log("   Configurado:", binaryCoreContract);
    console.log("   Esperado:", CORE_CONTRACT);
    hasError = true;
  } else {
    console.log("✅ BinaryMarket: Configuración correcta");
  }

  if (conditionalCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
    console.log("❌ PROBLEMA EN ConditionalMarket:");
    console.log("   Configurado:", conditionalCoreContract);
    console.log("   Esperado:", CORE_CONTRACT);
    hasError = true;
  } else {
    console.log("✅ ConditionalMarket: Configuración correcta");
  }

  if (subjectiveCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
    console.log("❌ PROBLEMA EN SubjectiveMarket:");
    console.log("   Configurado:", subjectiveCoreContract);
    console.log("   Esperado:", CORE_CONTRACT);
    hasError = true;
  } else {
    console.log("✅ SubjectiveMarket: Configuración correcta");
  }

  console.log("");

  if (hasError) {
    console.log("❌ PROBLEMA DETECTADO:");
    console.log("   Uno o más contratos de mercado tienen configurado un coreContract diferente.");
    console.log("   Esto causa el error 'Only core' al crear mercados y al apostar.");
    console.log("");
    console.log("💡 SOLUCIÓN:");
    console.log("   El coreContract es immutable, por lo que no se puede cambiar.");
    console.log("   Se necesita redesplegar los contratos de mercado con la dirección correcta del Core.");
    console.log("");
    console.log("📝 Pasos para solucionar:");
    console.log("   1. Redesplegar BinaryMarket con coreContract =", CORE_CONTRACT);
    console.log("   2. Redesplegar ConditionalMarket con coreContract =", CORE_CONTRACT);
    console.log("   3. Redesplegar SubjectiveMarket con coreContract =", CORE_CONTRACT);
    console.log("   4. Actualizar PredictionMarketCore.updateModule() con las nuevas direcciones");
    console.log("   5. Actualizar frontend/lib/contracts/addresses.ts con las nuevas direcciones");
  } else {
    console.log("✅ ¡Todas las configuraciones son correctas!");
    console.log("   Si aún tienes el error 'Only core', puede ser otro problema.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

