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
 * Script para verificar reportes de Chainlink Data Streams
 * 
 * Este script:
 * 1. Obtiene un reporte de Data Streams (simulado o real)
 * 2. Verifica el reporte on-chain
 * 3. Verifica si se alcanzó el precio objetivo
 * 
 * NOTA: Para obtener reportes reales, usa la API de Chainlink Data Streams:
 * https://docs.chain.link/data-streams/streams-api-reference
 */
async function main() {
  console.log("🔍 Verificando reporte de Chainlink Data Streams...\n");

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
  const ChainlinkDataStreamsIntegration = await ethers.getContractFactory("ChainlinkDataStreamsIntegration");
  const dataStreams = ChainlinkDataStreamsIntegration.attach(contracts.dataStreamsIntegration);

  console.log("✅ Contrato Data Streams:", contracts.dataStreamsIntegration, "\n");

  // Obtener argumentos de línea de comandos
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("❌ Uso: pnpm hardhat run scripts/verify-price-report.ts --network opBNBTestnet <MARKET_ID> <REPORT_HEX>");
    console.error("   Ejemplo: pnpm hardhat run scripts/verify-price-report.ts --network opBNBTestnet 1 0x...");
    console.error("\n💡 Para obtener un reporte real:");
    console.error("   1. Consulta la API de Data Streams: https://api.chain.link/data-streams/streams");
    console.error("   2. Obtén el reporte para el Stream ID que necesitas");
    console.error("   3. Pasa el reporte como argumento a este script\n");
    process.exit(1);
  }

  const marketId = BigInt(args[0]);
  const reportHex = args[1];

  console.log("📊 Parámetros:");
  console.log("   Market ID:", marketId.toString());
  console.log("   Report (hex):", reportHex.substring(0, 20) + "...", "\n");

  // Verificar reporte
  console.log("🔍 Verificando reporte on-chain...\n");
  try {
    const reportBytes = ethers.getBytes(reportHex);
    const tx = await dataStreams.verifyPriceReport(marketId, reportBytes);
    const receipt = await tx.wait();
    console.log("   ✅ Reporte verificado exitosamente");
    console.log("   📝 TX:", tx.hash);

    // Obtener precio verificado
    const [price, timestamp, isStale] = await dataStreams.getLastVerifiedPrice(marketId);
    console.log("\n   📊 Precio verificado:");
    console.log("   Precio:", price.toString());
    console.log("   Timestamp:", timestamp.toString());
    console.log("   Obsoleto:", isStale ? "Sí" : "No");

    // Verificar condición de precio
    const [conditionMet, currentPrice, targetPrice] = await dataStreams.checkPriceCondition(marketId);
    console.log("\n   🎯 Condición de precio:");
    console.log("   Condición alcanzada:", conditionMet ? "✅ Sí" : "❌ No");
    console.log("   Precio actual:", currentPrice.toString());
    console.log("   Precio objetivo:", targetPrice.toString());

    if (conditionMet) {
      console.log("\n   🎉 ¡El precio objetivo fue alcanzado! El mercado puede resolverse automáticamente.");
    }
  } catch (error: any) {
    console.error("   ❌ Error verificando reporte:", error.message);
    if (error.message.includes("InvalidPriceId")) {
      console.error("   💡 El mercado no tiene un Stream ID configurado. Usa configureMarketStream() primero.");
    } else if (error.message.includes("InvalidPriceReport")) {
      console.error("   💡 El reporte no es válido. Verifica que sea un reporte válido de Data Streams.");
    } else if (error.message.includes("PythPriceStale")) {
      console.error("   💡 El precio está obsoleto. Obtén un reporte más reciente.");
    }
  }

  console.log("\n✅ Verificación completada!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

