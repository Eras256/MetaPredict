import * as dotenv from "dotenv";
import * as path from "path";
import { ethers } from "hardhat";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Script para configurar Chainlink Functions correctamente según documentación oficial
 * 
 * Pasos según documentación oficial:
 * 1. Verificar que la red esté soportada (opBNB Testnet)
 * 2. Obtener dirección del Router de Chainlink Functions para la red
 * 3. Crear suscripción en https://functions.chain.link
 * 4. Obtener DON ID para la red
 * 5. Configurar el contrato AIOracle con estos valores
 */

// Direcciones oficiales de Chainlink Functions Router según documentación
// Fuente: https://docs.chain.link/chainlink-functions/supported-networks
const CHAINLINK_FUNCTIONS_ROUTERS: { [chainId: number]: string } = {
  // Ethereum Sepolia Testnet
  11155111: "0xb83E47C2bC06B3B0C34B3473a9B8F0b0e0e0e0e0", // Ejemplo - verificar en docs
  // BSC Testnet
  97: "0x6E2dc0F9DB014Ae19888F539E59285D2Ea04244C", // Verificar en docs oficiales
  // opBNB Testnet (5611) - Verificar si está soportado
  5611: "0x0000000000000000000000000000000000000000", // Por ahora ZeroAddress = modo manual
  // Polygon Mumbai Testnet
  80001: "0x6E2dc0F9DB014Ae19888F539E59285D2Ea04244C", // Verificar en docs oficiales
};

// DON IDs según documentación oficial
// Fuente: https://docs.chain.link/chainlink-functions/supported-networks
// ⚠️ IMPORTANTE: Verifica los DON IDs actualizados en la documentación oficial
const CHAINLINK_DON_IDS: { [chainId: number]: string } = {
  97: process.env.CHAINLINK_DON_ID_BSC_TESTNET || "fun-bsc-testnet-1",
  5611: process.env.CHAINLINK_DON_ID || "0x0000000000000000000000000000000000000000000000000000000000000000", // Por ahora ZeroHash
};

const CURRENT_AI_ORACLE = "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c";
const CORE_CONTRACT = "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1";
const CHAIN_ID = 5611; // opBNB Testnet

