import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import hre from "hardhat";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
 * Script para verificar los 4 contratos pendientes usando Hardhat 3
 * - Prediction Market Core
 * - Binary Market
 * - Conditional Market
 * - Subjective Market
 */

// Use Etherscan API key
const apiKey = process.env.ETHERSCAN_API_KEY || process.env.NODEREAL_API_KEY || "";

if (!apiKey) {
  console.error("❌ Error: ETHERSCAN_API_KEY o NODEREAL_API_KEY no está definida en las variables de entorno");
  console.error("   Asegúrate de tener ETHERSCAN_API_KEY en tu archivo .env.local");
  process.exit(1);
}

const network = "opbnb"; // Use "opbnb" network name as per hardhat.config.ts

// Direcciones de los contratos desplegados
// Nota: Usaremos las direcciones que el Core tiene configuradas (obtenidas dinámicamente)
const CORE_ADDRESS = "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1";

// Direcciones de los markets según el deployment file
// Pero verificaremos las que el Core tiene configuradas
const CONTRACTS = {
  CORE: CORE_ADDRESS,
  // Estas direcciones serán obtenidas dinámicamente desde el Core
  BINARY_MARKET: "", // Se obtendrá del Core
  CONDITIONAL_MARKET: "", // Se obtendrá del Core
  SUBJECTIVE_MARKET: "", // Se obtendrá del Core
};

/**
 * Obtiene los argumentos del constructor del Core desde el contrato desplegado
 */
async function getCoreConstructorArgs(): Promise<string[]> {
  try {
    console.log("📋 Obteniendo argumentos del constructor del Core desde el contrato desplegado...\n");
    
    // Use Hardhat 3.x API - access ethers through hre
    const core = await hre.ethers.getContractAt("PredictionMarketCore", CONTRACTS.CORE);
    
    const binaryMarket = await core.binaryMarket();
    const conditionalMarket = await core.conditionalMarket();
    const subjectiveMarket = await core.subjectiveMarket();
    const aiOracle = await core.aiOracle();
    const reputationStaking = await core.reputationStaking();
    const insurancePool = await core.insurancePool();
    const crossChainRouter = await core.crossChainRouter();
    const daoGovernance = await core.daoGovernance();
    
    const args = [
      binaryMarket,
      conditionalMarket,
      subjectiveMarket,
      aiOracle,
      reputationStaking,
      insurancePool,
      crossChainRouter,
      daoGovernance
    ];
    
    console.log("✅ Argumentos del constructor del Core obtenidos:");
    console.log(`   1. binaryMarket:       ${binaryMarket}`);
    console.log(`   2. conditionalMarket:  ${conditionalMarket}`);
    console.log(`   3. subjectiveMarket:   ${subjectiveMarket}`);
    console.log(`   4. aiOracle:           ${aiOracle}`);
    console.log(`   5. reputationStaking:  ${reputationStaking}`);
    console.log(`   6. insurancePool:      ${insurancePool}`);
    console.log(`   7. crossChainRouter:   ${crossChainRouter}`);
    console.log(`   8. daoGovernance:      ${daoGovernance}\n`);
    
    return args;
  } catch (error: any) {
    console.error("❌ Error obteniendo argumentos del constructor:", error.message);
    throw error;
  }
}

/**
 * Obtiene el argumento del constructor de BinaryMarket desde el contrato desplegado
 */
async function getBinaryMarketConstructorArg(address: string): Promise<string> {
  try {
    const binaryMarket = await hre.ethers.getContractAt("BinaryMarket", address);
    const coreContract = await binaryMarket.coreContract();
    console.log(`✅ BinaryMarket coreContract: ${coreContract}\n`);
    return coreContract;
  } catch (error: any) {
    console.error("❌ Error obteniendo coreContract de BinaryMarket:", error.message);
    throw error;
  }
}

/**
 * Obtiene el argumento del constructor de ConditionalMarket desde el contrato desplegado
 */
async function getConditionalMarketConstructorArg(address: string): Promise<string> {
  try {
    const conditionalMarket = await hre.ethers.getContractAt("ConditionalMarket", address);
    const coreContract = await conditionalMarket.coreContract();
    console.log(`✅ ConditionalMarket coreContract: ${coreContract}\n`);
    return coreContract;
  } catch (error: any) {
    console.error("❌ Error obteniendo coreContract de ConditionalMarket:", error.message);
    throw error;
  }
}

/**
 * Obtiene los argumentos del constructor de SubjectiveMarket desde el contrato desplegado
 */
