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
  console.log("🔍 Debug detallado de creación de mercado\n");
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("👤 Usando cuenta:", deployer.address);
    console.log("");

    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // Obtener contador antes
    const counterBefore = await core.marketCounter();
    console.log("📊 Market Counter antes:", counterBefore.toString());
    console.log("");

    // Verificar direcciones
    const binaryMarketAddress = await core.binaryMarket();
    console.log("📋 BinaryMarket address:", binaryMarketAddress);
    
    const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
    const binaryMarket = BinaryMarket.attach(binaryMarketAddress);
    const binaryCoreContract = await binaryMarket.coreContract();
    
    console.log("   BinaryMarket.coreContract:", binaryCoreContract);
    console.log("   Coinciden:", binaryCoreContract.toLowerCase() === CORE_CONTRACT.toLowerCase());
    console.log("");

    // Crear mercado
    const resolutionTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    const question = "Test Market Debug";
    const description = "Test Description";
    const metadata = "test-debug";

    console.log("📝 Creando mercado...");
    console.log("   Pregunta:", question);
    console.log("");

    // Intentar crear con call estático primero para ver si falla
    try {
      await core.createBinaryMarket.staticCall(
        question,
        description,
        BigInt(resolutionTime),
        metadata
      );
      console.log("✅ Call estático exitoso");
    } catch (error: any) {
      console.log("❌ Call estático falló:", error.message);
      if (error.message.includes("Only core")) {
        console.log("");
        console.log("💡 El problema es que binaryMarket.createMarket() falla con 'Only core'");
        console.log("   Esto significa que el BinaryMarket tiene un coreContract diferente");
        process.exit(1);
      }
    }

    console.log("");
    console.log("⏳ Enviando transacción real...");
    const tx = await core.createBinaryMarket(
      question,
      description,
      BigInt(resolutionTime),
      metadata
    );

    console.log("📤 Transacción:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Confirmada en bloque:", receipt?.blockNumber);
    console.log("");

    // Obtener contador después
    const counterAfter = await core.marketCounter();
    const marketId = counterAfter;
    console.log("📊 Market Counter después:", counterAfter.toString());
    console.log("📊 Market ID creado:", marketId.toString());
    console.log("");

    // Verificar inmediatamente después de crear
    console.log("🔍 Verificando mercado inmediatamente después de crear...");
    const marketInfo = await core.markets(marketId);
    const marketContractAddress = await core.marketTypeContract(marketId);
    
    const marketTypeNum = Number(marketInfo.marketType);
    const statusNum = Number(marketInfo.status);
    
    console.log("   Tipo (raw):", marketInfo.marketType.toString(), "(number:", marketTypeNum, ")");
    console.log("   Tipo:", marketTypeNum === 0 ? "Binary" : marketTypeNum === 1 ? "Conditional" : "Subjective");
    console.log("   Estado (raw):", marketInfo.status.toString(), "(number:", statusNum, ")");
    console.log("   Estado:", statusNum === 0 ? "Active" : statusNum === 1 ? "Resolving" : statusNum === 2 ? "Resolved" : statusNum === 3 ? "Disputed" : "Cancelled");
    console.log("   Contrato:", marketContractAddress);
    console.log("");

    // Verificar en BinaryMarket
    try {
      const binaryMarketData = await binaryMarket.getMarket(marketId);
      console.log("✅ Mercado existe en BinaryMarket:");
      console.log("   Pregunta:", binaryMarketData.question);
      console.log("   Resolved:", binaryMarketData.resolved);
      console.log("");
    } catch (error: any) {
      console.log("❌ ERROR: Mercado NO existe en BinaryMarket");
      console.log("   Error:", error.message);
      console.log("");
      console.log("💡 Esto significa que binaryMarket.createMarket() falló");
      console.log("   Probablemente con error 'Only core'");
    }

    // Verificar eventos
    console.log("🔍 Analizando eventos de la transacción...");
    for (const log of receipt.logs) {
      try {
        const parsed = core.interface.parseLog(log);
        if (parsed) {
          console.log("   Evento:", parsed.name);
          if (parsed.name === 'MarketCreated') {
            const eventTypeNum = Number(parsed.args[1]);
            console.log("      Market ID:", parsed.args[0].toString());
            console.log("      Tipo (raw):", parsed.args[1].toString(), "(number:", eventTypeNum, ")");
            console.log("      Tipo:", eventTypeNum === 0 ? "Binary" : eventTypeNum === 1 ? "Conditional" : "Subjective");
            console.log("      Creador:", parsed.args[2]);
          }
        }
      } catch (e) {
        // No es un evento del Core
      }
    }
    console.log("");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("Only core")) {
      console.error("");
      console.error("💡 El error 'Only core' indica que binaryMarket.createMarket() falló");
      console.error("   Verifica que el BinaryMarket tenga el coreContract correcto");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

