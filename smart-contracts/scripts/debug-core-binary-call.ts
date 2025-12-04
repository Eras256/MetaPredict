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
const MARKET_ID = "22";

async function main() {
  console.log("🔍 Debug: Verificando por qué el Core no puede llamar a BinaryMarket.placeBet()\n");
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("📋 Market ID:", MARKET_ID);
  console.log("");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("👤 Usando cuenta:", deployer.address);
    console.log("");

    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // 1. Verificar qué tiene el Core configurado
    const coreBinaryMarket = await core.binaryMarket();
    console.log("📋 PASO 1: Direcciones en el Core");
    console.log("   Core.binaryMarket (variable):", coreBinaryMarket);
    console.log("");

    // 2. Verificar qué contrato usa el mercado
    const marketContractAddress = await core.marketTypeContract(BigInt(MARKET_ID));
    console.log("📋 PASO 2: Contrato del mercado");
    console.log("   marketTypeContract[22]:", marketContractAddress);
    console.log("   Core.binaryMarket:", coreBinaryMarket);
    console.log("   ¿Coinciden?:", marketContractAddress.toLowerCase() === coreBinaryMarket.toLowerCase());
    console.log("");

    // 3. Verificar coreContract en BinaryMarket
    const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
    const binaryMarket = BinaryMarket.attach(marketContractAddress);
    const marketCoreContract = await binaryMarket.coreContract();
    console.log("📋 PASO 3: coreContract en BinaryMarket");
    console.log("   BinaryMarket.coreContract:", marketCoreContract);
    console.log("   Core Contract:", CORE_CONTRACT);
    console.log("   ¿Coinciden?:", marketCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase());
    console.log("");

    // 4. Verificar si el problema es que el Core usa binaryMarket variable en lugar de marketContract
    console.log("📋 PASO 4: Análisis del problema");
    console.log("   El Core obtiene: marketContract =", marketContractAddress);
    console.log("   Pero usa: binaryMarket.placeBet() donde binaryMarket =", coreBinaryMarket);
    console.log("");
    
    if (marketContractAddress.toLowerCase() !== coreBinaryMarket.toLowerCase()) {
      console.log("   ❌ PROBLEMA ENCONTRADO: El Core está usando binaryMarket variable (", coreBinaryMarket, ")");
      console.log("      pero el mercado está en otro contrato (", marketContractAddress, ")");
      console.log("      Esto causa que msg.sender en BinaryMarket no sea el Core Contract");
      console.log("");
      console.log("   💡 SOLUCIÓN: El Core debería usar marketContract en lugar de binaryMarket");
      console.log("      Cambiar de:");
      console.log("        binaryMarket.placeBet{value: netAmount}(...)");
      console.log("      A:");
      console.log("        BinaryMarket(marketContract).placeBet{value: netAmount}(...)");
    } else {
      console.log("   ✅ Las direcciones coinciden, el problema debe ser otro");
      console.log("");
      console.log("   Verificando si el problema es con msg.sender...");
      console.log("   Cuando el Core llama a binaryMarket.placeBet():");
      console.log("   - msg.sender en BinaryMarket será:", CORE_CONTRACT);
      console.log("   - binaryMarket.coreContract es:", marketCoreContract);
      console.log("   - onlyCore verifica: msg.sender == coreContract");
      console.log("   - Resultado:", CORE_CONTRACT.toLowerCase() === marketCoreContract.toLowerCase() ? "✅ Debería pasar" : "❌ Fallará");
    }
    console.log("");

    // 5. Intentar una llamada directa desde el Core para ver el error exacto
    console.log("📋 PASO 5: Intentando call estático desde el Core");
    try {
      const result = await core.placeBet.staticCall(
        BigInt(MARKET_ID),
        true,
        { value: ethers.parseEther("0.01") }
      );
      console.log("   ✅ Call estático exitoso");
    } catch (error: any) {
      console.log("   ❌ Call estático falló:", error.message);
      if (error.message.includes("Only core")) {
        console.log("");
        console.log("   🔍 El error 'Only core' viene del BinaryMarket cuando verifica:");
        console.log("      require(msg.sender == coreContract, \"Only core\");");
        console.log("");
        console.log("   Esto significa que cuando el Core llama a binaryMarket.placeBet(),");
        console.log("   el msg.sender en BinaryMarket NO es igual a coreContract.");
        console.log("");
        console.log("   Posibles causas:");
        console.log("   1. El Core está usando una instancia diferente de BinaryMarket");
        console.log("   2. Hay un problema con cómo Solidity maneja msg.sender en llamadas entre contratos");
        console.log("   3. El binaryMarket variable en el Core apunta a un contrato diferente");
      }
    }

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



