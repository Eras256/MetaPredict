import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { ethers } from "hardhat";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CURRENT_AI_ORACLE = "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c";
const CORE_CONTRACT = "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1";
const FRONTEND_ADDRESSES_FILE = path.resolve(__dirname, '../../frontend/lib/contracts/addresses.ts');

async function main() {
  console.log("🚀 Redesplegando AI Oracle y actualizando frontend...\n");
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
    backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "https://your-backend-url.com/api/oracle/resolve";
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

  console.log(`   predictionMarket: ${configuredMarket}`);
  console.log(`   subscriptionId: ${configuredSubscriptionId.toString()}`);
  console.log(`   router: ${router} (configurado en constructor)`);
  console.log(`   ¿Modo manual activado?: ${configuredSubscriptionId.toString() === "0" || router === ethers.ZeroAddress ? "✅ SÍ" : "❌ NO"}\n`);

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

  // Actualizar frontend
  console.log("6️⃣ Actualizando frontend...");
  try {
    if (!fs.existsSync(FRONTEND_ADDRESSES_FILE)) {
      console.log(`   ⚠️  Archivo no encontrado: ${FRONTEND_ADDRESSES_FILE}`);
    } else {
      let addressesContent = fs.readFileSync(FRONTEND_ADDRESSES_FILE, 'utf-8');
      
      // Actualizar la dirección del AI_ORACLE
      const oldAddressRegex = /AI_ORACLE:\s*getAddress\([^,]+,\s*'([^']+)'\)/;
      const newAddressLine = `AI_ORACLE: getAddress(process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS, '${aiOracleAddress}')`;
      
      if (oldAddressRegex.test(addressesContent)) {
        addressesContent = addressesContent.replace(
          oldAddressRegex,
          newAddressLine
        );
        fs.writeFileSync(FRONTEND_ADDRESSES_FILE, addressesContent, 'utf-8');
        console.log(`   ✅ Frontend actualizado: ${FRONTEND_ADDRESSES_FILE}`);
        console.log(`   ✅ Nueva dirección AI_ORACLE: ${aiOracleAddress}\n`);
      } else {
        console.log(`   ⚠️  No se encontró el patrón esperado en addresses.ts`);
        console.log(`   💡 Actualiza manualmente: AI_ORACLE: getAddress(..., '${aiOracleAddress}')\n`);
      }
    }
  } catch (error: any) {
    console.log(`   ⚠️  Error actualizando frontend: ${error.message}\n`);
  }

  // Actualizar .env.example si existe
  console.log("7️⃣ Actualizando .env.example...");
  try {
    const envExamplePath = path.resolve(__dirname, '../../env.example');
    if (fs.existsSync(envExamplePath)) {
      let envContent = fs.readFileSync(envExamplePath, 'utf-8');
      
      // Actualizar NEXT_PUBLIC_AI_ORACLE_ADDRESS
      const envRegex = /NEXT_PUBLIC_AI_ORACLE_ADDRESS=0x[a-fA-F0-9]+/;
      if (envRegex.test(envContent)) {
        envContent = envContent.replace(
          envRegex,
          `NEXT_PUBLIC_AI_ORACLE_ADDRESS=${aiOracleAddress}`
        );
        fs.writeFileSync(envExamplePath, envContent, 'utf-8');
        console.log(`   ✅ .env.example actualizado\n`);
      }
    }
  } catch (error: any) {
    console.log(`   ⚠️  Error actualizando .env.example: ${error.message}\n`);
  }

  console.log("=".repeat(80));
  console.log("✅ Redespliegue y actualización completados!\n");
  console.log("📋 RESUMEN:");
  console.log(`   Contrato anterior: ${CURRENT_AI_ORACLE}`);
  console.log(`   Nuevo contrato: ${aiOracleAddress}`);
  console.log(`   Core contract: ${CORE_CONTRACT}`);
  console.log(`   Modo manual: ✅ Activado (subscriptionId = 0)\n`);
  console.log("📝 PRÓXIMOS PASOS:");
  console.log("   1. ✅ Frontend actualizado automáticamente");
  console.log("   2. Si usas variables de entorno, actualiza NEXT_PUBLIC_AI_ORACLE_ADDRESS en tu .env");
  console.log("   3. Reinicia el servidor de desarrollo del frontend");
  console.log("   4. Cuando llames a initiateResolution, el contrato devolverá requestId = 0");
  console.log("   5. Luego debes llamar a fulfillResolutionManual para resolver el mercado");
  console.log("   6. Ejemplo: fulfillResolutionManual(marketId, outcome, confidence)");
  console.log("      - outcome: 1=Yes, 2=No, 3=Invalid");
  console.log("      - confidence: 0-100\n");
  console.log("🔗 Verificar en opBNBScan:");
  console.log(`   https://testnet.opbnbscan.com/address/${aiOracleAddress}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