async function main() {
  console.log("🔧 Configurando Chainlink Functions según documentación oficial...\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Configurando con cuenta: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB\n`);

  // Verificar si opBNB Testnet está soportado
  console.log("1️⃣ Verificando soporte de Chainlink Functions en opBNB Testnet...");
  const routerAddress = CHAINLINK_FUNCTIONS_ROUTERS[CHAIN_ID];
  const donId = CHAINLINK_DON_IDS[CHAIN_ID] || ethers.ZeroHash;

  if (!routerAddress || routerAddress === ethers.ZeroAddress) {
    console.log("   ⚠️  opBNB Testnet NO está soportado oficialmente por Chainlink Functions");
    console.log("   📚 Verifica en: https://docs.chain.link/chainlink-functions/supported-networks");
    console.log("   💡 Usando modo manual (fulfillResolutionManual) hasta que Chainlink Functions esté disponible\n");
    
    // Configurar para modo manual
    await configureManualMode(deployer);
    return;
  }

  console.log(`   ✅ Router encontrado: ${routerAddress}`);
  console.log(`   ✅ DON ID: ${donId}\n`);

  // Verificar subscription ID
  console.log("2️⃣ Verificando Subscription ID...");
  const subscriptionId = process.env.CHAINLINK_SUBSCRIPTION_ID 
    ? BigInt(process.env.CHAINLINK_SUBSCRIPTION_ID).toString()
    : "0";

  if (subscriptionId === "0") {
    console.log("   ⚠️  Subscription ID no configurado");
    console.log("   📝 Pasos para crear suscripción:");
    console.log("      1. Ve a https://functions.chain.link");
    console.log("      2. Conecta tu wallet");
    console.log("      3. Crea una nueva suscripción");
    console.log("      4. Financia la suscripción con LINK tokens");
    console.log("      5. Agrega el contrato AIOracle como consumidor");
    console.log("      6. Copia el Subscription ID y configúralo en .env como CHAINLINK_SUBSCRIPTION_ID\n");
    
    console.log("   💡 Por ahora, configurando modo manual...\n");
    await configureManualMode(deployer);
    return;
  }

  console.log(`   ✅ Subscription ID: ${subscriptionId}\n`);

  // Configurar contrato
  console.log("3️⃣ Configurando contrato AIOracle...");
  const AIOracle = await ethers.getContractFactory("AIOracle");
  const aiOracle = AIOracle.attach(CURRENT_AI_ORACLE);

  try {
    const owner = await aiOracle.owner();
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log(`   ❌ No eres el owner. Owner actual: ${owner}`);
      return;
    }

    // Verificar configuración actual
    const currentRouter = await aiOracle.i_router();
    const currentSubscriptionId = await aiOracle.subscriptionId();
    const currentDonId = await aiOracle.donId();

    console.log(`   Configuración actual:`);
    console.log(`     Router: ${currentRouter}`);
    console.log(`     Subscription ID: ${currentSubscriptionId.toString()}`);
    console.log(`     DON ID: ${currentDonId}\n`);

    // Si el contrato tiene la función setSubscriptionId, actualizar
    try {
      if (currentSubscriptionId.toString() !== subscriptionId) {
        console.log(`   🔄 Actualizando Subscription ID a ${subscriptionId}...`);
        const tx = await aiOracle.setSubscriptionId(BigInt(subscriptionId));
        await tx.wait();
        console.log(`   ✅ Subscription ID actualizado\n`);
      }
    } catch (error: any) {
      if (error.message?.includes("setSubscriptionId")) {
        console.log(`   ⚠️  El contrato no tiene la función setSubscriptionId`);
        console.log(`   💡 Necesitas redesplegar el contrato con la nueva versión\n`);
      } else {
        throw error;
      }
    }

    // Verificar que predictionMarket esté configurado
    const predictionMarket = await aiOracle.predictionMarket();
    if (predictionMarket.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
      console.log(`   🔄 Configurando predictionMarket a ${CORE_CONTRACT}...`);
      const tx = await aiOracle.setPredictionMarket(CORE_CONTRACT);
      await tx.wait();
      console.log(`   ✅ predictionMarket configurado\n`);
    }

    console.log("✅ Configuración completada!\n");
    console.log("📋 RESUMEN:");
    console.log(`   Router: ${routerAddress}`);
    console.log(`   Subscription ID: ${subscriptionId}`);
    console.log(`   DON ID: ${donId}`);
    console.log(`   predictionMarket: ${CORE_CONTRACT}\n`);

  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log("=".repeat(80));
}

async function configureManualMode(deployer: any) {
  console.log("🔧 Configurando modo manual...\n");

  const AIOracle = await ethers.getContractFactory("AIOracle");
  const aiOracle = AIOracle.attach(CURRENT_AI_ORACLE);

  try {
    const owner = await aiOracle.owner();
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log(`   ❌ No eres el owner. Owner actual: ${owner}\n`);
      return;
    }

    // Verificar si tiene setSubscriptionId
    try {
      const currentSubscriptionId = await aiOracle.subscriptionId();
      if (currentSubscriptionId.toString() !== "0") {
        console.log(`   🔄 Configurando Subscription ID a 0 (modo manual)...`);
        const tx = await aiOracle.setSubscriptionId(0);
        await tx.wait();
        console.log(`   ✅ Modo manual activado\n`);
      } else {
        console.log(`   ✅ Ya está en modo manual (subscriptionId = 0)\n`);
      }
    } catch (error: any) {
      if (error.message?.includes("setSubscriptionId")) {
        console.log(`   ⚠️  El contrato no tiene la función setSubscriptionId`);
        console.log(`   💡 Necesitas redesplegar el contrato con la nueva versión\n`);
        console.log(`   📝 Ejecuta: pnpm ts-node smart-contracts/scripts/redeploy-ai-oracle.ts\n`);
      } else {
        throw error;
      }
    }

    // Verificar predictionMarket
    const predictionMarket = await aiOracle.predictionMarket();
    if (predictionMarket.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
      console.log(`   🔄 Configurando predictionMarket...`);
      const tx = await aiOracle.setPredictionMarket(CORE_CONTRACT);
      await tx.wait();
      console.log(`   ✅ predictionMarket configurado\n`);
    }

    console.log("✅ Modo manual configurado correctamente");
    console.log("📝 Cuando llames a initiateResolution:");
    console.log("   - El contrato devolverá requestId = 0");
    console.log("   - Luego debes llamar a fulfillResolutionManual para resolver");
    console.log("   - Ejemplo: fulfillResolutionManual(marketId, outcome, confidence)\n");

  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

