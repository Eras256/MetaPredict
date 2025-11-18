import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
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
 * Script para configurar mercados con Chainlink Data Streams
 * 
 * Este script:
 * 1. Configura Stream IDs para mercados existentes
 * 2. Establece precios objetivo para resolución automática
 * 3. Permite crear mercados de prueba con Data Streams
 */
async function main() {
  console.log("🔗 Configurando Chainlink Data Streams para mercados...\n");

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

  // Get Data Streams Integration contract
  const dataStreamsAddress = contracts.dataStreamsIntegration;
  if (!dataStreamsAddress || dataStreamsAddress === ethers.ZeroAddress) {
    console.error("❌ Error: ChainlinkDataStreamsIntegration no está desplegado");
    console.error("   Despliega primero el contrato con: pnpm run deploy:testnet");
    process.exit(1);
  }

  const ChainlinkDataStreamsIntegration = await ethers.getContractFactory("ChainlinkDataStreamsIntegration");
  const dataStreams = ChainlinkDataStreamsIntegration.attach(dataStreamsAddress);

  console.log("✅ Contrato Data Streams encontrado:", dataStreamsAddress, "\n");

  // Stream IDs from .env
  const streamIds = {
    BTC_USD: process.env.CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID || ethers.ZeroHash,
    ETH_USD: process.env.CHAINLINK_DATA_STREAMS_ETH_USD_STREAM_ID || ethers.ZeroHash,
    USDT_USD: process.env.CHAINLINK_DATA_STREAMS_USDT_USD_STREAM_ID || ethers.ZeroHash,
    BNB_USD: process.env.CHAINLINK_DATA_STREAMS_BNB_USD_STREAM_ID || ethers.ZeroHash,
    SOL_USD: process.env.CHAINLINK_DATA_STREAMS_SOL_USD_STREAM_ID || ethers.ZeroHash,
    XRP_USD: process.env.CHAINLINK_DATA_STREAMS_XRP_USD_STREAM_ID || ethers.ZeroHash,
    USDC_USD: process.env.CHAINLINK_DATA_STREAMS_USDC_USD_STREAM_ID || ethers.ZeroHash,
    DOGE_USD: process.env.CHAINLINK_DATA_STREAMS_DOGE_USD_STREAM_ID || ethers.ZeroHash,
  };

  // Verificar que los Stream IDs estén configurados
  const missingStreams = Object.entries(streamIds)
    .filter(([_, id]) => id === ethers.ZeroHash)
    .map(([name, _]) => name);

  if (missingStreams.length > 0) {
    console.warn("⚠️  Stream IDs faltantes en .env.local:");
    missingStreams.forEach(name => console.warn(`   - ${name}`));
    console.warn("\n   Configura los Stream IDs en .env.local antes de continuar\n");
  }

  // Ejemplos de configuración de mercados
  console.log("📊 Ejemplos de configuración de mercados:\n");

  // Ejemplo 1: BTC/USD - "¿BTC superará $50K?"
  const btcMarketId = 1; // Cambiar por el ID real del mercado
  const btcTargetPrice = BigInt(50000) * BigInt(1e8); // $50,000 en formato del stream

  console.log("1️⃣  Configurando mercado BTC/USD...");
  console.log(`   Market ID: ${btcMarketId}`);
  console.log(`   Stream ID: ${streamIds.BTC_USD}`);
  console.log(`   Precio objetivo: $50,000\n`);

  try {
    const tx = await dataStreams.configureMarketStream(
      btcMarketId,
      streamIds.BTC_USD,
      btcTargetPrice
    );
    await tx.wait();
    console.log("   ✅ Mercado BTC/USD configurado exitosamente");
    console.log("   📝 TX:", tx.hash, "\n");
  } catch (error: any) {
    console.log("   ⚠️  Error (puede ser que el mercado no exista aún):", error.message, "\n");
  }

  // Ejemplo 2: ETH/USD - "¿ETH superará $3,000?"
  const ethMarketId = 2; // Cambiar por el ID real del mercado
  const ethTargetPrice = BigInt(3000) * BigInt(1e8); // $3,000

  console.log("2️⃣  Configurando mercado ETH/USD...");
  console.log(`   Market ID: ${ethMarketId}`);
  console.log(`   Stream ID: ${streamIds.ETH_USD}`);
  console.log(`   Precio objetivo: $3,000\n`);

  try {
    const tx = await dataStreams.configureMarketStream(
      ethMarketId,
      streamIds.ETH_USD,
      ethTargetPrice
    );
    await tx.wait();
    console.log("   ✅ Mercado ETH/USD configurado exitosamente");
    console.log("   📝 TX:", tx.hash, "\n");
  } catch (error: any) {
    console.log("   ⚠️  Error (puede ser que el mercado no exista aún):", error.message, "\n");
  }

  // Ejemplo 3: BNB/USD - "¿BNB superará $400?"
  const bnbMarketId = 3; // Cambiar por el ID real del mercado
  const bnbTargetPrice = BigInt(400) * BigInt(1e8); // $400

  console.log("3️⃣  Configurando mercado BNB/USD...");
  console.log(`   Market ID: ${bnbMarketId}`);
  console.log(`   Stream ID: ${streamIds.BNB_USD}`);
  console.log(`   Precio objetivo: $400\n`);

  try {
    const tx = await dataStreams.configureMarketStream(
      bnbMarketId,
      streamIds.BNB_USD,
      bnbTargetPrice
    );
    await tx.wait();
    console.log("   ✅ Mercado BNB/USD configurado exitosamente");
    console.log("   📝 TX:", tx.hash, "\n");
  } catch (error: any) {
    console.log("   ⚠️  Error (puede ser que el mercado no exista aún):", error.message, "\n");
  }

  console.log("✅ Configuración completada!\n");
  console.log("📝 Próximos pasos:");
  console.log("1. Crea mercados usando createBinaryMarket() en PredictionMarketCore");
  console.log("2. Usa este script para configurar los Stream IDs después de crear los mercados");
  console.log("3. Obtén reportes de Data Streams API y verifica on-chain");
  console.log("4. El contrato resolverá automáticamente cuando se alcance el precio objetivo\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

