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
  console.log("🔍 Debugging Market ID 3...\n");

  const CORE_CONTRACT = "0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B";
  const BINARY_MARKET = "0x53e305CF5BF27c3AC917ca60839a4943350F7786";
  const MARKET_ID = 3;

  const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
  const core = PredictionMarketCore.attach(CORE_CONTRACT);

  const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
  const binaryMarket = BinaryMarket.attach(BINARY_MARKET);

  console.log("1️⃣ Verificando mercado en Core...");
  try {
    const marketInfo = await core.getMarket(MARKET_ID);
    console.log("   Market ID:", marketInfo.id.toString());
    console.log("   Market Type:", marketInfo.marketType); // 0=Binary, 1=Conditional, 2=Subjective
    console.log("   Status:", marketInfo.status); // 0=Active, etc
    console.log("   Creator:", marketInfo.creator);
    console.log("   Resolution Time:", new Date(Number(marketInfo.resolutionTime) * 1000).toLocaleString());
    console.log("");

    const marketContract = await core.getMarketContract(MARKET_ID);
    console.log("   Market Contract Address:", marketContract);
    console.log("   BinaryMarket Address:", BINARY_MARKET);
    console.log("   ¿Coinciden?:", marketContract.toLowerCase() === BINARY_MARKET.toLowerCase() ? "✅ Sí" : "❌ No");
    console.log("");

  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
  }

  console.log("2️⃣ Verificando mercado en BinaryMarket...");
  try {
    const market = await binaryMarket.getMarket(MARKET_ID);
    console.log("   ✅ Mercado existe en BinaryMarket");
    console.log("   Question:", market.question);
    console.log("   Resolved:", market.resolved);
    console.log("");
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
  }

  console.log("3️⃣ Verificando coreContract en BinaryMarket...");
  const coreContract = await binaryMarket.coreContract();
  console.log("   coreContract:", coreContract);
  console.log("   Core Contract:", CORE_CONTRACT);
  console.log("   ¿Coinciden?:", coreContract.toLowerCase() === CORE_CONTRACT.toLowerCase() ? "✅ Sí" : "❌ No");
  console.log("");

  console.log("4️⃣ Simulando llamada placeBet desde Core...");
  console.log("   Si el Core llama a binaryMarket.placeBet(), el msg.sender será:", CORE_CONTRACT);
  console.log("   El BinaryMarket verifica: msg.sender == coreContract");
  console.log("   Resultado esperado:", CORE_CONTRACT.toLowerCase() === coreContract.toLowerCase() ? "✅ Debería funcionar" : "❌ Fallará");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

