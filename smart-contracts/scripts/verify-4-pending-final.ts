import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import hre from "hardhat";
import { ethers } from "ethers";

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
 * Script para verificar los 4 contratos pendientes según el análisis:
 * 1. AI Oracle (0xA65bE35D25B09F7326ab154E154572dB90F67081)
 * 2. Binary Market (0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d)
 * 3. Conditional Market (0x41C2b1FB595Ad18cb111c3a3Fc1B2d6307e43741)
 * 4. Subjective Market (0xAE88cE8f797FCBD36b0Ae78f80FDb11774d766f8)
 */

const apiKey = process.env.ETHERSCAN_API_KEY || process.env.NODEREAL_API_KEY || "";

if (!apiKey) {
  console.error("❌ Error: ETHERSCAN_API_KEY o NODEREAL_API_KEY no está definida");
  console.error("   Asegúrate de tener ETHERSCAN_API_KEY en tu archivo .env.local");
  process.exit(1);
}

const network = "opbnb";

// Direcciones según el análisis y frontend/lib/contracts/addresses.ts
const CONTRACTS = {
  AI_ORACLE: "0xA65bE35D25B09F7326ab154E154572dB90F67081",
  BINARY_MARKET: "0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d",
  CONDITIONAL_MARKET: "0x41C2b1FB595Ad18cb111c3a3Fc1B2d6307e43741",
  SUBJECTIVE_MARKET: "0xAE88cE8f797FCBD36b0Ae78f80FDb11774d766f8",
  CORE: "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1", // Para obtener argumentos
};

/**
 * Obtiene los argumentos del constructor del AI Oracle
 * Constructor: (address _router, bytes32 _donId, uint64 _subscriptionId, string memory _backendUrl)
 * Nota: i_router es internal en FunctionsClient, así que usamos valores conocidos o env vars
 */
async function getAIOracleConstructorArgs(address: string): Promise<any[]> {
  try {
    // Get provider from network config
    const provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL_TESTNET || "https://opbnb-testnet-rpc.bnbchain.org/"
    );
    
    // Read ABI from artifacts
    const aiOracleArtifact = await hre.artifacts.readArtifact("AIOracle");
    const aiOracle = new ethers.Contract(address, aiOracleArtifact.abi, provider);
    
    // Leer valores públicos del contrato desplegado
    const donId = await aiOracle.donId();
    const subscriptionId = await aiOracle.subscriptionId();
    const backendUrl = await aiOracle.backendUrl();
    
    // i_router es internal, usar valores conocidos del deployment
    // En modo manual, router es ZeroAddress
    const router = process.env.CHAINLINK_FUNCTIONS_ROUTER || ethers.ZeroAddress;
    
    console.log(`✅ AIOracle router: ${router} (from env or ZeroAddress for manual mode)`);
    console.log(`✅ AIOracle donId: ${donId}`);
    console.log(`✅ AIOracle subscriptionId: ${subscriptionId.toString()}`);
    console.log(`✅ AIOracle backendUrl: ${backendUrl}\n`);
    
    // Convert BigInt to string for serialization
    return [router, donId, subscriptionId.toString(), backendUrl];
  } catch (error: any) {
    console.error("❌ Error obteniendo argumentos de AIOracle:", error.message);
    throw error;
  }
}

/**
 * Obtiene el argumento del constructor de BinaryMarket
 */
async function getBinaryMarketConstructorArg(address: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL_TESTNET || "https://opbnb-testnet-rpc.bnbchain.org/"
    );
    const binaryMarketArtifact = await hre.artifacts.readArtifact("BinaryMarket");
    const binaryMarket = new ethers.Contract(address, binaryMarketArtifact.abi, provider);
    const coreContract = await binaryMarket.coreContract();
    console.log(`✅ BinaryMarket coreContract: ${coreContract}\n`);
    return coreContract;
  } catch (error: any) {
    console.error("❌ Error obteniendo coreContract de BinaryMarket:", error.message);
    throw error;
  }
}