async function getSubjectiveMarketConstructorArgs(address: string): Promise<string[]> {
  try {
    const subjectiveMarket = await hre.ethers.getContractAt("SubjectiveMarket", address);
    const coreContract = await subjectiveMarket.coreContract();
    const daoGovernance = await subjectiveMarket.daoGovernance();
    console.log(`✅ SubjectiveMarket coreContract: ${coreContract}`);
    console.log(`✅ SubjectiveMarket daoGovernance: ${daoGovernance}\n`);
    return [coreContract, daoGovernance];
  } catch (error: any) {
    console.error("❌ Error obteniendo argumentos de SubjectiveMarket:", error.message);
    throw error;
  }
}

/**
 * Verifica un contrato usando Hardhat 3
 */
async function verifyContract(
  contractName: string,
  address: string,
  constructorArgs: any[],
  contractPath: string
) {
  try {
    console.log(`   📍 ${contractName}: ${address}`);
    console.log(`   📋 Constructor args: ${JSON.stringify(constructorArgs)}\n`);
    
    const verificationParams: any = {
      address: address,
      constructorArguments: constructorArgs,
    };
    
    // Add contract path to help Hardhat find the right artifact (same as verified contracts)
    if (contractPath) {
      verificationParams.contract = contractPath;
    }
    
    await hre.run("verify:verify", verificationParams);
    
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
      console.error(`   ❌ Error verificando ${contractName}:`, errorMsg.substring(0, 300));
      console.log(`   🔗 https://testnet.opbnbscan.com/address/${address}#code\n`);
      return false;
    }
  }
}

async function main() {
  console.log("🔍 Verificando 4 contratos pendientes en opBNBScan usando Hardhat 3...\n");
  console.log(`🌐 Network: ${network}`);
  console.log(`📡 API Key: ${apiKey.substring(0, 10)}...`);
  console.log("=".repeat(70) + "\n");

  const results: { [key: string]: boolean } = {};

  try {
    // Primero obtener las direcciones de los markets desde el Core
    console.log("📋 Obteniendo direcciones de los markets desde el Core...\n");
    const coreArgs = await getCoreConstructorArgs();
    const binaryMarketAddress = coreArgs[0];
    const conditionalMarketAddress = coreArgs[1];
    const subjectiveMarketAddress = coreArgs[2];
    
    console.log(`✅ Binary Market: ${binaryMarketAddress}`);
    console.log(`✅ Conditional Market: ${conditionalMarketAddress}`);
    console.log(`✅ Subjective Market: ${subjectiveMarketAddress}\n`);

    // 1. Verificar Binary Market
    console.log("1️⃣ Verificando Binary Market...");
    const binaryCoreContract = await getBinaryMarketConstructorArg(binaryMarketAddress);
    results.binary = await verifyContract(
      "BinaryMarket",
      binaryMarketAddress,
      [binaryCoreContract],
      "contracts/markets/BinaryMarket.sol:BinaryMarket"
    );
    await new Promise(r => setTimeout(r, 5000)); // Delay entre verificaciones

    // 2. Verificar Conditional Market
    console.log("2️⃣ Verificando Conditional Market...");
    const conditionalCoreContract = await getConditionalMarketConstructorArg(conditionalMarketAddress);
    results.conditional = await verifyContract(
      "ConditionalMarket",
      conditionalMarketAddress,
      [conditionalCoreContract],
      "contracts/markets/ConditionalMarket.sol:ConditionalMarket"
    );
    await new Promise(r => setTimeout(r, 5000));

    // 3. Verificar Subjective Market
    console.log("3️⃣ Verificando Subjective Market...");
    const subjectiveArgs = await getSubjectiveMarketConstructorArgs(subjectiveMarketAddress);
    results.subjective = await verifyContract(
      "SubjectiveMarket",
      subjectiveMarketAddress,
      subjectiveArgs,
      "contracts/markets/SubjectiveMarket.sol:SubjectiveMarket"
    );
    await new Promise(r => setTimeout(r, 5000));

    // 4. Verificar Prediction Market Core
    console.log("4️⃣ Verificando Prediction Market Core...");
    results.core = await verifyContract(
      "PredictionMarketCore",
      CONTRACTS.CORE,
      coreArgs,
      "contracts/core/PredictionMarketCore.sol:PredictionMarketCore"
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
  } catch (error: any) {
    console.error("\n❌ Error durante la verificación:", error.message);
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

