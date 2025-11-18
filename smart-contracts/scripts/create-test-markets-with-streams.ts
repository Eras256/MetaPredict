import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
// Import ethers - @nomicfoundation/hardhat-toolbox provides this
// @ts-ignore - Hardhat types may not be fully updated
import { ethers } from "hardhat";

// Load .env from root directory
const envPath = path.resolve(__dirname, '../../.env');
const envLocalPath = path.resolve(__dirname, '../../.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

/**
 * Script para crear mercados de prueba con Chainlink Data Streams
 * 
 * Este script crea mercados de ejemplo y los configura con Stream IDs
 */
async function main() {
  console.log("🎯 Creando mercados de prueba con Chainlink Data Streams...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Usando cuenta:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB\n");

  // Load deployment addresses
  const deploymentsPath = path.join(__dirname, "../deployments/opbnb-testnet.json");
  if (!fs.existsSync(deploymentsPath)) {
    console.error(`❌ Error: No se encontró el archivo de deployments en ${deploymentsPath}`);
    process.exit(1);
  }
  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const contracts = deployments.contracts;

  // Get contracts
  const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
  const core = PredictionMarketCore.attach(contracts.core);

  const ChainlinkDataStreamsIntegration = await ethers.getContractFactory("ChainlinkDataStreamsIntegration");
  const dataStreams = ChainlinkDataStreamsIntegration.attach(contracts.dataStreamsIntegration);

  console.log("✅ Contratos encontrados:");
  console.log("   Core:", contracts.core);
  console.log("   Data Streams:", contracts.dataStreamsIntegration, "\n");

  // Stream IDs
  const streamIds = {
    BTC_USD: process.env.CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID || ethers.ZeroHash,
    ETH_USD: process.env.CHAINLINK_DATA_STREAMS_ETH_USD_STREAM_ID || ethers.ZeroHash,
    BNB_USD: process.env.CHAINLINK_DATA_STREAMS_BNB_USD_STREAM_ID || ethers.ZeroHash,
  };

  // Calcular resolution time (24 horas desde ahora)
  const resolutionTime = Math.floor(Date.now() / 1000) + (24 * 60 * 60);

  // Mercado 1: BTC/USD
  console.log("1️⃣  Creando mercado: ¿BTC superará $50K?\n");
  try {
    const tx1 = await core.createBinaryMarket(
      "¿Bitcoin superará $50,000 USD?",
      "Predicción sobre si el precio de Bitcoin alcanzará o superará los $50,000 USD antes de la fecha de resolución.",
      resolutionTime,
      "ipfs://QmTestBTC" // IPFS hash de ejemplo
    );
    const receipt1 = await tx1.wait();
    
    // Obtener el marketId del evento o del counter
    const marketId1 = await core.marketCounter();
    console.log("   ✅ Mercado creado - ID:", marketId1.toString());
    console.log("   📝 TX:", tx1.hash);

    // Esperar un poco para que se procese
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Configurar Stream ID para BTC/USD
    const btcTargetPrice = BigInt(50000) * BigInt(1e8);
    const tx1Config = await dataStreams.configureMarketStream(
      marketId1,
      streamIds.BTC_USD,
      btcTargetPrice
    );
    await tx1Config.wait();
    console.log("   ✅ Stream ID configurado: BTC/USD");
    console.log("   ✅ Precio objetivo: $50,000");
    console.log("   📝 Config TX:", tx1Config.hash, "\n");
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
    if (error.message.includes("Only core")) {
      console.error("   💡 El mercado debe crearse a través del Core contract (ya lo estamos haciendo)");
    }
    console.error("");
  }

  // Mercado 2: ETH/USD
  console.log("2️⃣  Creando mercado: ¿ETH superará $3,000?\n");
  try {
    const tx2 = await core.createBinaryMarket(
      "¿Ethereum superará $3,000 USD?",
      "Predicción sobre si el precio de Ethereum alcanzará o superará los $3,000 USD antes de la fecha de resolución.",
      resolutionTime,
      "ipfs://QmTestETH"
    );
    const receipt2 = await tx2.wait();
    
    // Obtener el marketId del counter
    const marketId2 = await core.marketCounter();
    console.log("   ✅ Mercado creado - ID:", marketId2.toString());
    console.log("   📝 TX:", tx2.hash);

    // Esperar un poco para que se procese
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Configurar Stream ID para ETH/USD
    const ethTargetPrice = BigInt(3000) * BigInt(1e8);
    const tx2Config = await dataStreams.configureMarketStream(
      marketId2,
      streamIds.ETH_USD,
      ethTargetPrice
    );
    await tx2Config.wait();
    console.log("   ✅ Stream ID configurado: ETH/USD");
    console.log("   ✅ Precio objetivo: $3,000");
    console.log("   📝 Config TX:", tx2Config.hash, "\n");
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
    if (error.message.includes("Only core")) {
      console.error("   💡 El mercado debe crearse a través del Core contract (ya lo estamos haciendo)");
    }
    console.error("");
  }

  // Mercado 3: BNB/USD
  console.log("3️⃣  Creando mercado: ¿BNB superará $400?\n");
  try {
    const tx3 = await core.createBinaryMarket(
      "¿BNB superará $400 USD?",
      "Predicción sobre si el precio de BNB alcanzará o superará los $400 USD antes de la fecha de resolución.",
      resolutionTime,
      "ipfs://QmTestBNB"
    );
    const receipt3 = await tx3.wait();
    
    // Obtener el marketId del counter
    const marketId3 = await core.marketCounter();
    console.log("   ✅ Mercado creado - ID:", marketId3.toString());
    console.log("   📝 TX:", tx3.hash);

    // Esperar un poco para que se procese
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Configurar Stream ID para BNB/USD
    const bnbTargetPrice = BigInt(400) * BigInt(1e8);
    const tx3Config = await dataStreams.configureMarketStream(
      marketId3,
      streamIds.BNB_USD,
      bnbTargetPrice
    );
    await tx3Config.wait();
    console.log("   ✅ Stream ID configurado: BNB/USD");
    console.log("   ✅ Precio objetivo: $400");
    console.log("   📝 Config TX:", tx3Config.hash, "\n");
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
    if (error.message.includes("Only core")) {
      console.error("   💡 El mercado debe crearse a través del Core contract (ya lo estamos haciendo)");
    }
    console.error("");
  }

  console.log("✅ Mercados de prueba creados!\n");
  console.log("📝 Próximos pasos:");
  console.log("1. Obtén reportes de Data Streams API para cada Stream ID");
  console.log("2. Usa verifyPriceReport() para verificar precios on-chain");
  console.log("3. El contrato resolverá automáticamente cuando se alcance el precio objetivo");
  console.log("4. O usa checkPriceCondition() para verificar si se alcanzó el objetivo\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

