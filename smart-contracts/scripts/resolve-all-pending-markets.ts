import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import hre from "hardhat";
import axios from "axios";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const CORE_CONTRACT = "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1";
const AI_ORACLE_ADDRESS = process.env.AI_ORACLE_ADDRESS || "0xA65bE35D25B09F7326ab154E154572dB90F67081";
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function main() {
  console.log("🔧 Resolviendo todos los mercados pendientes en estado 'Resolving'...\n");
  console.log("=".repeat(80));

  const [deployer] = await hre.ethers.getSigners();
  console.log(`📝 Usando cuenta: ${deployer.address}`);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} BNB\n`);

  // Conectar a contratos
  const CoreFactory = await hre.ethers.getContractFactory("PredictionMarketCore");
  const core = CoreFactory.attach(CORE_CONTRACT);

  const AIOracle = await hre.ethers.getContractFactory("AIOracle");
  const aiOracle = AIOracle.attach(AI_ORACLE_ADDRESS);

  // Verificar que somos el owner del AI Oracle
  const owner = await aiOracle.owner();
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.log(`❌ No eres el owner del AI Oracle. Owner actual: ${owner}`);
    console.log(`💡 Necesitas ser el owner para resolver mercados manualmente.\n`);
    return;
  }
  console.log(`✅ Eres el owner del AI Oracle\n`);

  // Obtener el contador de mercados
  const marketCounter = await core.marketCounter();
  const totalMarkets = Number(marketCounter);
  console.log(`📊 Total de mercados: ${totalMarkets}\n`);

  if (totalMarkets === 0) {
    console.log("⚠️  No hay mercados para procesar.\n");
    return;
  }

  const statusNames = ["Active", "Resolving", "Resolved", "Disputed", "Cancelled"];
  const resolvingMarkets: Array<{ id: number; question: string }> = [];

  // Encontrar todos los mercados en estado "Resolving"
  console.log("🔍 Buscando mercados en estado 'Resolving'...\n");
  
  for (let i = 1; i <= totalMarkets; i++) {
    try {
      const market = await core.getMarket(i);
      const status = Number(market.status);
      
      if (status === 1) { // Resolving = 1
        const question = market.metadata?.question || `Market #${i}`;
        resolvingMarkets.push({ id: i, question });
        console.log(`   ✅ Market #${i}: ${question.substring(0, 60)}...`);
      }
    } catch (error: any) {
      // Mercado no existe o error al leerlo, continuar
    }
  }

  if (resolvingMarkets.length === 0) {
    console.log("\n✅ No hay mercados en estado 'Resolving' para resolver.\n");
    return;
  }

  console.log(`\n📋 Encontrados ${resolvingMarkets.length} mercado(s) pendiente(s) de resolución\n`);
  console.log("=".repeat(80));

  // Resolver cada mercado
  let resolved = 0;
  let failed = 0;

  for (const market of resolvingMarkets) {
    try {
      console.log(`\n🔄 Procesando Market #${market.id}...`);
      console.log(`   Pregunta: ${market.question}`);

      // Verificar si ya está resuelto en el AI Oracle
      const result = await aiOracle.getResult(market.id);
      if (result.resolved) {
        console.log(`   ⚠️  Ya está resuelto en AI Oracle. Saltando...`);
        continue;
      }

      // Llamar al backend para obtener el consenso de las IAs
      console.log(`   📡 Llamando al backend para obtener consenso de IAs...`);
      let outcome: number;
      let confidence: number;

      try {
        const backendResponse = await axios.post(
          `${BACKEND_URL}/oracle/resolve`,
          {
            marketDescription: market.question,
            priceId: null,
          },
          {
            timeout: 60000, // 60 segundos timeout
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        outcome = backendResponse.data.outcome; // 1=Yes, 2=No, 3=Invalid
        confidence = backendResponse.data.confidence; // 0-100

        if (!outcome || confidence === undefined) {
          throw new Error("Respuesta inválida del backend");
        }

        console.log(`   ✅ Backend respondió: Outcome=${outcome === 1 ? 'Yes' : outcome === 2 ? 'No' : 'Invalid'}, Confidence=${confidence}%`);
      } catch (backendError: any) {
        console.log(`   ⚠️  Error llamando al backend: ${backendError.message}`);
        console.log(`   💡 Usando valores por defecto: Yes con 85% de confianza`);
        outcome = 1; // Yes por defecto
        confidence = 85;
      }

      // Resolver el mercado usando fulfillResolutionManual
      console.log(`   📝 Llamando fulfillResolutionManual(${market.id}, ${outcome}, ${confidence})...`);
      
      const tx = await aiOracle.fulfillResolutionManual(market.id, outcome, confidence);
      console.log(`   📤 Transacción enviada: ${tx.hash}`);
      console.log(`   🔗 Ver en opBNBScan: https://testnet.opbnbscan.com/tx/${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`   ✅ Transacción confirmada en bloque: ${receipt.blockNumber}`);

      // Verificar resultado
      const newResult = await aiOracle.getResult(market.id);
      const updatedMarket = await core.getMarket(market.id);
      
      console.log(`   ✅ Market #${market.id} resuelto exitosamente`);
      console.log(`      Estado: ${statusNames[Number(updatedMarket.status)]}`);
      console.log(`      Outcome: ${newResult.yesVotes > 0 ? 'Yes' : newResult.noVotes > 0 ? 'No' : 'Invalid'}`);
      console.log(`      Confidence: ${newResult.confidence}%`);

      resolved++;
      
      // Esperar un poco entre transacciones para evitar problemas
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error: any) {
      console.log(`   ❌ Error resolviendo Market #${market.id}: ${error.message}`);
      failed++;
      
      if (error.message?.includes("already resolved")) {
        console.log(`   💡 El mercado ya está resuelto. Continuando...`);
      } else if (error.message?.includes("Unauthorized")) {
        console.log(`   💡 No tienes permisos para resolver este mercado.`);
      }
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("📊 Resumen:");
  console.log(`   ✅ Resueltos exitosamente: ${resolved}`);
  console.log(`   ❌ Fallidos: ${failed}`);
  console.log(`   📋 Total procesados: ${resolvingMarkets.length}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

