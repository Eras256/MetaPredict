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

const CORE_CONTRACT = process.env.CORE_CONTRACT_ADDRESS || "0xCB6a24b349c96526B6e7b79a87B2c4009d25D7AC";
const MARKET_ID = "22";

async function main() {
  console.log("🔍 Probando llamada directa a BinaryMarket.placeBet() desde el Core\n");
  console.log("📋 Core Contract:", CORE_CONTRACT);
  console.log("📋 Market ID:", MARKET_ID);
  console.log("");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("👤 Usando cuenta:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "BNB");
    console.log("");

    const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
    const core = PredictionMarketCore.attach(CORE_CONTRACT);

    // Obtener información del mercado
    const marketInfo = await core.markets(BigInt(MARKET_ID));
    const marketTypeNum = Number(marketInfo.marketType);
    const statusNum = Number(marketInfo.status);
    
    console.log("📋 Información del mercado:");
    console.log("   Tipo:", marketTypeNum === 0 ? "Binary" : marketTypeNum === 1 ? "Conditional" : "Subjective");
    console.log("   Estado:", statusNum === 0 ? "Active" : statusNum === 1 ? "Resolving" : statusNum === 2 ? "Resolved" : statusNum === 3 ? "Disputed" : "Cancelled");
    console.log("");

    if (statusNum !== 0) {
      console.log("❌ El mercado no está activo");
      return;
    }

    // Obtener el contrato del mercado
    const marketContractAddress = await core.marketTypeContract(BigInt(MARKET_ID));
    console.log("📋 Contrato del mercado:", marketContractAddress);
    console.log("");

    // Intentar llamar directamente desde el Core usando el contrato específico
    console.log("💰 Intentando apuesta directa usando BinaryMarket(marketContract)...");
    const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
    const binaryMarket = BinaryMarket.attach(marketContractAddress);
    
    const amount = ethers.parseEther("0.01");
    const netAmount = amount - (amount * BigInt(250)) / BigInt(10000); // Aproximadamente
    
    try {
      // Intentar llamar directamente desde el Core
      // Esto simula lo que debería hacer el Core
      const tx = await binaryMarket.placeBet(
        BigInt(MARKET_ID),
        deployer.address,
        true,
        netAmount,
        { value: netAmount, from: CORE_CONTRACT }
      );
      console.log("   ✅ Transacción enviada:", tx.hash);
      await tx.wait();
      console.log("   ✅ Apuesta exitosa!");
    } catch (error: any) {
      console.log("   ❌ Error:", error.message);
      if (error.message.includes("Only core")) {
        console.log("");
        console.log("   💡 El problema es que estamos llamando desde deployer.address, no desde el Core");
        console.log("   El Core necesita llamar a BinaryMarket.placeBet() para que msg.sender sea el Core");
        console.log("");
        console.log("   Probando desde el Core...");
        
        // Ahora probar desde el Core
        try {
          const coreTx = await core.placeBet(
            BigInt(MARKET_ID),
            true,
            { value: amount }
          );
          console.log("   📤 Transacción desde el Core enviada:", coreTx.hash);
          const receipt = await coreTx.wait();
          console.log("   ✅ Apuesta exitosa desde el Core!");
          console.log("   📋 Gas usado:", receipt.gasUsed.toString());
        } catch (coreError: any) {
          console.log("   ❌ Error desde el Core:", coreError.message);
        }
      }
    }

  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
