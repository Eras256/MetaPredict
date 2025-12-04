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

// Direcciones actuales desde el Core Contract desplegado
// Estas direcciones se obtienen dinámicamente desde el Core, pero aquí están los valores por defecto
const CORE_CONTRACT = process.env.CORE_CONTRACT_ADDRESS || "0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC";
// Nota: Las direcciones de los contratos de mercado se obtienen dinámicamente desde el Core
// Estos valores por defecto son solo para referencia
const BINARY_MARKET = process.env.BINARY_MARKET_ADDRESS || "0x44bF3De950526d5BDbfaA284F6430c72Ea99163B";
const CONDITIONAL_MARKET = process.env.CONDITIONAL_MARKET_ADDRESS || "0x45E223eAB99761A7E60eF7690420C178FEBD23df";
const SUBJECTIVE_MARKET = process.env.SUBJECTIVE_MARKET_ADDRESS || "0xaBb50827b49E7c725B6A8B735348D3A2a34E70cE";

async function main() {
  console.log("🔍 Verificando vinculación de contratos...\n");
  console.log("📋 Direcciones actuales:");
  console.log("   Core Contract:", CORE_CONTRACT);
  console.log("   Binary Market:", BINARY_MARKET);
  console.log("   Conditional Market:", CONDITIONAL_MARKET);
  console.log("   Subjective Market:", SUBJECTIVE_MARKET);
  console.log("");

  try {
    // Obtener instancias de contratos
    const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
    const binaryMarket = BinaryMarket.attach(BINARY_MARKET);

    const ConditionalMarket = await ethers.getContractFactory("ConditionalMarket");
    const conditionalMarket = ConditionalMarket.attach(CONDITIONAL_MARKET);

    const SubjectiveMarket = await ethers.getContractFactory("SubjectiveMarket");
    const subjectiveMarket = SubjectiveMarket.attach(SUBJECTIVE_MARKET);

    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // Leer coreContract desde cada contrato de mercado
    console.log("🔍 Verificando coreContract en cada contrato de mercado:");
    const binaryCoreContract = await binaryMarket.coreContract();
    const conditionalCoreContract = await conditionalMarket.coreContract();
    const subjectiveCoreContract = await subjectiveMarket.coreContract();

    console.log("   BinaryMarket.coreContract:", binaryCoreContract);
    console.log("   ConditionalMarket.coreContract:", conditionalCoreContract);
    console.log("   SubjectiveMarket.coreContract:", subjectiveCoreContract);
    console.log("   Core Contract esperado:", CORE_CONTRACT);
    console.log("");

    // Verificar qué direcciones tiene configuradas el Core
    console.log("🔍 Verificando direcciones configuradas en el Core:");
    const coreBinaryMarket = await core.binaryMarket();
    const coreConditionalMarket = await core.conditionalMarket();
    const coreSubjectiveMarket = await core.subjectiveMarket();

    console.log("   Core.binaryMarket:", coreBinaryMarket);
    console.log("   Core.conditionalMarket:", coreConditionalMarket);
    console.log("   Core.subjectiveMarket:", coreSubjectiveMarket);
    console.log("");

    let hasError = false;
    const errors: string[] = [];

    // Verificar BinaryMarket
    if (binaryCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
      console.log("❌ PROBLEMA EN BinaryMarket:");
      console.log("   coreContract configurado:", binaryCoreContract);
      console.log("   Core Contract esperado:", CORE_CONTRACT);
      hasError = true;
      errors.push(`BinaryMarket tiene coreContract incorrecto: ${binaryCoreContract} (esperado: ${CORE_CONTRACT})`);
    } else {
      console.log("✅ BinaryMarket: coreContract correcto");
    }

    // Verificar si el Core está usando la dirección correcta del BinaryMarket
    if (coreBinaryMarket.toLowerCase() !== BINARY_MARKET.toLowerCase()) {
      console.log("⚠️  ADVERTENCIA: El Core está usando una dirección diferente de BinaryMarket:");
      console.log("   Core.binaryMarket:", coreBinaryMarket);
      console.log("   Dirección esperada:", BINARY_MARKET);
      errors.push(`Core está usando BinaryMarket diferente: ${coreBinaryMarket} (esperado: ${BINARY_MARKET})`);
    }

    // Verificar ConditionalMarket
    if (conditionalCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
      console.log("❌ PROBLEMA EN ConditionalMarket:");
      console.log("   coreContract configurado:", conditionalCoreContract);
      console.log("   Core Contract esperado:", CORE_CONTRACT);
      hasError = true;
      errors.push(`ConditionalMarket tiene coreContract incorrecto: ${conditionalCoreContract} (esperado: ${CORE_CONTRACT})`);
    } else {
      console.log("✅ ConditionalMarket: coreContract correcto");
    }

    // Verificar si el Core está usando la dirección correcta del ConditionalMarket
    if (coreConditionalMarket.toLowerCase() !== CONDITIONAL_MARKET.toLowerCase()) {
      console.log("⚠️  ADVERTENCIA: El Core está usando una dirección diferente de ConditionalMarket:");
      console.log("   Core.conditionalMarket:", coreConditionalMarket);
      console.log("   Dirección esperada:", CONDITIONAL_MARKET);
      errors.push(`Core está usando ConditionalMarket diferente: ${coreConditionalMarket} (esperado: ${CONDITIONAL_MARKET})`);
    }

    // Verificar SubjectiveMarket
    if (subjectiveCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
      console.log("❌ PROBLEMA EN SubjectiveMarket:");
      console.log("   coreContract configurado:", subjectiveCoreContract);
      console.log("   Core Contract esperado:", CORE_CONTRACT);
      hasError = true;
      errors.push(`SubjectiveMarket tiene coreContract incorrecto: ${subjectiveCoreContract} (esperado: ${CORE_CONTRACT})`);
    } else {
      console.log("✅ SubjectiveMarket: coreContract correcto");
    }

    // Verificar si el Core está usando la dirección correcta del SubjectiveMarket
    if (coreSubjectiveMarket.toLowerCase() !== SUBJECTIVE_MARKET.toLowerCase()) {
      console.log("⚠️  ADVERTENCIA: El Core está usando una dirección diferente de SubjectiveMarket:");
      console.log("   Core.subjectiveMarket:", coreSubjectiveMarket);
      console.log("   Dirección esperada:", SUBJECTIVE_MARKET);
      errors.push(`Core está usando SubjectiveMarket diferente: ${coreSubjectiveMarket} (esperado: ${SUBJECTIVE_MARKET})`);
    }

    console.log("");

    if (hasError || errors.length > 0) {
      console.log("❌ PROBLEMAS DETECTADOS:");
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
      console.log("");
      console.log("💡 SOLUCIÓN:");
      console.log("   El error 'Only core' ocurre cuando:");
      console.log("   1. Un contrato de mercado tiene un coreContract diferente al Core actual");
      console.log("   2. El Core está usando una dirección de mercado diferente a la esperada");
      console.log("");
      console.log("   Como coreContract es immutable, necesitas:");
      console.log("   1. Redesplegar los contratos de mercado con coreContract =", CORE_CONTRACT);
      console.log("   2. Actualizar el Core con las nuevas direcciones usando updateModule()");
      console.log("   3. Actualizar frontend/lib/contracts/addresses.ts con las nuevas direcciones");
    } else {
      console.log("✅ ¡Todas las configuraciones son correctas!");
      console.log("   Si aún tienes el error 'Only core', puede ser otro problema.");
      console.log("   Verifica que el mercado que estás usando existe y está activo.");
    }
  } catch (error: any) {
    console.error("❌ Error al verificar contratos:", error.message);
    console.error("   Asegúrate de estar conectado a la red correcta (opBNB Testnet)");
    console.error("   y que las direcciones de los contratos sean correctas.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

