import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { ethers } from "ethers";

// Load .env
const envPath = path.resolve(__dirname, '../../.env');
const envLocalPath = path.resolve(__dirname, '../../.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

/**
 * Test mínimo para verificar initiateResolution
 * 
 * Uso: pnpm ts-node smart-contracts/scripts/test-initiate-resolution.ts
 */

const CORE_CONTRACT = "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1";
const MARKET_ID = 6;
const RPC_URL = "https://opbnb-testnet-rpc.bnbchain.org";

// ABI mínimo necesario
const CORE_ABI = [
  "function getMarket(uint256 _marketId) external view returns (tuple(uint256 id, uint8 marketType, address creator, uint256 createdAt, uint256 resolutionTime, uint8 status, string metadata))",
  "function initiateResolution(uint256 _marketId) external",
  "function paused() external view returns (bool)",
  "function aiOracle() external view returns (address)",
  "function daoGovernance() external view returns (address)",
];

const AI_ORACLE_ABI = [
  "function predictionMarket() external view returns (address)",
  "function backendUrl() external view returns (string)",
  "function i_router() external view returns (address)",
  "function subscriptionId() external view returns (uint64)",
  "function donId() external view returns (bytes32)",
];

async function main() {
  console.log("🧪 Test mínimo para initiateResolution\n");
  console.log("=".repeat(80));

  // Configurar provider y wallet
  const privateKey = process.env.PRIVATE_KEY || "2003f926c578fea4a77ffdd98a288a3297ee12b8893505562422dd258e4a5765";
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("📝 Cuenta:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "BNB\n");

  // Conectar al contrato
  const core = new ethers.Contract(CORE_CONTRACT, CORE_ABI, wallet);

  console.log("=".repeat(80));
  console.log(`🔍 Verificando mercado #${MARKET_ID}\n`);

  try {
    // 1. Verificar si el contrato está pausado
    console.log("1️⃣ Verificando si el contrato está pausado...");
    try {
      const isPaused = await core.paused();
      console.log(`   Estado: ${isPaused ? "⛔ PAUSADO" : "✅ Activo"}\n`);
      if (isPaused) {
        console.log("❌ El contrato está pausado. No se pueden iniciar resoluciones.\n");
        return;
      }
    } catch (error: any) {
      console.log(`   ⚠️  No se pudo verificar pause status: ${error.message}\n`);
    }

    // 2. Verificar contratos requeridos
    console.log("2️⃣ Verificando contratos requeridos...");
    try {
      const aiOracleAddress = await core.aiOracle();
      const daoGovernanceAddress = await core.daoGovernance();
      const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
      
      console.log(`   AI Oracle: ${aiOracleAddress}`);
      console.log(`   DAO Governance: ${daoGovernanceAddress}\n`);
      
      if (aiOracleAddress.toLowerCase() === ZERO_ADDRESS.toLowerCase()) {
        console.log("⚠️  AI Oracle no está configurado (dirección cero)\n");
      } else {
        // Verificar configuración del AI Oracle
        const aiOracle = new ethers.Contract(aiOracleAddress, AI_ORACLE_ABI, provider);
        try {
          const predictionMarketAddress = await aiOracle.predictionMarket();
          const backendUrl = await aiOracle.backendUrl();
          
          const routerAddress = await aiOracle.i_router();
          const subscriptionId = await aiOracle.subscriptionId();
          const donId = await aiOracle.donId();
          
          console.log(`   🔍 AI Oracle configuración:`);
          console.log(`      predictionMarket configurado: ${predictionMarketAddress}`);
          console.log(`      backendUrl: ${backendUrl}`);
          console.log(`      Core contract: ${CORE_CONTRACT}`);
          console.log(`      ¿Coinciden?: ${predictionMarketAddress.toLowerCase() === CORE_CONTRACT.toLowerCase() ? "✅ SÍ" : "❌ NO"}`);
          console.log(`      Chainlink Router: ${routerAddress}`);
          console.log(`      Subscription ID: ${subscriptionId.toString()}`);
          console.log(`      DON ID: ${donId}\n`);
          
          if (predictionMarketAddress.toLowerCase() !== CORE_CONTRACT.toLowerCase()) {
            console.log("   ⚠️  PROBLEMA DETECTADO:");
            console.log(`      El AI Oracle tiene configurado 'predictionMarket' = ${predictionMarketAddress}`);
            console.log(`      Pero el Core contract es ${CORE_CONTRACT}`);
            console.log(`      El AI Oracle rechazará las llamadas del Core contract.\n`);
          }
          
          // Verificar si Chainlink Functions está configurado
          if (routerAddress.toLowerCase() === ZERO_ADDRESS.toLowerCase()) {
            console.log("   ⚠️  Chainlink Functions Router está en dirección cero");
            console.log("      El contrato debería usar modo manual (fulfillResolutionManual)\n");
          } else if (subscriptionId.toString() === "0") {
            console.log("   ⚠️  Subscription ID es cero - Chainlink Functions no está configurado\n");
          }
        } catch (error: any) {
          console.log(`   ⚠️  Error verificando AI Oracle: ${error.message}\n`);
        }
      }
      
      if (daoGovernanceAddress.toLowerCase() === ZERO_ADDRESS.toLowerCase()) {
        console.log("⚠️  DAO Governance no está configurado (dirección cero)\n");
      }
    } catch (error: any) {
      console.log(`   ⚠️  Error verificando contratos: ${error.message}\n`);
    }

    // 3. Obtener información del mercado
    console.log("3️⃣ Obteniendo información del mercado...");
    const marketInfo = await core.getMarket(MARKET_ID);
    
    const statusNames = ['Active', 'Resolving', 'Resolved', 'Disputed', 'Cancelled'];
    const marketTypes = ['Binary', 'Conditional', 'Subjective'];
    
    const status = Number(marketInfo.status);
    const marketType = Number(marketInfo.marketType);
    const resolutionTime = Number(marketInfo.resolutionTime);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = resolutionTime - currentTime;

    console.log(`   ID: ${marketInfo.id.toString()}`);
    console.log(`   Tipo: ${marketTypes[marketType] || 'Unknown'} (${marketType})`);
    console.log(`   Estado: ${statusNames[status] || 'Unknown'} (${status})`);
    console.log(`   Creador: ${marketInfo.creator}`);
    console.log(`   Creado: ${new Date(Number(marketInfo.createdAt) * 1000).toLocaleString()}`);
    console.log(`   Tiempo de resolución: ${new Date(resolutionTime * 1000).toLocaleString()}`);
    console.log(`   Tiempo actual: ${new Date(currentTime * 1000).toLocaleString()}`);
    
    if (timeRemaining > 0) {
      const hours = Math.floor(timeRemaining / 3600);
      const minutes = Math.floor((timeRemaining % 3600) / 60);
      console.log(`   Tiempo restante: ${hours}h ${minutes}m`);
    } else {
      console.log(`   ⏰ Tiempo de resolución HA PASADO`);
    }
    
    console.log(`   Metadata: ${marketInfo.metadata}\n`);

    // 4. Verificar requisitos
    console.log("4️⃣ Verificando requisitos para iniciar resolución...\n");
    
    const isActive = status === 0; // Active
    const timePassed = currentTime >= resolutionTime;
    const canResolve = isActive && timePassed;

    console.log(`   ✅ Estado Active: ${isActive ? "SÍ" : "NO"} (requerido)`);
    console.log(`   ✅ Tiempo pasado: ${timePassed ? "SÍ" : "NO"} (requerido)`);
    console.log(`   ${canResolve ? "✅" : "❌"} Puede resolver: ${canResolve ? "SÍ" : "NO"}\n`);

    if (!isActive) {
      console.log(`❌ El mercado NO está en estado Active. Estado actual: ${statusNames[status]} (${status})\n`);
      console.log("   Razones posibles:");
      if (status === 1) console.log("   - El mercado ya está siendo resuelto (Resolving)");
      if (status === 2) console.log("   - El mercado ya fue resuelto (Resolved)");
      if (status === 3) console.log("   - El mercado está en disputa (Disputed)");
      if (status === 4) console.log("   - El mercado fue cancelado (Cancelled)");
      return;
    }

    if (!timePassed) {
      console.log(`❌ El tiempo de resolución NO ha pasado aún.\n`);
      return;
    }

    // 5. Intentar iniciar resolución
    console.log("5️⃣ Intentando iniciar resolución...\n");
    
    try {
      // Estimar gas primero
      console.log("   📊 Estimando gas...");
      const gasEstimate = await core.initiateResolution.estimateGas(MARKET_ID);
      console.log(`   ✅ Gas estimado: ${gasEstimate.toString()}\n`);

      // Enviar transacción
      console.log("   📤 Enviando transacción...");
      const tx = await core.initiateResolution(MARKET_ID);
      console.log(`   ✅ Transacción enviada: ${tx.hash}`);
      console.log(`   🔗 Explorer: https://testnet.opbnbscan.com/tx/${tx.hash}\n`);

      console.log("   ⏳ Esperando confirmación...");
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log("   ✅ ✅ ✅ RESOLUCIÓN INICIADA EXITOSAMENTE ✅ ✅ ✅\n");
        console.log(`   Block: ${receipt.blockNumber}`);
        console.log(`   Gas usado: ${receipt.gasUsed.toString()}`);
      } else {
        console.log("   ❌ Transacción falló\n");
      }
    } catch (error: any) {
      console.log(`   ❌ Error al iniciar resolución:\n`);
      
      // Analizar el error
      const errorMessage = error.message || error.toString();
      console.log(`   Mensaje: ${errorMessage}\n`);
      
      if (errorMessage.includes("Not active") || errorMessage.includes("not active")) {
        console.log("   🔍 Causa: El mercado no está en estado Active");
      } else if (errorMessage.includes("Not ready") || errorMessage.includes("not ready")) {
        console.log("   🔍 Causa: El tiempo de resolución no ha pasado");
      } else if (errorMessage.includes("revert")) {
        console.log("   🔍 Causa: El contrato rechazó la transacción (revert)");
        console.log("   Posibles razones:");
        console.log("   - El mercado no está en estado Active");
        console.log("   - El tiempo de resolución no ha pasado");
        console.log("   - El contrato AI Oracle o DAO Governance tiene problemas");
        console.log("   - El mercado no existe");
      }
      
      // Intentar obtener más información del error
      if (error.data) {
        console.log(`   Error data: ${error.data}`);
      }
      if (error.reason) {
        console.log(`   Reason: ${error.reason}`);
      }
    }

  } catch (error: any) {
    console.log(`\n❌ Error general: ${error.message}`);
    if (error.message.includes("Market does not exist")) {
      console.log("\n🔍 El mercado no existe en el contrato.");
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ Test completado");
  console.log("=".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

