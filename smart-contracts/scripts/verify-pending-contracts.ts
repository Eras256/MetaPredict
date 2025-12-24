import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import hre from "hardhat";

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
 * Script para verificar solo los 4 contratos pendientes
 * - Prediction Market Core
 * - Binary Market
 * - Conditional Market
 * - Subjective Market
 */

// Use Etherscan API v2 (unified API key)
const apiKey = process.env.ETHERSCAN_API_KEY || "";

if (!apiKey) {
  console.error("❌ Error: ETHERSCAN_API_KEY no está definida en las variables de entorno");
  console.error("   Asegúrate de tener ETHERSCAN_API_KEY en tu archivo .env.local");
  process.exit(1);
}

const network = "opbnb"; // Use "opbnb" network name as per hardhat.config.ts

// Direcciones actualizadas del usuario
const CONTRACTS = {
  CORE: "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1",
  BINARY_MARKET: "0x68aEea03664707f152652F9562868CCF87C0962C",
  CONDITIONAL_MARKET: "0x547FC8C5680B7c4ed05da93c635B6b9B83e12007",
  SUBJECTIVE_MARKET: "0x9a9c478BFdC45E2612f61726863AC1b6422217Ea",
};

async function verifyContract(
  contractName: string,
  address: string,
  constructorArgs: any[]
) {
  try {
    console.log(`   📍 ${contractName}: ${address}`);
    
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs,
    });
    
    console.log(`   ✅ ${contractName} verificado exitosamente!`);
    console.log(`   🔗 https://testnet.opbnbscan.com/address/${address}#code\n`);
    return true;
  } catch (error: any) {
    const errorMsg = error.message || error.toString();
    
    if (errorMsg.includes("Already Verified") || 
        errorMsg.includes("already verified") ||
        errorMsg.includes("Contract source code already verified")) {
      console.log(`   ✅ ${contractName} ya estaba verificado!`);
      console.log(`   🔗 https://testnet.opbnbscan.com/address/${address}#code\n`);
      return true;
    } else {
      console.error(`   ❌ Error verificando ${contractName}:`, errorMsg.substring(0, 200));
      console.log(`   🔗 https://testnet.opbnbscan.com/address/${address}#code\n`);
      return false;
    }
  }
}

async function main() {
  console.log("🔍 Verificando 4 contratos pendientes en opBNBScan...\n");
  console.log(`🌐 Network: ${network}`);
  console.log(`📡 API Key: ${apiKey.substring(0, 10)}... (Etherscan API v2)`);
  console.log("=".repeat(70) + "\n");

  // Cargar deployment para obtener direcciones relacionadas
  const deploymentsPath = path.join(__dirname, "../deployments/opbnb-testnet.json");
  let relatedAddresses: any = {};
  
  if (fs.existsSync(deploymentsPath)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));
    relatedAddresses = {
      aiOracle: deployment.contracts?.aiOracle || "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c",
      reputationStaking: deployment.contracts?.reputationStaking || "0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7",
      insurancePool: deployment.contracts?.insurancePool || "0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA",
      crossChainRouter: deployment.contracts?.crossChainRouter || "0x11C1124384e463d99Ba84348280e318FbeE544d0",
      daoGovernance: deployment.contracts?.daoGovernance || "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123",
      deployer: deployment.deployer || "0x8eC3829793D0a2499971d0D853935F17aB52F800",
    };
  }

  const results: { [key: string]: boolean } = {};

  // 1. Binary Market
  console.log("1️⃣ Verificando Binary Market...");
  results.binary = await verifyContract(
    "BinaryMarket",
    CONTRACTS.BINARY_MARKET,
    [relatedAddresses.deployer] // coreContract temporal
  );
  await new Promise(r => setTimeout(r, 3000)); // Delay entre verificaciones

  // 2. Conditional Market
  console.log("2️⃣ Verificando Conditional Market...");
  results.conditional = await verifyContract(
    "ConditionalMarket",
    CONTRACTS.CONDITIONAL_MARKET,
    [relatedAddresses.deployer] // coreContract temporal
  );
  await new Promise(r => setTimeout(r, 3000));

  // 3. Subjective Market
  console.log("3️⃣ Verificando Subjective Market...");
  results.subjective = await verifyContract(
    "SubjectiveMarket",
    CONTRACTS.SUBJECTIVE_MARKET,
    [
      relatedAddresses.deployer, // coreContract temporal
      relatedAddresses.daoGovernance
    ]
  );
  await new Promise(r => setTimeout(r, 3000));

  // 4. Prediction Market Core (requiere las direcciones de los markets)
  console.log("4️⃣ Verificando Prediction Market Core...");
  results.core = await verifyContract(
    "PredictionMarketCore",
    CONTRACTS.CORE,
    [
      CONTRACTS.BINARY_MARKET,
      CONTRACTS.CONDITIONAL_MARKET,
      CONTRACTS.SUBJECTIVE_MARKET,
      relatedAddresses.aiOracle,
      relatedAddresses.reputationStaking,
      relatedAddresses.insurancePool,
      relatedAddresses.crossChainRouter,
      relatedAddresses.daoGovernance
    ]
  );

  // Resumen
  console.log("\n" + "=".repeat(70));
  console.log("📊 RESUMEN DE VERIFICACIÓN\n");
  
  const verified = Object.values(results).filter(v => v).length;
  const failed = Object.values(results).filter(v => !v).length;
  
  console.log(`✅ Verificados/Re-verificados: ${verified}/4`);
  console.log(`❌ Fallidos: ${failed}/4\n`);

  if (failed > 0) {
    console.log("⚠️  Contratos con errores:");
    if (!results.binary) console.log("   - Binary Market");
    if (!results.conditional) console.log("   - Conditional Market");
    if (!results.subjective) console.log("   - Subjective Market");
    if (!results.core) console.log("   - Prediction Market Core");
    console.log("\n💡 Si hay errores de bytecode, puede ser necesario recompilar:");
    console.log("   pnpm hardhat clean && pnpm hardhat compile\n");
  }

  if (verified === 4) {
    console.log("🎉 ¡Todos los contratos han sido verificados exitosamente!\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

