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
  console.log("🔍 Verificando configuración del Core Contract...\n");

  const CORE_CONTRACT = "0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B";
  const NEW_BINARY_MARKET = "0x53e305CF5BF27c3AC917ca60839a4943350F7786";
  const OLD_BINARY_MARKET = "0xA62769c5C4D3f9EB64964241cB1F145bB0294F7E";

  const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
  const core = PredictionMarketCore.attach(CORE_CONTRACT);

  // Leer la dirección del BinaryMarket desde el Core
  console.log("📋 Direcciones configuradas en el Core:");
  try {
    const binaryMarketAddress = await core.binaryMarket();
    console.log("   binaryMarket:", binaryMarketAddress);
    console.log("   Nueva dirección esperada:", NEW_BINARY_MARKET);
    console.log("   Dirección antigua:", OLD_BINARY_MARKET);
    console.log("");

    if (binaryMarketAddress.toLowerCase() === NEW_BINARY_MARKET.toLowerCase()) {
      console.log("✅ El Core tiene la nueva dirección del BinaryMarket configurada");
    } else if (binaryMarketAddress.toLowerCase() === OLD_BINARY_MARKET.toLowerCase()) {
      console.log("❌ El Core todavía tiene la dirección ANTIGUA del BinaryMarket");
      console.log("   Esto explica por qué placeBet() falla con 'Only core'");
      console.log("   El Core está llamando al BinaryMarket antiguo que tiene coreContract incorrecto");
    } else {
      console.log("⚠️  El Core tiene una dirección diferente:", binaryMarketAddress);
    }

    // Verificar el coreContract del BinaryMarket que el Core está usando
    console.log("\n🔍 Verificando el BinaryMarket que el Core está usando...");
    const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
    const binaryMarket = BinaryMarket.attach(binaryMarketAddress);
    const coreContractInBinary = await binaryMarket.coreContract();
    console.log("   coreContract en BinaryMarket:", coreContractInBinary);
    console.log("   Core Contract esperado:", CORE_CONTRACT);

    if (coreContractInBinary.toLowerCase() === CORE_CONTRACT.toLowerCase()) {
      console.log("   ✅ El BinaryMarket tiene el coreContract correcto");
    } else {
      console.log("   ❌ El BinaryMarket tiene un coreContract diferente");
      console.log("   Esto causa el error 'Only core'");
    }

  } catch (error: any) {
    console.error("❌ Error al leer configuración:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

