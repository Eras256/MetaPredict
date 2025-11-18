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
 * Script para crear un mercado nuevo y resolverlo inmediatamente para probar Oracle Result
 */
async function main() {
  console.log("🎯 Creando mercado y resolviéndolo para probar Oracle Result...\n");

  // Direcciones de contratos (opBNB Testnet)
  const CORE_CONTRACT = process.env.CORE_CONTRACT_ADDRESS || "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1";
  const BINARY_MARKET = process.env.BINARY_MARKET_ADDRESS || "0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d";
  const AI_ORACLE = process.env.AI_ORACLE_ADDRESS || "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c";

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

  // Obtener el último marketCounter
  const currentCounter = await core.marketCounter();
  const newMarketId = Number(currentCounter) + 1;
  console.log(`📊 Último marketCounter: ${currentCounter}`);
  console.log(`   Nuevo Market ID será: ${newMarketId}\n`);

  // Crear mercado con resolutionTime mínimo (2 horas en el futuro para cumplir con validaciones)
  // Luego lo resolveremos manualmente usando fulfillResolutionManual
  const currentTime = Math.floor(Date.now() / 1000);
  const resolutionTime = currentTime + 7200; // 2 horas en el futuro (para cumplir validaciones)
  
  const marketQuestion = "¿MetaPredict será el mejor protocolo de predicción en 2025?";
  const marketDescription = "Mercado de prueba para Oracle Result - Resuelto inmediatamente";
  const metadata = `ipfs://test-oracle-market-${newMarketId}`;

  console.log("1️⃣ Creando mercado...");
  console.log(`   Pregunta: ${marketQuestion}`);
  console.log(`   Resolution Time: ${new Date(resolutionTime * 1000).toLocaleString()}\n`);

  try {
    // Crear mercado (sin fee, el contrato no requiere pago)
    const createTx = await core.createBinaryMarket(
      marketQuestion,
      marketDescription,
      resolutionTime,
      metadata
    );
    console.log("   📝 TX enviada:", createTx.hash);
    await createTx.wait();
    console.log("   ✅ Mercado creado exitosamente\n");

    // Esperar un poco para que se confirme
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verificar que el mercado se creó
    const marketInfo = await core.getMarket(BigInt(newMarketId));
    if (Number(marketInfo.id) === 0) {
      console.error("❌ Error: El mercado no se creó correctamente");
      return;
    }
    console.log("   ✅ Mercado verificado en el Core\n");

    // Obtener contrato del mercado
    const marketContractAddress = await core.getMarketContract(BigInt(newMarketId));
    const marketContract = BinaryMarket.attach(marketContractAddress);
    
    // Verificar datos del mercado
    const marketData = await marketContract.getMarket(BigInt(newMarketId));
    console.log("   📊 Datos del mercado:");
    console.log("      Question:", marketData.question);
    console.log("      Resolved:", marketData.resolved);
    console.log("      Outcome:", marketData.outcome.toString());
    console.log("");

    // Iniciar resolución
    console.log("2️⃣ Iniciando resolución...");
    try {
      const initiateTx = await core.initiateResolution(BigInt(newMarketId));
      console.log("   📝 TX enviada:", initiateTx.hash);
      await initiateTx.wait();
      console.log("   ✅ Resolución iniciada\n");
    } catch (initError: any) {
      console.log("   ⚠️  Error al iniciar resolución:", initError.message);
      // Continuar de todas formas
    }

    // Esperar un poco
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Resolver usando fulfillResolutionManual
    console.log("3️⃣ Resolviendo mercado con Oracle...");
    const outcome = 1; // YES
    const confidence = 85;
    
    console.log(`   📝 Llamando fulfillResolutionManual(${newMarketId}, ${outcome}, ${confidence})...`);
    
    const resolveTx = await aiOracle.fulfillResolutionManual(
      BigInt(newMarketId),
      outcome,
      confidence
    );
    console.log("   📝 TX enviada:", resolveTx.hash);
    await resolveTx.wait();
    console.log("   ✅ Mercado resuelto exitosamente\n");

    // Verificar resolución
    const resolvedMarket = await marketContract.getMarket(BigInt(newMarketId));
    console.log("   ✅ Verificación del mercado:");
    console.log("      Resolved:", resolvedMarket.resolved);
    console.log("      Outcome:", resolvedMarket.outcome.toString());
    console.log("");

    // Verificar resultado en el oracle
    console.log("4️⃣ Verificando resultado en Oracle...");
    try {
      const oracleResult = await aiOracle.getResult(BigInt(newMarketId));
      const resolved = oracleResult[0] as boolean;
      const yesVotes = Number(oracleResult[1]);
      const noVotes = Number(oracleResult[2]);
      const invalidVotes = Number(oracleResult[3]);
      const confidenceResult = Number(oracleResult[4]);
      const timestamp = Number(oracleResult[5]);

      console.log("   ✅ Resultado del Oracle:");
      console.log("      Resolved:", resolved);
      console.log("      YES Votes:", yesVotes);
      console.log("      NO Votes:", noVotes);
      console.log("      Invalid Votes:", invalidVotes);
      console.log("      Confidence:", confidenceResult, "%");
      console.log("      Timestamp:", new Date(timestamp * 1000).toLocaleString());
      console.log("");

      console.log("🎉 ¡Éxito! El mercado está listo para probar Oracle Result");
      console.log(`\n💡 Market ID válido para Oracle Result: ${newMarketId}`);
      console.log(`   Pregunta: ${marketQuestion}`);
      console.log(`   Outcome: YES (1)`);
      console.log(`   Confidence: ${confidenceResult}%`);
      
    } catch (oracleError: any) {
      console.error("   ❌ Error obteniendo resultado del oracle:", oracleError.message);
      console.log("   ⚠️  El mercado fue resuelto pero el oracle no tiene resultado aún");
    }

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.reason) {
      console.error("   Razón:", error.reason);
    }
    throw error;
  }

  console.log("\n✅ Proceso completado!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

