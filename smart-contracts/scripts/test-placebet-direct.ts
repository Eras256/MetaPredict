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
  console.log("🧪 Probando placeBet directamente desde el Core...\n");

  const CORE_CONTRACT = "0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B";
  const BINARY_MARKET = "0x53e305CF5BF27c3AC917ca60839a4943350F7786";
  const MARKET_ID = 3;

  const signers = await ethers.getSigners();
  const deployer = signers[0];

  const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
  const core = PredictionMarketCore.attach(CORE_CONTRACT);

  // Verificar que el Core tiene la dirección correcta
  const binaryMarketInCore = await core.binaryMarket();
  console.log("BinaryMarket address en Core:", binaryMarketInCore);
  console.log("Nueva dirección esperada:", BINARY_MARKET);
  console.log("¿Coinciden?:", binaryMarketInCore.toLowerCase() === BINARY_MARKET.toLowerCase() ? "✅ Sí" : "❌ No");
  console.log("");

  // Intentar apostar directamente
  console.log("Intentando apostar en mercado", MARKET_ID, "...");
  const betAmount = ethers.parseEther("0.001");
  
  try {
    // Estimar gas primero para ver el error exacto
    console.log("Estimando gas...");
    const gasEstimate = await core.placeBet.estimateGas(MARKET_ID, true, { value: betAmount });
    console.log("✅ Gas estimado:", gasEstimate.toString());
    console.log("");

    console.log("Enviando transacción...");
    const tx = await core.placeBet(MARKET_ID, true, { value: betAmount });
    console.log("Transacción enviada:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Apuesta colocada exitosamente!");
    console.log("Block:", receipt.blockNumber);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    if (error.reason) {
      console.error("Error reason:", error.reason);
    }
    
    // Intentar decodificar el error
    try {
      const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
      const binaryMarket = BinaryMarket.attach(BINARY_MARKET);
      
      // Verificar si el problema es el onlyCore
      const coreContract = await binaryMarket.coreContract();
      console.log("\nDebug info:");
      console.log("  Core Contract:", CORE_CONTRACT);
      console.log("  coreContract en BinaryMarket:", coreContract);
      console.log("  ¿Coinciden?:", coreContract.toLowerCase() === CORE_CONTRACT.toLowerCase() ? "✅ Sí" : "❌ No");
    } catch (e) {
      console.error("Error al verificar:", e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

