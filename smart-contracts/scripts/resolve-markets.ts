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
 * Script para resolver mercados existentes usando AI Oracle
 * 
 * Uso: pnpm hardhat run scripts/resolve-markets.ts --network opBNBTestnet
 * 
 * Este script resuelve los mercados especificados usando fulfillResolutionManual
 */
async function main() {
  console.log("🎯 Resolviendo mercados usando AI Oracle...\n");

  // Direcciones de contratos (opBNB Testnet)
  const CORE_CONTRACT = process.env.CORE_CONTRACT_ADDRESS || "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1";
  const BINARY_MARKET = process.env.BINARY_MARKET_ADDRESS || "0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d";
  const AI_ORACLE = process.env.AI_ORACLE_ADDRESS || "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c";

  // Mercados a resolver: [marketId, outcome]
  // outcome: 1=Yes, 2=No, 3=Invalid
  const marketsToResolve: Array<[number, number]> = [
    [7, 1], // Mercado 7: YES
    [8, 2], // Mercado 8: NO
    [9, 3], // Mercado 9: Invalid
  ];

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  console.log("📝 Usando cuenta:", deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "BNB\n");

  // Conectar a contratos
  const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
  const core = PredictionMarketCore.attach(CORE_CONTRACT);

  const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
  const binaryMarket = BinaryMarket.attach(BINARY_MARKET);

  const AIOracle = await ethers.getContractFactory("AIOracle");
  const aiOracle = AIOracle.attach(AI_ORACLE);

  // Verificar que el deployer es owner del AI Oracle
  const oracleOwner = await aiOracle.owner();
  if (oracleOwner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("❌ ERROR: Deployer no es owner del AI Oracle");
    console.error("   Owner actual:", oracleOwner);
    console.error("   Deployer:", deployer.address);
    return;
  }
  console.log("✅ Deployer es owner del AI Oracle\n");

  // Resolver cada mercado
  for (const [marketId, outcome] of marketsToResolve) {
    try {
      console.log(`🎯 Resolviendo mercado ${marketId} con outcome ${outcome === 1 ? "YES" : outcome === 2 ? "NO" : "Invalid"}...`);
      
      // Verificar estado actual del mercado
      const marketData = await binaryMarket.getMarket(marketId);
      console.log("   Estado actual:");
      console.log("      Resolved:", marketData.resolved);
      console.log("      Outcome:", marketData.outcome.toString());
      
      if (marketData.resolved) {
        console.log("   ⚠️  Mercado ya está resuelto, saltando...\n");
        continue;
      }

      // Verificar que el resolutionTime haya pasado
      const currentTime = Math.floor(Date.now() / 1000);
      const resolutionTime = Number(marketData.resolutionTime);
      
      if (currentTime < resolutionTime) {
        const timeRemaining = resolutionTime - currentTime;
        const hoursRemaining = Math.floor(timeRemaining / 3600);
        const minutesRemaining = Math.floor((timeRemaining % 3600) / 60);
        console.log(`   ⏰ Mercado aún no está listo para resolver`);
        console.log(`   Tiempo restante: ${hoursRemaining}h ${minutesRemaining}m`);
        console.log(`   Resolution Time: ${new Date(resolutionTime * 1000).toLocaleString()}`);
        console.log(`   Current Time: ${new Date(currentTime * 1000).toLocaleString()}\n`);
        continue;
      }

      // Iniciar resolución
      console.log("   📝 Iniciando resolución...");
      try {
        const initiateTx = await core.initiateResolution(marketId);
        await initiateTx.wait();
        console.log("   ✅ Resolución iniciada");
      } catch (initError: any) {
        console.log("   ⚠️  Error al iniciar resolución:", initError.message);
        // Continuar de todas formas, puede que ya esté iniciada
      }
      
      // Esperar un poco
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Resolver usando fulfillResolutionManual
      const confidence = 90;
      console.log(`   📝 Llamando fulfillResolutionManual(${marketId}, ${outcome}, ${confidence})...`);
      
      const resolveTx = await aiOracle.fulfillResolutionManual(
        marketId,
        outcome,
        confidence
      );
      console.log("   📝 TX enviada:", resolveTx.hash);
      await resolveTx.wait();
      console.log("   ✅ Mercado resuelto exitosamente");
      
      // Verificar resolución
      const resolvedMarket = await binaryMarket.getMarket(marketId);
      console.log("   ✅ Verificación:");
      console.log("      Resolved:", resolvedMarket.resolved);
      console.log("      Outcome:", resolvedMarket.outcome.toString());
      console.log("");
      
    } catch (error: any) {
      console.error(`   ❌ Error resolviendo mercado ${marketId}:`, error.message);
      if (error.message.includes("Not resolving")) {
        console.error("   💡 El mercado necesita estar en estado 'Resolving' primero");
        console.error("   💡 Asegúrate de que el resolutionTime haya pasado y llama a initiateResolution");
      }
      console.error("");
    }
  }

  console.log("✅ Proceso completado\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

