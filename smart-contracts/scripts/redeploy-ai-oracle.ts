import * as dotenv from "dotenv";
import * as path from "path";
import { ethers } from "hardhat";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CURRENT_AI_ORACLE = "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c";
const CORE_CONTRACT = "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1";

async function main() {
  console.log("🚀 Redesplegando AI Oracle con soporte para modo manual...\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Desplegando con cuenta: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB\n`);

  // Obtener configuración actual del contrato viejo
  console.log("1️⃣ Obteniendo configuración del contrato actual...");
  const OldAIOracle = await ethers.getContractFactory("AIOracle");
  const oldOracle = OldAIOracle.attach(CURRENT_AI_ORACLE);

  let backendUrl = "";
  try {
    backendUrl = await oldOracle.backendUrl();
    console.log(`   ✅ Backend URL: ${backendUrl}`);
  } catch (error: any) {
    console.log(`   ⚠️  No se pudo leer backendUrl: ${error.message}`);
    backendUrl = process.env.BACKEND_URL || "https://your-backend-url.com/api/oracle/resolve";
  }

  // Configuración: Router = ZeroAddress, SubscriptionId = 0 para modo manual
  const router = ethers.ZeroAddress; // Zero address = modo manual
  const donId = ethers.ZeroHash; // No necesario en modo manual
  const subscriptionId = 0; // 0 = modo manual
  const newBackendUrl = backendUrl || process.env.BACKEND_URL || "https://your-backend-url.com/api/oracle/resolve";

  console.log("\n2️⃣ Desplegando nuevo contrato AI Oracle...");
  console.log(`   Router: ${router} (ZeroAddress = modo manual)`);
  console.log(`   Subscription ID: ${subscriptionId} (0 = modo manual)`);
  console.log(`   DON ID: ${donId}`);
  console.log(`   Backend URL: ${newBackendUrl}\n`);

  const AIOracle = await ethers.getContractFactory("AIOracle");
  const aiOracle = await AIOracle.deploy(
    router,
    donId,
    subscriptionId,
    newBackendUrl
  );

  await aiOracle.waitForDeployment();
  const aiOracleAddress = await aiOracle.getAddress();
  console.log(`   ✅ Nuevo AI Oracle desplegado en: ${aiOracleAddress}\n`);

  // Configurar predictionMarket
  console.log("3️⃣ Configurando nuevo contrato...");
  await aiOracle.setPredictionMarket(CORE_CONTRACT);
  console.log(`   ✅ predictionMarket configurado: ${CORE_CONTRACT}\n`);

  // Verificar configuración
  console.log("4️⃣ Verificando configuración...");
  const configuredMarket = await aiOracle.predictionMarket();
  const configuredSubscriptionId = await aiOracle.subscriptionId();
  const configuredRouter = await aiOracle.i_router();

  console.log(`   predictionMarket: ${configuredMarket}`);
  console.log(`   subscriptionId: ${configuredSubscriptionId.toString()}`);
  console.log(`   router: ${configuredRouter}`);
  console.log(`   ¿Modo manual activado?: ${configuredSubscriptionId.toString() === "0" || configuredRouter === ethers.ZeroAddress ? "✅ SÍ" : "❌ NO"}\n`);

  // Actualizar Core contract para usar el nuevo AI Oracle
  console.log("5️⃣ Actualizando Core contract con nuevo AI Oracle...");
  const CoreFactory = await ethers.getContractFactory("PredictionMarketCore");
  const core = CoreFactory.attach(CORE_CONTRACT);

  try {
    const currentOwner = await core.owner();
    if (currentOwner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log(`   ⚠️  No eres el owner del Core contract. Owner: ${currentOwner}`);
      console.log(`   ⚠️  Necesitas actualizar manualmente el AI Oracle en el Core contract.\n`);
    } else {
      await core.updateModule("aiOracle", aiOracleAddress);
      console.log(`   ✅ Core contract actualizado con nuevo AI Oracle\n`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  Error actualizando Core: ${error.message}\n`);
  }

  console.log("=".repeat(80));
  console.log("✅ Redespliegue completado!\n");
  console.log("📋 RESUMEN:");
  console.log(`   Contrato anterior: ${CURRENT_AI_ORACLE}`);
  console.log(`   Nuevo contrato: ${aiOracleAddress}`);
  console.log(`   Core contract: ${CORE_CONTRACT}`);
  console.log(`   Modo manual: ✅ Activado (subscriptionId = 0)\n`);
  console.log("📝 PRÓXIMOS PASOS:");
  console.log("   1. Actualizar frontend/lib/contracts/addresses.ts con la nueva dirección del AI Oracle");
  console.log("   2. Cuando llames a initiateResolution, el contrato devolverá requestId = 0");
  console.log("   3. Luego debes llamar a fulfillResolutionManual para resolver el mercado");
  console.log("   4. Ejemplo: fulfillResolutionManual(marketId, outcome, confidence)");
  console.log("      - outcome: 1=Yes, 2=No, 3=Invalid");
  console.log("      - confidence: 0-100\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

