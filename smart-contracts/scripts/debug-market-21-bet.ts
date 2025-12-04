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
const MARKET_ID = "21";

async function main() {
  console.log("🔍 Debug detallado del mercado 21 y por qué falla la apuesta\n");
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("📋 Market ID:", MARKET_ID);
  console.log("");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("👤 Usando cuenta:", deployer.address);
    console.log("");

    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // 1. Verificar información del mercado desde el Core
    console.log("📋 PASO 1: Información del mercado desde el Core");
    const marketInfo = await core.markets(MARKET_ID);
    const marketTypeNum = Number(marketInfo.marketType);
    const statusNum = Number(marketInfo.status);
    
    console.log("   Tipo (raw):", marketInfo.marketType.toString(), "(number:", marketTypeNum, ")");
    console.log("   Tipo:", marketTypeNum === 0 ? "Binary" : marketTypeNum === 1 ? "Conditional" : "Subjective");
    console.log("   Estado (raw):", marketInfo.status.toString(), "(number:", statusNum, ")");
    console.log("   Estado:", statusNum === 0 ? "Active" : statusNum === 1 ? "Resolving" : statusNum === 2 ? "Resolved" : statusNum === 3 ? "Disputed" : "Cancelled");
    console.log("");

    // 2. Verificar dirección del contrato de mercado
    const marketContractAddress = await core.marketTypeContract(MARKET_ID);
    console.log("📋 PASO 2: Dirección del contrato de mercado");
    console.log("   marketTypeContract:", marketContractAddress);
    console.log("");

    // 3. Verificar qué direcciones tiene configuradas el Core
    const coreBinaryMarket = await core.binaryMarket();
    const coreConditionalMarket = await core.conditionalMarket();
    const coreSubjectiveMarket = await core.subjectiveMarket();
    
    console.log("📋 PASO 3: Direcciones configuradas en el Core");
    console.log("   Core.binaryMarket:", coreBinaryMarket);
    console.log("   Core.conditionalMarket:", coreConditionalMarket);
    console.log("   Core.subjectiveMarket:", coreSubjectiveMarket);
    console.log("");

    // 4. Verificar si el mercado usa la dirección correcta
    console.log("📋 PASO 4: Verificación de dirección del mercado");
    const expectedContract = marketTypeNum === 0 ? coreBinaryMarket : 
                            marketTypeNum === 1 ? coreConditionalMarket : 
                            coreSubjectiveMarket;
    console.log("   Dirección del mercado:", marketContractAddress);
    console.log("   Dirección esperada:", expectedContract);
    console.log("   Coinciden:", marketContractAddress.toLowerCase() === expectedContract.toLowerCase());
    console.log("");

    // 5. Verificar coreContract del contrato de mercado
    const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
    const binaryMarket = BinaryMarket.attach(marketContractAddress);
    const marketCoreContract = await binaryMarket.coreContract();
    
    console.log("📋 PASO 5: Verificación de coreContract");
    console.log("   Market contract address:", marketContractAddress);
    console.log("   Market.coreContract:", marketCoreContract);
    console.log("   Core Contract:", CORE_CONTRACT);
    console.log("   Coinciden:", marketCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase());
    console.log("");

    // 6. Simular la llamada que hace el Core
    console.log("📋 PASO 6: Simulación de llamada desde el Core");
    console.log("   Cuando el Core llama a binaryMarket.placeBet():");
    console.log("   - msg.sender en BinaryMarket será:", CORE_CONTRACT);
    console.log("   - binaryMarket.coreContract es:", marketCoreContract);
    console.log("   - Verificación onlyCore: msg.sender == coreContract?");
    console.log("     ", CORE_CONTRACT.toLowerCase() === marketCoreContract.toLowerCase() ? "✅ SÍ" : "❌ NO");
    console.log("");

    // 7. Verificar si el Core está usando la instancia correcta
    console.log("📋 PASO 7: Verificación de instancia en el Core");
    console.log("   Core usa la variable 'binaryMarket' que apunta a:", coreBinaryMarket);
    console.log("   El mercado usa el contrato:", marketContractAddress);
    console.log("   ¿El Core está usando el contrato correcto?");
    
    if (marketTypeNum === 0) {
      // Es Binary
      if (marketContractAddress.toLowerCase() === coreBinaryMarket.toLowerCase()) {
        console.log("     ✅ SÍ - El Core está usando BinaryMarket correcto");
      } else {
        console.log("     ❌ NO - El Core está usando un BinaryMarket diferente");
        console.log("     Esto causará el error 'Only core' porque el mercado está en otro contrato");
      }
    }
    console.log("");

    // 8. Intentar una llamada estática para ver si falla
    console.log("📋 PASO 8: Intentando call estático de placeBet");
    try {
      await core.placeBet.staticCall(
        MARKET_ID,
        true,
        { value: ethers.parseEther("0.01") }
      );
      console.log("   ✅ Call estático exitoso - la transacción debería funcionar");
    } catch (error: any) {
      console.log("   ❌ Call estático falló:", error.message);
      if (error.message.includes("Only core")) {
        console.log("");
        console.log("   💡 El problema es que cuando el Core llama a binaryMarket.placeBet(),");
        console.log("      el BinaryMarket verifica que msg.sender == coreContract");
        console.log("      pero msg.sender no coincide con el coreContract configurado");
        console.log("");
        console.log("   Posibles causas:");
        console.log("   1. El mercado fue creado con un Core Contract diferente");
        console.log("   2. El Core está usando una instancia diferente de BinaryMarket");
        console.log("   3. Hay un problema con cómo se está haciendo la llamada");
      }
    }
    console.log("");

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



