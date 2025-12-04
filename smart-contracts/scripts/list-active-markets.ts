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
  console.log("🔍 Listando mercados ACTIVOS disponibles para apostar\n");
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("");

  try {
    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // Obtener contador de mercados
    const marketCounter = await core.marketCounter();
    const totalMarkets = Number(marketCounter);
    
    console.log(`📊 Total de mercados: ${totalMarkets}`);
    console.log("");

    if (totalMarkets === 0) {
      console.log("❌ No hay mercados creados");
      return;
    }

    const activeMarkets: Array<{
      id: number;
      type: string;
      status: string;
      contractAddress: string;
      question?: string;
    }> = [];

    // Verificar cada mercado
    for (let i = 1; i <= totalMarkets; i++) {
      try {
        const marketInfo = await core.markets(i);
        const marketTypeNum = Number(marketInfo.marketType);
        const statusNum = Number(marketInfo.status);
        
        const typeMap = ['Binary', 'Conditional', 'Subjective'];
        const statusMap = ['Active', 'Resolving', 'Resolved', 'Disputed', 'Cancelled'];
        
        const marketType = typeMap[marketTypeNum] || 'Unknown';
        const status = statusMap[statusNum] || 'Unknown';
        
        // Solo incluir mercados activos
        if (statusNum === 0) {
          const marketContractAddress = await core.marketTypeContract(i);
          
          // Intentar obtener la pregunta del mercado
          let question = 'N/A';
          try {
            const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
            const binaryMarket = BinaryMarket.attach(marketContractAddress);
            const marketData = await binaryMarket.getMarket(i);
            question = marketData.question || 'N/A';
          } catch (e) {
            // No es BinaryMarket o no se pudo leer
          }
          
          activeMarkets.push({
            id: i,
            type: marketType,
            status: status,
            contractAddress: marketContractAddress,
            question: question,
          });
        }
      } catch (error: any) {
        // Ignorar errores de mercados individuales
        console.warn(`⚠️  Error verificando mercado ${i}:`, error.message);
      }
    }

    console.log(`✅ Mercados ACTIVOS encontrados: ${activeMarkets.length}\n`);
    
    if (activeMarkets.length === 0) {
      console.log("❌ No hay mercados activos disponibles para apostar");
      console.log("");
      console.log("💡 Crea un nuevo mercado activo ejecutando:");
      console.log("   pnpm hardhat run scripts/create-active-market.ts --network opBNBTestnet");
    } else {
      console.log("📋 Lista de mercados activos:\n");
      activeMarkets.forEach((market) => {
        console.log(`   ✅ Market ID: ${market.id}`);
        console.log(`      Tipo: ${market.type}`);
        console.log(`      Estado: ${market.status}`);
        console.log(`      Contrato: ${market.contractAddress}`);
        console.log(`      Pregunta: ${market.question.substring(0, 60)}${market.question.length > 60 ? '...' : ''}`);
        console.log("");
      });
      
      console.log("💡 Puedes apostar en cualquiera de estos mercados desde el frontend");
      console.log(`   Ejemplo: /markets/${activeMarkets[0].id}`);
    }

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



