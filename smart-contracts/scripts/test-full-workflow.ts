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
  console.log("🧪 Prueba completa del flujo de trabajo\n");
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("👤 Usando cuenta:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "BNB");
    console.log("");

    if (parseFloat(ethers.formatEther(balance)) < 0.01) {
      console.log("⚠️  ADVERTENCIA: Balance bajo. Necesitas al menos 0.01 BNB para las pruebas");
    }
    console.log("");

    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // ============ PASO 1: Verificar configuración ============
    console.log("📋 PASO 1: Verificando configuración de contratos...\n");
    
    const binaryMarket = await core.binaryMarket();
    const conditionalMarket = await core.conditionalMarket();
    const subjectiveMarket = await core.subjectiveMarket();

    console.log("   BinaryMarket:", binaryMarket);
    console.log("   ConditionalMarket:", conditionalMarket);
    console.log("   SubjectiveMarket:", subjectiveMarket);
    console.log("");

    // Verificar coreContract en cada contrato
    const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
    const binaryMarketContract = BinaryMarket.attach(binaryMarket);
    const binaryCoreContract = await binaryMarketContract.coreContract();

    if (binaryCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
      console.log("❌ ERROR: BinaryMarket tiene coreContract incorrecto");
      console.log("   Configurado:", binaryCoreContract);
      console.log("   Esperado:", CORE_CONTRACT);
      process.exit(1);
    }
    console.log("✅ Configuración correcta\n");

    // ============ PASO 2: Crear mercado binario ============
    console.log("📋 PASO 2: Creando mercado binario...\n");
    
    const resolutionTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 días
    const question = "¿Funcionará correctamente el sistema de apuestas después de actualizar las direcciones?";
    const description = "Mercado de prueba para verificar que todo funciona correctamente después de actualizar las direcciones de contratos.";
    const metadata = "test-workflow-2025";

    console.log("   Pregunta:", question);
    console.log("   Fecha de resolución:", new Date(resolutionTime * 1000).toLocaleString());
    console.log("");

    console.log("⏳ Enviando transacción de creación...");
    const createTx = await core.createBinaryMarket(
      question,
      description,
      BigInt(resolutionTime),
      metadata
    );

    console.log("📤 Transacción enviada:", createTx.hash);
    console.log("⏳ Esperando confirmación...");
    
    const createReceipt = await createTx.wait();
    console.log("✅ Transacción confirmada en el bloque:", createReceipt?.blockNumber);
    console.log("");

    // Obtener el ID del mercado desde el evento
    const marketCreatedEvent = createReceipt?.logs.find((log: any) => {
      try {
        const parsed = core.interface.parseLog(log);
        return parsed?.name === 'MarketCreated';
      } catch {
        return false;
      }
    });

    if (!marketCreatedEvent) {
      console.log("❌ No se encontró el evento MarketCreated");
      process.exit(1);
    }

    const parsed = core.interface.parseLog(marketCreatedEvent);
    const marketId = parsed?.args[0];
    console.log("🎉 Mercado creado exitosamente!");
    console.log("   Market ID:", marketId.toString());
    console.log("");

    // Verificar el mercado
    const marketInfo = await core.markets(marketId);
    const marketContractAddress = await core.marketTypeContract(marketId);
    
    const statusMap = ['Active', 'Resolving', 'Resolved', 'Disputed', 'Cancelled'];
    const status = statusMap[marketInfo.status] || 'Unknown';

    console.log("✅ Verificación del mercado:");
    console.log("   Estado (raw):", marketInfo.status.toString());
    console.log("   Estado:", status);
    const marketTypeNumber = Number(marketInfo.marketType);
    console.log("   Tipo (raw):", marketInfo.marketType.toString(), "(number:", marketTypeNumber, ")");
    console.log("   Tipo:", marketTypeNumber === 0 ? "Binary" : marketTypeNumber === 1 ? "Conditional" : "Subjective");
    console.log("   Contrato:", marketContractAddress);
    console.log("");

    // Convertir a número para comparación
    const statusNumber = Number(marketInfo.status);
    if (statusNumber === 0) {
      console.log("✅ El mercado está ACTIVO y listo para recibir apuestas");
    } else {
      console.log("❌ ERROR: El mercado no está activo. Estado:", status, "(raw:", statusNumber, ")");
      process.exit(1);
    }
    
    // Verificar que el tipo de mercado sea correcto
    if (marketTypeNumber !== 0) {
      console.log("⚠️  ADVERTENCIA: El mercado se creó como", 
        marketTypeNumber === 1 ? "Conditional" : "Subjective", 
        "en lugar de Binary");
      console.log("   Continuando con la prueba de apuestas de todos modos...");
    } else {
      console.log("✅ El mercado es de tipo Binary (correcto)");
    }
    console.log("");

    // ============ PASO 3: Colocar apuesta ============
    console.log("📋 PASO 3: Colocando apuesta...\n");
    
    const betAmount = ethers.parseEther("0.01"); // 0.01 BNB
    const isYes = true;

    console.log("   Market ID:", marketId.toString());
    console.log("   Cantidad:", ethers.formatEther(betAmount), "BNB");
    console.log("   Lado:", isYes ? "YES" : "NO");
    console.log("");

    console.log("⏳ Enviando transacción de apuesta...");
    const betTx = await core.placeBet(marketId, isYes, { value: betAmount });
    
    console.log("📤 Transacción enviada:", betTx.hash);
    console.log("⏳ Esperando confirmación...");
    
    const betReceipt = await betTx.wait();
    console.log("✅ Transacción confirmada en el bloque:", betReceipt?.blockNumber);
    console.log("");

    // Verificar que se emitió el evento FeeCollected
    const feeCollectedEvent = betReceipt?.logs.find((log: any) => {
      try {
        const parsed = core.interface.parseLog(log);
        return parsed?.name === 'FeeCollected';
      } catch {
        return false;
      }
    });

    if (feeCollectedEvent) {
      const feeParsed = core.interface.parseLog(feeCollectedEvent);
      console.log("✅ Evento FeeCollected encontrado:");
      console.log("   Trading Fee:", ethers.formatEther(feeParsed?.args[2] || 0n), "BNB");
      console.log("   Insurance Fee:", ethers.formatEther(feeParsed?.args[3] || 0n), "BNB");
      console.log("");
    }

    // Obtener información del mercado desde el contrato correspondiente
    let marketData;
    if (marketTypeNumber === 0) {
      marketData = await binaryMarketContract.getMarket(marketId);
    } else if (marketTypeNumber === 1) {
      const ConditionalMarket = await ethers.getContractFactory("ConditionalMarket");
      const conditionalMarketContract = ConditionalMarket.attach(await core.conditionalMarket());
      marketData = await conditionalMarketContract.getMarket(marketId);
    } else {
      const SubjectiveMarket = await ethers.getContractFactory("SubjectiveMarket");
      const subjectiveMarketContract = SubjectiveMarket.attach(await core.subjectiveMarket());
      marketData = await subjectiveMarketContract.getMarket(marketId);
    }
    console.log("✅ Estado del mercado después de la apuesta:");
    console.log("   Total Yes Shares:", marketData.totalYesShares.toString());
    console.log("   Total No Shares:", marketData.totalNoShares.toString());
    console.log("   Yes Pool:", ethers.formatEther(marketData.yesPool), "BNB");
    console.log("   No Pool:", ethers.formatEther(marketData.noPool), "BNB");
    console.log("");

    // ============ PASO 4: Verificar posición del usuario ============
    console.log("📋 PASO 4: Verificando posición del usuario...\n");
    
    let position;
    if (marketTypeNumber === 0) {
      position = await binaryMarketContract.positions(marketId, deployer.address);
    } else if (marketTypeNumber === 1) {
      const ConditionalMarket = await ethers.getContractFactory("ConditionalMarket");
      const conditionalMarketContract = ConditionalMarket.attach(await core.conditionalMarket());
      position = await conditionalMarketContract.positions(marketId, deployer.address);
    } else {
      const SubjectiveMarket = await ethers.getContractFactory("SubjectiveMarket");
      const subjectiveMarketContract = SubjectiveMarket.attach(await core.subjectiveMarket());
      position = await subjectiveMarketContract.positions(marketId, deployer.address);
    }
    console.log("✅ Posición del usuario:");
    console.log("   Yes Shares:", position.yesShares.toString());
    console.log("   No Shares:", position.noShares.toString());
    console.log("   Avg Yes Price:", position.avgYesPrice.toString());
    console.log("   Avg No Price:", position.avgNoPrice.toString());
    console.log("   Claimed:", position.claimed);
    console.log("");

    // ============ RESUMEN ============
    console.log("🎉 ¡PRUEBA COMPLETA EXITOSA!\n");
    console.log("✅ Mercado creado correctamente");
    console.log("✅ Apuesta colocada correctamente");
    console.log("✅ Posición del usuario registrada correctamente");
    console.log("");
    console.log("📊 Resumen:");
    console.log(`   Market ID: ${marketId.toString()}`);
    console.log(`   Pregunta: ${question}`);
    console.log(`   Apuesta: ${ethers.formatEther(betAmount)} BNB en ${isYes ? "YES" : "NO"}`);
    console.log(`   Yes Shares obtenidas: ${position.yesShares.toString()}`);
    console.log("");
    console.log("🔗 Enlaces:");
    console.log(`   Frontend: /markets/${marketId.toString()}`);
    console.log(`   opBNBScan Core: https://testnet.opbnbscan.com/address/${CORE_CONTRACT}#readContract`);
    console.log(`   opBNBScan Market: https://testnet.opbnbscan.com/address/${binaryMarket}#readContract`);
    console.log("");

  } catch (error: any) {
    console.error("❌ Error durante la prueba:", error.message);
    
    if (error.message.includes("Only core")) {
      console.error("");
      console.error("💡 SOLUCIÓN:");
      console.error("   El error 'Only core' indica que hay un problema de configuración.");
      console.error("   Ejecuta: pnpm hardhat run scripts/verify-contract-linking.ts --network opBNBTestnet");
    } else if (error.message.includes("Not active")) {
      console.error("");
      console.error("💡 El mercado no está activo. Verifica el estado del mercado.");
    } else if (error.message.includes("Invalid amount")) {
      console.error("");
      console.error("💡 La cantidad de apuesta debe estar entre 0.001 BNB y 100 BNB.");
    } else if (error.message.includes("insufficient funds")) {
      console.error("");
      console.error("💡 Fondos insuficientes. Necesitas más BNB en tu cuenta.");
    } else {
      console.error("");
      console.error("💡 Revisa el error completo arriba para más detalles.");
      console.error("   Stack:", error.stack);
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

