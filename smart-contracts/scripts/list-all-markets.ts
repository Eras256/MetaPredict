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
  console.log("🔍 Listando todos los mercados...\n");
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("");

  try {
    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // Obtener el contador de mercados
    const marketCounter = await core.marketCounter();
    const totalMarkets = Number(marketCounter);
    
    console.log(`📊 Total de mercados: ${totalMarkets}\n`);

    if (totalMarkets === 0) {
      console.log("⚠️  No hay mercados creados aún");
      return;
    }

    // Obtener direcciones esperadas
    const expectedBinaryMarket = await core.binaryMarket();
    const expectedConditionalMarket = await core.conditionalMarket();
    const expectedSubjectiveMarket = await core.subjectiveMarket();

    console.log("📋 Direcciones esperadas:");
    console.log("   BinaryMarket:", expectedBinaryMarket);
    console.log("   ConditionalMarket:", expectedConditionalMarket);
    console.log("   SubjectiveMarket:", expectedSubjectiveMarket);
    console.log("");

    const markets: any[] = [];
    const problems: string[] = [];

    // Iterar sobre todos los mercados
    for (let i = 1; i <= totalMarkets; i++) {
      try {
        const marketInfo = await core.markets(i);
        const marketContractAddress = await core.marketTypeContract(i);
        
        const marketType = marketInfo.marketType === 0 ? "Binary" : 
                          marketInfo.marketType === 1 ? "Conditional" : "Subjective";
        
        const status = marketInfo.status === 0 ? "Active" :
                      marketInfo.status === 1 ? "Resolving" :
                      marketInfo.status === 2 ? "Resolved" :
                      marketInfo.status === 3 ? "Disputed" : "Cancelled";

        const expectedAddress = marketType === "Binary" ? expectedBinaryMarket :
                               marketType === "Conditional" ? expectedConditionalMarket :
                               expectedSubjectiveMarket;

        const hasProblem = marketContractAddress.toLowerCase() !== expectedAddress.toLowerCase() || 
                         marketInfo.status !== 0;

        if (hasProblem) {
          problems.push(`Mercado ${i}: ${marketType} - Estado: ${status} - Contrato: ${marketContractAddress.slice(0, 10)}... (esperado: ${expectedAddress.slice(0, 10)}...)`);
        }

        markets.push({
          id: i,
          type: marketType,
          status,
          contract: marketContractAddress,
          expectedContract: expectedAddress,
          hasProblem,
          creator: marketInfo.creator,
          createdAt: new Date(Number(marketInfo.createdAt) * 1000).toLocaleString(),
        });
      } catch (error: any) {
        console.log(`⚠️  Error al leer mercado ${i}:`, error.message);
      }
    }

    // Mostrar resumen
    console.log("📋 Resumen de mercados:\n");
    markets.forEach(m => {
      const statusIcon = m.hasProblem ? "❌" : "✅";
      console.log(`${statusIcon} Mercado ${m.id}: ${m.type} - ${m.status}`);
      if (m.hasProblem) {
        if (m.contract.toLowerCase() !== m.expectedContract.toLowerCase()) {
          console.log(`   ⚠️  Contrato incorrecto: ${m.contract} (esperado: ${m.expectedContract})`);
        }
        if (m.status !== "Active") {
          console.log(`   ⚠️  Estado: ${m.status} (no se pueden colocar apuestas)`);
        }
      }
    });

    console.log("");

    if (problems.length > 0) {
      console.log("❌ PROBLEMAS DETECTADOS:");
      problems.forEach((p, i) => console.log(`   ${i + 1}. ${p}`));
      console.log("");
      console.log("💡 SOLUCIÓN:");
      console.log("   Los mercados con problemas no se pueden usar para apostar.");
      console.log("   Necesitas crear nuevos mercados o corregir los existentes.");
    } else {
      console.log("✅ Todos los mercados están correctamente configurados");
    }

    // Mostrar mercados activos
    const activeMarkets = markets.filter(m => m.status === "Active" && !m.hasProblem);
    console.log("");
    if (activeMarkets.length > 0) {
      console.log(`✅ Mercados activos disponibles: ${activeMarkets.length}`);
      activeMarkets.forEach(m => {
        console.log(`   - Mercado ${m.id}: ${m.type}`);
      });
    } else {
      console.log("⚠️  No hay mercados activos disponibles para apostar");
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

