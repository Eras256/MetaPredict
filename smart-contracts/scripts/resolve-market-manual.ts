import * as dotenv from "dotenv";
import * as path from "path";
import { ethers } from "hardhat";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const AI_ORACLE_ADDRESS = "0xA65bE35D25B09F7326ab154E154572dB90F67081";
const MARKET_ID = 6; // Market #6 que está en estado Resolving

async function main() {
  console.log("🔧 Resolviendo mercado manualmente...\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Usando cuenta: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB\n`);

  const AIOracle = await ethers.getContractFactory("AIOracle");
  const aiOracle = AIOracle.attach(AI_ORACLE_ADDRESS);

  try {
    const owner = await aiOracle.owner();
    console.log(`👤 Owner del contrato: ${owner}`);
    
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log(`❌ No eres el owner. Owner actual: ${owner}`);
      return;
    }

    // Verificar estado del mercado
    console.log(`📊 Verificando mercado #${MARKET_ID}...`);
    const CoreFactory = await ethers.getContractFactory("PredictionMarketCore");
    const core = CoreFactory.attach("0x5eaa77CC135b82c254F1144c48f4d179964fA0b1");
    
    const market = await core.getMarket(MARKET_ID);
    const statusNames = ["Active", "Resolving", "Resolved", "Disputed", "Cancelled"];
    console.log(`   Estado actual: ${statusNames[Number(market.status)]} (${market.status})`);

    if (Number(market.status) !== 1) { // Resolving = 1
      console.log(`   ⚠️  El mercado no está en estado Resolving. Estado actual: ${statusNames[Number(market.status)]}`);
      console.log(`   💡 Solo puedes resolver mercados que están en estado Resolving.\n`);
      return;
    }

    // Verificar si ya está resuelto
    const result = await aiOracle.getResult(MARKET_ID);
    if (result.resolved) {
      console.log(`   ⚠️  El mercado ya está resuelto.`);
      console.log(`   Resultado: Yes=${result.yesVotes}, No=${result.noVotes}, Invalid=${result.invalidVotes}`);
      console.log(`   Confianza: ${result.confidence}%\n`);
      return;
    }

    console.log(`\n✅ El mercado está listo para ser resuelto manualmente\n`);

    // Para este ejemplo, vamos a resolver como "Yes" con 85% de confianza
    // Puedes cambiar estos valores según necesites
    const outcome = 1; // 1=Yes, 2=No, 3=Invalid
    const confidence = 85; // 0-100

    console.log(`🔄 Resolviendo mercado #${MARKET_ID}...`);
    console.log(`   Outcome: ${outcome === 1 ? 'Yes' : outcome === 2 ? 'No' : 'Invalid'}`);
    console.log(`   Confidence: ${confidence}%\n`);

    const tx = await aiOracle.fulfillResolutionManual(MARKET_ID, outcome, confidence);
    console.log(`   📤 Transacción enviada: ${tx.hash}`);
    console.log(`   🔗 Ver en opBNBScan: https://testnet.opbnbscan.com/tx/${tx.hash}\n`);
    
    const receipt = await tx.wait();
    console.log(`   ✅ Transacción confirmada en bloque: ${receipt.blockNumber}`);

    // Verificar resultado
    const newResult = await aiOracle.getResult(MARKET_ID);
    console.log(`\n📊 Resultado del mercado:`);
    console.log(`   Resuelto: ${newResult.resolved ? 'Sí' : 'No'}`);
    console.log(`   Yes Votes: ${newResult.yesVotes}`);
    console.log(`   No Votes: ${newResult.noVotes}`);
    console.log(`   Invalid Votes: ${newResult.invalidVotes}`);
    console.log(`   Confidence: ${newResult.confidence}%`);
    console.log(`   Timestamp: ${new Date(Number(newResult.timestamp) * 1000).toLocaleString()}\n`);

    // Verificar estado del mercado en Core
    const updatedMarket = await core.getMarket(MARKET_ID);
    console.log(`📊 Estado del mercado actualizado:`);
    console.log(`   Estado: ${statusNames[Number(updatedMarket.status)]} (${updatedMarket.status})\n`);

    console.log("=".repeat(80));
    console.log("✅ Resolución completada exitosamente!\n");
    console.log("🔗 Ver mercado en opBNBScan:");
    console.log(`   https://testnet.opbnbscan.com/address/0x5eaa77CC135b82c254F1144c48f4d179964fA0b1#readContract\n`);

  } catch (error: any) {
    console.log(`\n❌ ERROR: ${error.message}\n`);
    
    if (error.message?.includes("already resolved")) {
      console.log("💡 El mercado ya está resuelto. Verifica el estado actual.\n");
    } else if (error.message?.includes("Unauthorized")) {
      console.log("💡 No tienes permisos para resolver este mercado.\n");
    } else {
      console.log("💡 Revisa los logs arriba para más detalles.\n");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

