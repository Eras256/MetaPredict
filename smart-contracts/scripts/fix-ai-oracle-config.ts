import * as dotenv from "dotenv";
import * as path from "path";
import { ethers } from "ethers";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const AI_ORACLE_ADDRESS = "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c";
const RPC_URL = "https://opbnb-testnet-rpc.bnbchain.org";

const AI_ORACLE_ABI = [
  "function owner() external view returns (address)",
  "function subscriptionId() external view returns (uint64)",
  "function setSubscriptionId(uint64 _subscriptionId) external",
  "function predictionMarket() external view returns (address)",
];

async function main() {
  console.log("🔧 Configurando AI Oracle para modo manual...\n");
  console.log("=".repeat(80));

  const privateKey = process.env.PRIVATE_KEY || "2003f926c578fea4a77ffdd98a288a3297ee12b8893505562422dd258e4a5765";
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`📝 Wallet: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB\n`);

  const aiOracle = new ethers.Contract(AI_ORACLE_ADDRESS, AI_ORACLE_ABI, wallet);

  try {
    // Verificar owner
    const owner = await aiOracle.owner();
    console.log(`👤 Owner del contrato: ${owner}`);
    console.log(`👤 Wallet actual: ${wallet.address}`);
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log("\n❌ ERROR: No eres el owner del contrato.");
      console.log(`   Necesitas usar la wallet: ${owner}`);
      return;
    }

    // Verificar subscriptionId actual
    const currentSubscriptionId = await aiOracle.subscriptionId();
    console.log(`\n📊 Subscription ID actual: ${currentSubscriptionId.toString()}`);

    if (currentSubscriptionId.toString() === "0") {
      console.log("✅ El contrato ya está configurado para modo manual (subscriptionId = 0)");
      console.log("   No se necesita hacer cambios.\n");
      return;
    }

    // Intentar actualizar subscriptionId a 0
    console.log("\n🔄 Actualizando subscriptionId a 0 para activar modo manual...");
    const tx = await aiOracle.setSubscriptionId(0);
    console.log(`   📤 Transacción enviada: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`   ✅ Transacción confirmada en bloque: ${receipt.blockNumber}`);
    
    // Verificar que se actualizó correctamente
    const newSubscriptionId = await aiOracle.subscriptionId();
    console.log(`\n📊 Subscription ID nuevo: ${newSubscriptionId.toString()}`);
    
    if (newSubscriptionId.toString() === "0") {
      console.log("✅ Configuración exitosa! El contrato ahora usará modo manual.");
      console.log("\n📝 IMPORTANTE:");
      console.log("   - Cuando se llame a initiateResolution, el contrato devolverá requestId = 0");
      console.log("   - Debes llamar a fulfillResolutionManual para resolver el mercado");
      console.log("   - Ejemplo: fulfillResolutionManual(marketId, outcome, confidence)");
      console.log("     - outcome: 1=Yes, 2=No, 3=Invalid");
      console.log("     - confidence: 0-100\n");
    } else {
      console.log("❌ ERROR: El subscriptionId no se actualizó correctamente");
    }

  } catch (error: any) {
    console.log("\n❌ ERROR:");
    console.log(`   ${error.message}`);
    
    if (error.message?.includes("setSubscriptionId")) {
      console.log("\n💡 SOLUCIÓN:");
      console.log("   El contrato desplegado no tiene la función setSubscriptionId.");
      console.log("   Necesitas redesplegar el contrato con la nueva versión que incluye esta función.");
      console.log("   O usar fulfillResolutionManual directamente después de initiateResolution.\n");
    }
  }

  console.log("=".repeat(80));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

