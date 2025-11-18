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
 * Script para crear 3 mercados resueltos con apuestas para probar claim winnings
 * 
 * Este script:
 * 1. Obtiene el último marketCounter
 * 2. Crea 3 mercados binarios nuevos
 * 3. Coloca apuestas (YES y NO) en cada mercado
 * 4. Resuelve los mercados usando AI Oracle.fulfillResolutionManual
 */
async function main() {
  console.log("🎯 Creando 3 mercados resueltos para probar claim winnings...\n");

  // Direcciones de contratos (opBNB Testnet)
  const CORE_CONTRACT = process.env.CORE_CONTRACT_ADDRESS || "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1";
  const BINARY_MARKET = process.env.BINARY_MARKET_ADDRESS || "0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d";
  const AI_ORACLE = process.env.AI_ORACLE_ADDRESS || "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c";

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  console.log("📝 Usando cuenta:", deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "BNB\n");

  if (balance < ethers.parseEther("0.1")) {
    console.warn("⚠️  ADVERTENCIA: Balance bajo! Puede que no tengas suficiente para crear mercados y apuestas.\n");
  }

  // Conectar a contratos
  console.log("1️⃣ Conectando a contratos...");
  const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
  const core = PredictionMarketCore.attach(CORE_CONTRACT);

  const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
  const binaryMarket = BinaryMarket.attach(BINARY_MARKET);

  const AIOracle = await ethers.getContractFactory("AIOracle");
  const aiOracle = AIOracle.attach(AI_ORACLE);

  // Verificar configuración
  const binaryCoreContract = await binaryMarket.coreContract();
  console.log("   Core Contract:", CORE_CONTRACT);
  console.log("   BinaryMarket.coreContract:", binaryCoreContract);
  
  if (binaryCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
    console.error("   ❌ ERROR: La configuración no es correcta!");
    console.error("   El BinaryMarket no está vinculado al Core correcto.");
    return;
  }
  console.log("   ✅ Configuración correcta\n");

  // Verificar AI Oracle
  const oracleOwner = await aiOracle.owner();
  const oraclePredictionMarket = await aiOracle.predictionMarket();
  console.log("   AI Oracle Owner:", oracleOwner);
  console.log("   AI Oracle predictionMarket:", oraclePredictionMarket);
  
  if (oracleOwner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.warn("   ⚠️  ADVERTENCIA: Deployer no es owner del AI Oracle");
    console.warn("   💡 Necesitas ser owner para usar fulfillResolutionManual\n");
  } else {
    console.log("   ✅ Deployer es owner del AI Oracle");
  }
  
  if (oraclePredictionMarket.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
    console.warn("   ⚠️  ADVERTENCIA: AI Oracle no está configurado con el Core correcto");
    console.warn("   💡 Configura con: aiOracle.setPredictionMarket(CORE_CONTRACT)\n");
  } else {
    console.log("   ✅ AI Oracle está configurado correctamente\n");
  }

  // Obtener el último marketCounter
  const currentCounter = await core.marketCounter();
  const startMarketId = Number(currentCounter) + 1;
  console.log(`2️⃣ Último marketCounter: ${currentCounter}`);
  console.log(`   Los nuevos mercados comenzarán desde ID: ${startMarketId}\n`);

  const markets = [
    {
      question: "¿Bitcoin alcanzará $100,000 USD en 2025?",
      description: "Mercado de prueba para claim winnings - Outcome: YES",
      outcome: 1, // YES
      betAmount: ethers.parseEther("0.01"), // 0.01 BNB
    },
    {
      question: "¿Ethereum superará $5,000 USD este año?",
      description: "Mercado de prueba para claim winnings - Outcome: NO",
      outcome: 2, // NO
      betAmount: ethers.parseEther("0.015"), // 0.015 BNB
    },
    {
      question: "¿BNB llegará a $1,000 USD en 2025?",
      description: "Mercado de prueba para claim winnings - Outcome: Invalid",
      outcome: 3, // Invalid
      betAmount: ethers.parseEther("0.02"), // 0.02 BNB
    },
  ];

  const createdMarkets: Array<{ id: number; question: string; outcome: number }> = [];

  // Crear y configurar cada mercado
  for (let i = 0; i < markets.length; i++) {
    const market = markets[i];
    const marketId = startMarketId + i;
    
    console.log(`${i + 1}️⃣ Creando mercado ${marketId}: ${market.question}\n`);

    try {
      // Crear mercado
      // El resolutionTime debe ser al menos 1 hora en el futuro
      // Usaremos 2 horas en el futuro para cumplir con el requisito
      const resolutionTime = Math.floor(Date.now() / 1000) + 7200; // 2 horas en el futuro
      const metadata = `ipfs://test-market-${marketId}`;

      console.log("   📝 Creando mercado...");
      const createTx = await core.createBinaryMarket(
        market.question,
        market.description,
        resolutionTime,
        metadata
      );
      console.log("   📝 TX enviada:", createTx.hash);
      const createReceipt = await createTx.wait();
      console.log("   ✅ Mercado creado exitosamente");

      // Verificar que el mercado existe
      const marketData = await binaryMarket.getMarket(marketId);
      console.log("   ✅ Mercado verificado en BinaryMarket");
      console.log("   Pregunta:", marketData.question);
      console.log("");

      // Colocar apuestas
      console.log("   💰 Colocando apuestas...");
      
      // Apuesta YES
      console.log("      - Apuesta YES:", ethers.formatEther(market.betAmount), "BNB");
      const betYesTx = await core.placeBet(marketId, true, { value: market.betAmount });
      await betYesTx.wait();
      console.log("      ✅ Apuesta YES colocada");

      // Apuesta NO (solo para los primeros 2 mercados, el tercero será Invalid)
      if (i < 2) {
        const betNoAmount = ethers.parseEther("0.005"); // 0.005 BNB
        console.log("      - Apuesta NO:", ethers.formatEther(betNoAmount), "BNB");
        const betNoTx = await core.placeBet(marketId, false, { value: betNoAmount });
        await betNoTx.wait();
        console.log("      ✅ Apuesta NO colocada");
      }

      // Verificar posiciones
      const position = await binaryMarket.getPosition(marketId, deployer.address);
      console.log("   📊 Posición del deployer:");
      console.log("      Yes Shares:", position.yesShares.toString());
      console.log("      No Shares:", position.noShares.toString());
      console.log("");

      createdMarkets.push({
        id: marketId,
        question: market.question,
        outcome: market.outcome,
      });

      console.log(`   ✅ Mercado ${marketId} creado y con apuestas colocadas\n`);
      
    } catch (error: any) {
      console.error(`   ❌ Error creando mercado ${marketId}:`, error.message);
      if (error.message.includes("Only core")) {
        console.error("   💡 Verifica que el Core esté correctamente configurado");
      }
      console.error("");
    }
  }

  // Resolver los mercados usando el AI Oracle
  console.log("3️⃣ Resolviendo mercados usando AI Oracle...\n");
  
  // Avanzar el tiempo del blockchain para que el resolutionTime ya haya pasado
  // Necesitamos avanzar al menos 2 horas (7200 segundos) + un poco más
  console.log("   ⏰ Avanzando tiempo del blockchain para que los mercados estén listos para resolver...");
  try {
    // Avanzar 3 horas (10800 segundos) para asegurar que el resolutionTime haya pasado
    await ethers.provider.send("evm_increaseTime", [10800]);
    await ethers.provider.send("evm_mine", []);
    console.log("   ✅ Tiempo avanzado 3 horas\n");
  } catch (timeError: any) {
    console.log("   ⚠️  No se pudo avanzar el tiempo (puede que no esté disponible en testnet):", timeError.message);
    console.log("   💡 Los mercados necesitarán esperar hasta que el resolutionTime pase\n");
  }
  
  for (const market of createdMarkets) {
    try {
      console.log(`   🎯 Resolviendo mercado ${market.id} con outcome ${market.outcome === 1 ? "YES" : market.outcome === 2 ? "NO" : "Invalid"}...`);
      
      // Primero, iniciar la resolución para que el mercado esté en estado "Resolving"
      try {
        console.log("      - Iniciando resolución...");
        const initiateTx = await core.initiateResolution(market.id);
        await initiateTx.wait();
        console.log("      ✅ Resolución iniciada");
      } catch (initError: any) {
        // Si falla, puede ser que el mercado ya esté en estado Resolving o que haya otro problema
        console.log("      ⚠️  No se pudo iniciar resolución:", initError.message);
        console.log("      💡 Intentando resolver directamente...");
      }
      
      // Esperar un poco para que se procese
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Usar fulfillResolutionManual del AI Oracle
      // outcome: 1=Yes, 2=No, 3=Invalid
      // confidence: 90 (alta confianza para evitar insurance)
      const confidence = 90;
      
      console.log(`      - Llamando fulfillResolutionManual(${market.id}, ${market.outcome}, ${confidence})...`);
      
      if (oracleOwner.toLowerCase() === deployer.address.toLowerCase()) {
        const resolveTx = await aiOracle.fulfillResolutionManual(
          market.id,
          market.outcome,
          confidence
        );
        console.log("      📝 TX enviada:", resolveTx.hash);
        await resolveTx.wait();
        console.log("      ✅ Mercado resuelto exitosamente");
        
        // Verificar que el mercado está resuelto
        const marketData = await binaryMarket.getMarket(market.id);
        console.log("      ✅ Verificación:");
        console.log("         Resolved:", marketData.resolved);
        console.log("         Outcome:", marketData.outcome.toString());
        console.log("");
      } else {
        console.log("      ⚠️  No se puede resolver: Deployer no es owner del AI Oracle");
        console.log("      💡 Contacta al owner para resolver el mercado\n");
      }
      
    } catch (error: any) {
      console.error(`   ❌ Error resolviendo mercado ${market.id}:`, error.message);
      if (error.message.includes("Only oracle/DAO")) {
        console.error("   💡 El AI Oracle necesita estar configurado correctamente");
      }
      console.error("");
    }
  }

  // Resumen final
  console.log("✅ Resumen de mercados creados:\n");
  console.log("📊 Mercados listos para probar claim:\n");
  
  for (const market of createdMarkets) {
    try {
      const marketData = await binaryMarket.getMarket(market.id);
      const position = await binaryMarket.getPosition(market.id, deployer.address);
      
      console.log(`   Mercado ID: ${market.id}`);
      console.log(`   Pregunta: ${market.question}`);
      console.log(`   Estado: ${marketData.resolved ? "✅ Resuelto" : "⏳ Pendiente"}`);
      console.log(`   Outcome: ${marketData.outcome.toString()} (${marketData.outcome === 1 ? "YES" : marketData.outcome === 2 ? "NO" : "Invalid"})`);
      console.log(`   Posición del deployer:`);
      console.log(`      Yes Shares: ${position.yesShares.toString()}`);
      console.log(`      No Shares: ${position.noShares.toString()}`);
      console.log(`      Claimed: ${position.claimed}`);
      console.log("");
    } catch (error: any) {
      console.log(`   Mercado ID: ${market.id}`);
      console.log(`   Pregunta: ${market.question}`);
      console.log(`   ⚠️  Error al verificar estado: ${error.message}`);
      console.log("");
    }
  }

  console.log("📝 Próximos pasos:");
  console.log("1. Los mercados están listos para probar claim winnings");
  console.log("2. Usa la función claimWinnings en el frontend o directamente en el contrato");
  console.log("3. Los usuarios que apostaron en el lado ganador podrán hacer claim");
  console.log("");
  console.log("💡 Para probar claim winnings:");
  console.log("- Ve a la página demo en el frontend");
  console.log("- Usa el tab 'Betting'");
  console.log("- Ingresa el Market ID de uno de los mercados resueltos");
  console.log("- Haz click en 'Claim Winnings'");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
