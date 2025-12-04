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

const CORE_CONTRACT = process.env.CORE_CONTRACT_ADDRESS || "0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC";

async function main() {
  console.log("🔍 Debug: Verificando creación de mercado binario\n");
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("👤 Usando cuenta:", deployer.address);
    console.log("");

    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // Verificar direcciones
    const binaryMarketAddress = await core.binaryMarket();
    console.log("📋 BinaryMarket address:", binaryMarketAddress);
    console.log("");

    // Verificar coreContract del BinaryMarket
    const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
    const binaryMarket = BinaryMarket.attach(binaryMarketAddress);
    const binaryCoreContract = await binaryMarket.coreContract();
    
    console.log("🔍 Verificando coreContract:");
    console.log("   BinaryMarket.coreContract:", binaryCoreContract);
    console.log("   Core Contract:", CORE_CONTRACT);
    console.log("   Coinciden:", binaryCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase());
    console.log("");

    if (binaryCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
      console.log("❌ ERROR: coreContract no coincide. Esto causará 'Only core'");
      process.exit(1);
    }

    // Intentar crear mercado con una llamada estática primero
    console.log("🔍 Intentando simular la creación (call estático)...");
    const resolutionTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    
    try {
      // Esto simula la transacción sin ejecutarla
      await core.createBinaryMarket.staticCall(
        "Test Market",
        "Test Description",
        BigInt(resolutionTime),
        "test"
      );
      console.log("✅ La simulación fue exitosa (no debería fallar)");
    } catch (error: any) {
      console.log("❌ La simulación falló:");
      console.log("   Error:", error.message);
      if (error.message.includes("Only core")) {
        console.log("");
        console.log("💡 El problema es que binaryMarket.createMarket() falla con 'Only core'");
        console.log("   Esto significa que el BinaryMarket tiene un coreContract diferente");
      }
      process.exit(1);
    }

    console.log("");
    console.log("✅ Todo parece estar configurado correctamente");
    console.log("   Puedes intentar crear un mercado real ahora");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

