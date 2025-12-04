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
  console.log("🚀 Creando un mercado binario activo para pruebas...\n");
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("👤 Usando cuenta:", deployer.address);
    console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB");
    console.log("");

    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // Verificar que el contrato esté desplegado
    const marketCounter = await core.marketCounter();
    console.log("📊 Mercados existentes:", marketCounter.toString());
    console.log("");

    // Crear un mercado binario
    // Resolution time: 7 días desde ahora
    const resolutionTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 días
    
    const question = "¿Será el precio de Bitcoin mayor a $100,000 USD el 1 de enero de 2026?";
    const description = "Este es un mercado de prueba para verificar que las apuestas funcionan correctamente. El mercado se resolverá automáticamente usando el oráculo de IA.";
    const metadata = "test-market-2025";

    console.log("📝 Creando mercado binario:");
    console.log("   Pregunta:", question);
    console.log("   Descripción:", description);
    console.log("   Fecha de resolución:", new Date(resolutionTime * 1000).toLocaleString());
    console.log("");

    console.log("⏳ Enviando transacción...");
    const tx = await core.createBinaryMarket(
      question,
      description,
      BigInt(resolutionTime),
      metadata
    );

    console.log("📤 Transacción enviada:", tx.hash);
    console.log("⏳ Esperando confirmación...");
    
    const receipt = await tx.wait();
    console.log("✅ Transacción confirmada en el bloque:", receipt?.blockNumber);
    console.log("");

    // Buscar el evento MarketCreated para obtener el ID del mercado
    const marketCreatedEvent = receipt?.logs.find((log: any) => {
      try {
        const parsed = core.interface.parseLog(log);
        return parsed?.name === 'MarketCreated';
      } catch {
        return false;
      }
    });

    if (marketCreatedEvent) {
      const parsed = core.interface.parseLog(marketCreatedEvent);
      const marketId = parsed?.args[0];
      console.log("🎉 ¡Mercado creado exitosamente!");
      console.log("   Market ID:", marketId.toString());
      console.log("   Tipo: Binary");
      console.log("   Creador:", deployer.address);
      console.log("");

      // Verificar el mercado
      const marketInfo = await core.markets(marketId);
      const marketContractAddress = await core.marketTypeContract(marketId);
      
      const statusMap = ['Active', 'Resolving', 'Resolved', 'Disputed', 'Cancelled'];
      const status = statusMap[marketInfo.status] || 'Unknown';

      console.log("✅ Verificación del mercado:");
      console.log("   Estado:", status);
      console.log("   Contrato de mercado:", marketContractAddress);
      console.log("   Fecha de creación:", new Date(Number(marketInfo.createdAt) * 1000).toLocaleString());
      console.log("   Fecha de resolución:", new Date(Number(marketInfo.resolutionTime) * 1000).toLocaleString());
      console.log("");

      if (marketInfo.status === 0) {
        console.log("✅ El mercado está ACTIVO y listo para recibir apuestas");
        console.log("");
        console.log("🔗 Puedes ver el mercado en:");
        console.log(`   Frontend: /markets/${marketId}`);
        console.log(`   opBNBScan: https://testnet.opbnbscan.com/address/${CORE_CONTRACT}#readContract`);
        console.log("");
        console.log("💰 Ahora puedes probar a colocar una apuesta en este mercado");
        console.log(`   Usa el Market ID: ${marketId}`);
      } else {
        console.log("⚠️  El mercado NO está activo. Estado:", status);
      }
    } else {
      console.log("⚠️  No se pudo encontrar el evento MarketCreated");
      console.log("   El mercado podría haberse creado, pero no se pudo obtener el ID");
      console.log("   Verifica en el Core Contract usando el marketCounter");
    }

  } catch (error: any) {
    console.error("❌ Error al crear el mercado:", error.message);
    
    if (error.message.includes("Only core")) {
      console.error("");
      console.error("💡 SOLUCIÓN:");
      console.error("   El error 'Only core' indica que el BinaryMarket tiene un coreContract diferente.");
      console.error("   Verifica la configuración ejecutando:");
      console.error("   pnpm hardhat run scripts/verify-contract-linking.ts --network opBNBTestnet");
    } else if (error.message.includes("Invalid time")) {
      console.error("");
      console.error("💡 SOLUCIÓN:");
      console.error("   El tiempo de resolución debe ser al menos 1 hora en el futuro.");
    } else if (error.message.includes("user rejected") || error.message.includes("User rejected")) {
      console.error("");
      console.error("💡 La transacción fue cancelada por el usuario.");
    } else {
      console.error("");
      console.error("💡 Revisa el error completo arriba para más detalles.");
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

