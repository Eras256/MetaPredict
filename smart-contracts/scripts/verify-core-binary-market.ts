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
  console.log("🔍 Verificando cómo el Core llama a BinaryMarket\n");
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("");

  try {
    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // Obtener la dirección de BinaryMarket desde el Core
    const binaryMarketAddress = await core.binaryMarket();
    console.log("📋 Dirección de BinaryMarket en el Core:", binaryMarketAddress);
    console.log("");

    // Verificar el coreContract del BinaryMarket
    const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
    const binaryMarket = BinaryMarket.attach(binaryMarketAddress);
    const binaryCoreContract = await binaryMarket.coreContract();
    
    console.log("🔍 Verificando coreContract:");
    console.log("   BinaryMarket.coreContract:", binaryCoreContract);
    console.log("   Core Contract:", CORE_CONTRACT);
    console.log("   Coinciden:", binaryCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase());
    console.log("");

    if (binaryCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
      console.log("❌ PROBLEMA: coreContract no coincide");
      console.log("   Esto causará el error 'Only core'");
      process.exit(1);
    }

    // Simular una llamada desde el Core
    console.log("🔍 Simulando llamada placeBet desde el Core...");
    console.log("   Cuando el Core llama a binaryMarket.placeBet():");
    console.log("   - msg.sender en BinaryMarket será:", CORE_CONTRACT);
    console.log("   - binaryMarket.coreContract es:", binaryCoreContract);
    console.log("   - Verificación: msg.sender == coreContract?");
    console.log("     ", CORE_CONTRACT.toLowerCase() === binaryCoreContract.toLowerCase() ? "✅ SÍ" : "❌ NO");
    console.log("");

    // Intentar una llamada estática de placeBet
    console.log("🔍 Intentando simular placeBet (call estático)...");
    try {
      // Necesitamos un marketId válido y parámetros correctos
      // Pero esto solo simula, no ejecuta
      console.log("   ⚠️  No se puede hacer call estático de placeBet porque requiere BNB");
      console.log("   Pero podemos verificar que la configuración es correcta");
    } catch (error: any) {
      console.log("   Error:", error.message);
    }

    console.log("");
    console.log("✅ La configuración parece correcta");
    console.log("");
    console.log("💡 Si aún tienes el error 'Only core', puede ser que:");
    console.log("   1. El Core está usando una dirección diferente de BinaryMarket");
    console.log("   2. Hay un problema con cómo se está haciendo la llamada");
    console.log("   3. El mercado no existe en BinaryMarket (aunque createMarket funcionó)");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

