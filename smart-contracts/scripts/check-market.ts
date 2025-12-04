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
  // Hardhat pasa argumentos después de --, así que los leemos de process.argv
  // o usamos una variable de entorno
  const marketIdArg = process.env.MARKET_ID || process.argv.find(arg => arg.startsWith('--market-id='))?.split('=')[1];
  const marketId = marketIdArg ? parseInt(marketIdArg) : 1;
  
  console.log(`🔍 Verificando mercado ID: ${marketId}\n`);
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("");

  try {
    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // Verificar si el mercado existe
    console.log("🔍 Verificando información del mercado...");
    
    try {
      const marketInfo = await core.markets(marketId);
      console.log("✅ Mercado encontrado:");
      console.log("   ID:", marketInfo.id.toString());
      console.log("   Tipo:", marketInfo.marketType === 0 ? "Binary" : marketInfo.marketType === 1 ? "Conditional" : "Subjective");
      console.log("   Creador:", marketInfo.creator);
      console.log("   Creado en:", new Date(Number(marketInfo.createdAt) * 1000).toLocaleString());
      console.log("   Tiempo de resolución:", new Date(Number(marketInfo.resolutionTime) * 1000).toLocaleString());
      console.log("   Estado:", 
        marketInfo.status === 0 ? "Active" :
        marketInfo.status === 1 ? "Resolving" :
        marketInfo.status === 2 ? "Resolved" :
        marketInfo.status === 3 ? "Disputed" :
        "Cancelled"
      );
      console.log("");

      // Obtener la dirección del contrato de mercado
      const marketContractAddress = await core.marketTypeContract(marketId);
      console.log("📋 Contrato de mercado:", marketContractAddress);
      console.log("");

      // Verificar qué dirección tiene configurada el Core para este tipo de mercado
      let expectedContractAddress: string;
      if (marketInfo.marketType === 0) {
        expectedContractAddress = await core.binaryMarket();
        console.log("   Core.binaryMarket:", expectedContractAddress);
      } else if (marketInfo.marketType === 1) {
        expectedContractAddress = await core.conditionalMarket();
        console.log("   Core.conditionalMarket:", expectedContractAddress);
      } else {
        expectedContractAddress = await core.subjectiveMarket();
        console.log("   Core.subjectiveMarket:", expectedContractAddress);
      }

      if (marketContractAddress.toLowerCase() === expectedContractAddress.toLowerCase()) {
        console.log("   ✅ La dirección del contrato de mercado coincide");
      } else {
        console.log("   ❌ PROBLEMA: La dirección del contrato de mercado NO coincide");
        console.log("   Mercado usa:", marketContractAddress);
        console.log("   Core espera:", expectedContractAddress);
      }
      console.log("");

      // Verificar el coreContract del contrato de mercado
      const MarketFactory = marketInfo.marketType === 0 
        ? await ethers.getContractFactory("BinaryMarket")
        : marketInfo.marketType === 1
        ? await ethers.getContractFactory("ConditionalMarket")
        : await ethers.getContractFactory("SubjectiveMarket");
      
      const marketContract = MarketFactory.attach(marketContractAddress);
      const coreContractInMarket = await marketContract.coreContract();
      
      console.log("🔍 Verificando coreContract en el contrato de mercado:");
      console.log("   coreContract configurado:", coreContractInMarket);
      console.log("   Core Contract esperado:", CORE_CONTRACT);
      
      if (coreContractInMarket.toLowerCase() === CORE_CONTRACT.toLowerCase()) {
        console.log("   ✅ El coreContract es correcto");
      } else {
        console.log("   ❌ PROBLEMA: El coreContract NO coincide");
        console.log("   Esto causará el error 'Only core' al intentar apostar");
      }
      console.log("");

      // Verificar si el mercado está activo
      if (marketInfo.status !== 0) {
        console.log("⚠️  ADVERTENCIA: El mercado NO está activo (estado:", 
          marketInfo.status === 1 ? "Resolving" :
          marketInfo.status === 2 ? "Resolved" :
          marketInfo.status === 3 ? "Disputed" :
          "Cancelled", ")");
        console.log("   No se pueden colocar apuestas en mercados que no están activos");
      }

    } catch (error: any) {
      if (error.message.includes("revert") || error.message.includes("invalid opcode")) {
        console.log("❌ El mercado no existe o no se puede acceder a él");
        console.log("   Verifica que el marketId sea correcto");
      } else {
        console.error("❌ Error al leer el mercado:", error.message);
      }
    }

  } catch (error: any) {
    console.error("❌ Error al conectar con el contrato:", error.message);
    console.error("   Asegúrate de estar conectado a la red correcta (opBNB Testnet)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