/**
 * Obtiene el argumento del constructor de ConditionalMarket
 */
async function getConditionalMarketConstructorArg(address: string): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL_TESTNET || "https://opbnb-testnet-rpc.bnbchain.org/"
    );
    const conditionalMarketArtifact = await hre.artifacts.readArtifact("ConditionalMarket");
    const conditionalMarket = new ethers.Contract(address, conditionalMarketArtifact.abi, provider);
    const coreContract = await conditionalMarket.coreContract();
    console.log(`✅ ConditionalMarket coreContract: ${coreContract}\n`);
    return coreContract;
  } catch (error: any) {
    console.error("❌ Error obteniendo coreContract de ConditionalMarket:", error.message);
    throw error;
  }
}

/**
 * Obtiene los argumentos del constructor de SubjectiveMarket
 */
async function getSubjectiveMarketConstructorArgs(address: string): Promise<string[]> {
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL_TESTNET || "https://opbnb-testnet-rpc.bnbchain.org/"
    );
    const subjectiveMarketArtifact = await hre.artifacts.readArtifact("SubjectiveMarket");
    const subjectiveMarket = new ethers.Contract(address, subjectiveMarketArtifact.abi, provider);
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
    
    if (contractPath) {
      verificationParams.contract = contractPath;
    }
    
    // Use Hardhat's verify task
    await (hre as any).run("verify:verify", verificationParams);
    
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
  console.log("🔍 Verificando 4 contratos pendientes en opBNBScan...\n");
  console.log(`🌐 Network: ${network}`);
  console.log(`📡 API Key: ${apiKey.substring(0, 10)}...`);
  console.log("=".repeat(70) + "\n");

  const results: { [key: string]: boolean } = {};

  try {
    // 1. Verificar AI Oracle
    console.log("1️⃣ Verificando AI Oracle...");
    const aiOracleArgs = await getAIOracleConstructorArgs(CONTRACTS.AI_ORACLE);
    results.aiOracle = await verifyContract(
      "AIOracle",
      CONTRACTS.AI_ORACLE,
      aiOracleArgs,
      "contracts/oracle/AIOracle.sol:AIOracle"
    );
    await new Promise(r => setTimeout(r, 5000)); // Delay entre verificaciones

    // 2. Verificar Binary Market
    console.log("2️⃣ Verificando Binary Market...");
    const binaryCoreContract = await getBinaryMarketConstructorArg(CONTRACTS.BINARY_MARKET);
    results.binary = await verifyContract(
      "BinaryMarket",
      CONTRACTS.BINARY_MARKET,
      [binaryCoreContract],
      "contracts/markets/BinaryMarket.sol:BinaryMarket"
    );
    await new Promise(r => setTimeout(r, 5000));

    // 3. Verificar Conditional Market
    console.log("3️⃣ Verificando Conditional Market...");
    const conditionalCoreContract = await getConditionalMarketConstructorArg(CONTRACTS.CONDITIONAL_MARKET);
    results.conditional = await verifyContract(
      "ConditionalMarket",
      CONTRACTS.CONDITIONAL_MARKET,
      [conditionalCoreContract],
      "contracts/markets/ConditionalMarket.sol:ConditionalMarket"
    );
    await new Promise(r => setTimeout(r, 5000));

    // 4. Verificar Subjective Market
    console.log("4️⃣ Verificando Subjective Market...");
    const subjectiveArgs = await getSubjectiveMarketConstructorArgs(CONTRACTS.SUBJECTIVE_MARKET);
    results.subjective = await verifyContract(
      "SubjectiveMarket",
      CONTRACTS.SUBJECTIVE_MARKET,
      subjectiveArgs,
      "contracts/markets/SubjectiveMarket.sol:SubjectiveMarket"
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
      if (!results.aiOracle) console.log("   - AI Oracle");
      if (!results.binary) console.log("   - Binary Market");
      if (!results.conditional) console.log("   - Conditional Market");
      if (!results.subjective) console.log("   - Subjective Market");
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
