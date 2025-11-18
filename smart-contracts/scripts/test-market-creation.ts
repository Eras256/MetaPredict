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

async function main() {
  console.log("🧪 Probando creación de mercado y apuestas...\n");

  const CORE_CONTRACT = "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1";
  const BINARY_MARKET = "0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d";

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  
  console.log("📝 Usando cuenta:", deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "BNB\n");

  // 1. Obtener instancias de contratos
  console.log("1️⃣ Conectando a contratos...");
  const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
  const core = PredictionMarketCore.attach(CORE_CONTRACT);

  const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
  const binaryMarket = BinaryMarket.attach(BINARY_MARKET);

  // Verificar configuración
  const binaryCoreContract = await binaryMarket.coreContract();
  console.log("   BinaryMarket.coreContract:", binaryCoreContract);
  console.log("   Core Contract esperado:", CORE_CONTRACT);
  
  if (binaryCoreContract.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
    console.error("   ❌ ERROR: La configuración no es correcta!");
    return;
  }
  console.log("   ✅ Configuración correcta\n");

  // 2. Crear un mercado binario
  console.log("2️⃣ Creando mercado binario...");
  const question = "¿Funciona el fix del error 'Only core'?";
  const description = "Test market para verificar que el error 'Only core' está resuelto";
  const resolutionTime = Math.floor(Date.now() / 1000) + 86400; // 1 día desde ahora
  const metadata = "ipfs://test";

  try {
    const createTx = await core.createBinaryMarket(
      question,
      description,
      resolutionTime,
      metadata
    );
    console.log("   📝 Transacción enviada:", createTx.hash);
    const receipt = await createTx.wait();
    console.log("   ✅ Mercado creado exitosamente!");

    // Obtener el marketId del evento
    const marketCreatedEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = core.interface.parseLog(log);
        return parsed && parsed.name === "MarketCreated";
      } catch {
        return false;
      }
    });

    let marketId = 0;
    if (marketCreatedEvent) {
      const parsed = core.interface.parseLog(marketCreatedEvent);
      marketId = Number(parsed?.args[0] || 0);
      console.log("   📊 Market ID:", marketId);
    } else {
      // Si no encontramos el evento, intentar leer el último marketCounter
      marketId = Number(await core.marketCounter());
      console.log("   📊 Market ID (del counter):", marketId);
    }

    if (marketId === 0) {
      console.error("   ❌ No se pudo obtener el Market ID");
      return;
    }

    console.log("");

    // 3. Verificar que el mercado existe en BinaryMarket
    console.log("3️⃣ Verificando mercado en BinaryMarket...");
    try {
      const market = await binaryMarket.getMarket(marketId);
      console.log("   ✅ Mercado encontrado en BinaryMarket");
      console.log("   Pregunta:", market.question);
      console.log("   Resolution Time:", new Date(Number(market.resolutionTime) * 1000).toLocaleString());
      console.log("");
    } catch (error: any) {
      console.error("   ❌ Error al leer mercado:", error.message);
      return;
    }

    // 4. Intentar apostar
    console.log("4️⃣ Intentando apostar en el mercado...");
    const betAmount = ethers.parseEther("0.001"); // 0.001 BNB
    const isYes = true;

    try {
      const betTx = await core.placeBet(marketId, isYes, { value: betAmount });
      console.log("   📝 Transacción de apuesta enviada:", betTx.hash);
      const betReceipt = await betTx.wait();
      console.log("   ✅ Apuesta colocada exitosamente!");

      // Verificar posición
      const position = await binaryMarket.getPosition(marketId, deployer.address);
      console.log("   📊 Posición del usuario:");
      console.log("      Yes Shares:", position.yesShares.toString());
      console.log("      No Shares:", position.noShares.toString());
      console.log("");

      console.log("✅ ✅ ✅ ¡TODO FUNCIONA CORRECTAMENTE!");
      console.log("   El error 'Only core' está resuelto.");
      console.log("   Puedes crear mercados y apostar sin problemas.\n");

    } catch (error: any) {
      if (error.message.includes("Only core") || error.reason?.includes("Only core")) {
        console.error("   ❌ ERROR: Todavía hay un problema 'Only core'");
        console.error("   Mensaje:", error.message);
        console.error("   Esto significa que el Core no puede llamar a BinaryMarket.placeBet()");
      } else {
        console.error("   ❌ Error al apostar:", error.message);
        console.error("   (Puede ser un error diferente, no relacionado con 'Only core')");
      }
      throw error;
    }

  } catch (error: any) {
    if (error.message.includes("Only core") || error.reason?.includes("Only core")) {
      console.error("\n❌ ERROR: El problema 'Only core' persiste al crear mercado");
      console.error("   Mensaje:", error.message);
      console.error("   Esto significa que el Core no puede llamar a BinaryMarket.createMarket()");
    } else {
      console.error("\n❌ Error:", error.message);
    }
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

