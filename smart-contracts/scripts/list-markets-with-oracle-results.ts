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

/**
 * Script para listar todos los mercados y verificar cuáles tienen resultados en el oracle
 */
async function main() {
  console.log("🔍 Listando mercados y verificando resultados del oracle...\n");

  // Direcciones de contratos (opBNB Testnet)
  const CORE_CONTRACT = process.env.CORE_CONTRACT_ADDRESS || "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1";
  const AI_ORACLE = process.env.AI_ORACLE_ADDRESS || "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c";

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  console.log("📝 Usando cuenta:", deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "BNB\n");

  // Conectar a contratos
  const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
  const core = PredictionMarketCore.attach(CORE_CONTRACT);

  const AIOracle = await ethers.getContractFactory("AIOracle");
  const aiOracle = AIOracle.attach(AI_ORACLE);

  // Obtener el marketCounter
  const marketCounter = await core.marketCounter();
  const totalMarkets = Number(marketCounter);
  
  console.log(`📊 Total de mercados: ${totalMarkets}\n`);

  if (totalMarkets === 0) {
    console.log("❌ No hay mercados creados aún.");
    return;
  }

  console.log("🔍 Verificando mercados y resultados del oracle...\n");

  const marketsWithResults: Array<{
    id: number;
    question: string;
    status: number;
    resolved: boolean;
    yesVotes: number;
    noVotes: number;
    invalidVotes: number;
    confidence: number;
  }> = [];

  const marketsWithoutResults: Array<{
    id: number;
    question: string;
    status: number;
  }> = [];

  for (let i = 1; i <= totalMarkets; i++) {
    try {
      // Obtener info del mercado del Core
      const marketInfo = await core.getMarket(BigInt(i));
      
      if (Number(marketInfo.id) === 0) {
        continue; // Mercado no existe
      }

      // Obtener contrato del mercado
      const marketContractAddress = await core.getMarketContract(BigInt(i));
      
      // Obtener datos del mercado específico
      const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
      const binaryMarket = BinaryMarket.attach(marketContractAddress);
      const marketData = await binaryMarket.getMarket(BigInt(i));

      const question = marketData.question || marketInfo.metadata || `Market ${i}`;
      const status = Number(marketInfo.status);

      // Intentar obtener resultado del oracle
      try {
        const oracleResult = await aiOracle.getResult(BigInt(i));
        
        const resolved = oracleResult[0] as boolean;
        const yesVotes = Number(oracleResult[1]);
        const noVotes = Number(oracleResult[2]);
        const invalidVotes = Number(oracleResult[3]);
        const confidence = Number(oracleResult[4]);

        if (resolved || yesVotes > 0 || noVotes > 0 || invalidVotes > 0) {
          marketsWithResults.push({
            id: i,
            question,
            status,
            resolved,
            yesVotes,
            noVotes,
            invalidVotes,
            confidence,
          });
        } else {
          marketsWithoutResults.push({
            id: i,
            question,
            status,
          });
        }
      } catch (oracleError: any) {
        // Si el oracle no tiene resultado, agregar a la lista sin resultados
        marketsWithoutResults.push({
          id: i,
          question,
          status,
        });
      }
    } catch (error: any) {
      console.warn(`⚠️  Error verificando mercado ${i}:`, error.message);
    }
  }

  // Mostrar resultados
  console.log("✅ MERCADOS CON RESULTADOS EN ORACLE:\n");
  if (marketsWithResults.length > 0) {
    marketsWithResults.forEach((market) => {
      console.log(`   📊 Market ID: ${market.id}`);
      console.log(`      Pregunta: ${market.question}`);
      console.log(`      Estado: ${market.status === 0 ? 'Active' : market.status === 1 ? 'Resolving' : market.status === 2 ? 'Resolved' : 'Unknown'}`);
      console.log(`      Resuelto: ${market.resolved ? 'Sí' : 'No'}`);
      console.log(`      YES Votes: ${market.yesVotes}`);
      console.log(`      NO Votes: ${market.noVotes}`);
      console.log(`      Invalid Votes: ${market.invalidVotes}`);
      console.log(`      Confidence: ${market.confidence}%`);
      console.log("");
    });
  } else {
    console.log("   ❌ No se encontraron mercados con resultados en el oracle\n");
  }

  console.log("📋 MERCADOS SIN RESULTADOS EN ORACLE:\n");
  if (marketsWithoutResults.length > 0) {
    marketsWithoutResults.forEach((market) => {
      console.log(`   Market ID: ${market.id} - ${market.question} (Estado: ${market.status === 0 ? 'Active' : market.status === 1 ? 'Resolving' : market.status === 2 ? 'Resolved' : 'Unknown'})`);
    });
  } else {
    console.log("   ✅ Todos los mercados tienen resultados en el oracle\n");
  }

  console.log("\n📊 RESUMEN:");
  console.log(`   - Total mercados: ${totalMarkets}`);
  console.log(`   - Con resultados en oracle: ${marketsWithResults.length}`);
  console.log(`   - Sin resultados en oracle: ${marketsWithoutResults.length}`);
  
  if (marketsWithResults.length > 0) {
    console.log("\n💡 Market IDs válidos para Oracle Result:");
    marketsWithResults.forEach((market) => {
      console.log(`   - Market ID ${market.id}: ${market.question.substring(0, 50)}...`);
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

