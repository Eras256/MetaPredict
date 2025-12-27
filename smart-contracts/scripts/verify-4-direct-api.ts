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
 * Script para verificar los 4 contratos pendientes usando la API de Etherscan directamente
 * Método alternativo cuando Hardhat tiene problemas con la API v2
 */

const API_KEY = process.env.ETHERSCAN_API_KEY || "";
const CHAIN_ID = 5611; // opBNB Testnet
const API_URL = "https://api.etherscan.io/v2/api";

const CONTRACTS = {
  binaryMarket: {
    address: "0x68aEea03664707f152652F9562868CCF87C0962C",
    name: "BinaryMarket",
    path: "contracts/markets/BinaryMarket.sol:BinaryMarket",
    constructorArgs: ["0x5eaa77CC135b82c254F1144c48f4d179964fA0b1"]
  },
  conditionalMarket: {
    address: "0x547FC8C5680B7c4ed05da93c635B6b9B83e12007",
    name: "ConditionalMarket",
    path: "contracts/markets/ConditionalMarket.sol:ConditionalMarket",
    constructorArgs: ["0x5eaa77CC135b82c254F1144c48f4d179964fA0b1"]
  },
  subjectiveMarket: {
    address: "0x9a9c478BFdC45E2612f61726863AC1b6422217Ea",
    name: "SubjectiveMarket",
    path: "contracts/markets/SubjectiveMarket.sol:SubjectiveMarket",
    constructorArgs: ["0x5eaa77CC135b82c254F1144c48f4d179964fA0b1", "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123"]
  },
  core: {
    address: "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1",
    name: "PredictionMarketCore",
    path: "contracts/core/PredictionMarketCore.sol:PredictionMarketCore",
    constructorArgs: [
      "0x68aEea03664707f152652F9562868CCF87C0962C",
      "0x547FC8C5680B7c4ed05da93c635B6b9B83e12007",
      "0x9a9c478BFdC45E2612f61726863AC1b6422217Ea",
      "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c",
      "0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7",
      "0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA",
      "0x11C1124384e463d99Ba84348280e318FbeE544d0",
      "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123"
    ]
  }
};

async function getFlattenedSource(contractPath: string): Promise<string> {
  try {
    const result = await hre.run("flatten", { files: [contractPath] });
    return result;
  } catch (error: any) {
    console.error(`Error flattening ${contractPath}:`, error.message);
    throw error;
  }
}

async function getCompilerVersion(): Promise<string> {
  // Get compiler version from hardhat config
  const config = await hre.config;
  const solcVersion = config.solidity.version || "0.8.24";
  return `v${solcVersion.replace(/^0\./, "")}`;
}

async function encodeConstructorArgs(types: string[], values: string[]): Promise<string> {
  const { ethers } = await import("hardhat");
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  return abiCoder.encode(types, values);
}

async function verifyContractDirect(
  contractName: string,
  contractAddress: string,
  contractPath: string,
  constructorArgs: string[]
): Promise<boolean> {
  console.log(`\n🔍 Verificando ${contractName}...`);
  console.log(`   📍 Address: ${contractAddress}`);
  console.log(`   📋 Constructor args: ${constructorArgs.length} parámetros`);

  try {
    // Get flattened source
    console.log(`   📄 Obteniendo código fuente aplanado...`);
    const sourceCode = await getFlattenedSource(contractPath.split(':')[0]);
    
    // Get compiler version
    const compilerVersion = await getCompilerVersion();
    console.log(`   🔧 Compiler version: ${compilerVersion}`);

    // Encode constructor arguments
    const constructorTypes = constructorArgs.map(() => "address");
    const constructorArgsEncoded = await encodeConstructorArgs(constructorTypes, constructorArgs);
    console.log(`   📝 Constructor args encoded: ${constructorArgsEncoded.substring(0, 66)}...`);

    // Prepare form data
    const formData = new URLSearchParams();
    formData.append("apikey", API_KEY);
    formData.append("module", "contract");
    formData.append("action", "verifysourcecode");
    formData.append("chainid", CHAIN_ID.toString());
    formData.append("contractaddress", contractAddress);
    formData.append("sourceCode", sourceCode);
    formData.append("codeformat", "solidity-single-file");
    formData.append("contractname", contractName);
    formData.append("compilerversion", compilerVersion);
    formData.append("optimizationUsed", "1");
    formData.append("runs", "200");
    formData.append("constructorArguements", constructorArgsEncoded.slice(2)); // Remove 0x prefix
    formData.append("evmVersion", "paris");

    console.log(`   📤 Enviando solicitud a Etherscan API v2...`);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const result = await response.json();
    
    if (result.status === "1" && result.message === "OK") {
      console.log(`   ✅ Contrato enviado para verificación. GUID: ${result.result}`);
      console.log(`   🔗 Verifica el estado en: https://testnet.opbnbscan.com/address/${contractAddress}#code`);
      return true;
    } else {
      console.error(`   ❌ Error: ${result.message}`);
      if (result.result) {
        console.error(`   Detalles: ${result.result}`);
      }
      return false;
    }
  } catch (error: any) {
    console.error(`   ❌ Error de red: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🔍 Verificación directa de 4 contratos usando Etherscan API v2\n");
  console.log(`📡 API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`🌐 Chain ID: ${CHAIN_ID} (opBNB Testnet)\n`);

  if (!API_KEY) {
    console.error("❌ Error: ETHERSCAN_API_KEY no está definida");
    process.exit(1);
  }

  const results: { [key: string]: boolean } = {};

  // 1. Binary Market
  results.binary = await verifyContractDirect(
    CONTRACTS.binaryMarket.name,
    CONTRACTS.binaryMarket.address,
    CONTRACTS.binaryMarket.path,
    CONTRACTS.binaryMarket.constructorArgs
  );
  await new Promise(r => setTimeout(r, 5000));

  // 2. Conditional Market
  results.conditional = await verifyContractDirect(
    CONTRACTS.conditionalMarket.name,
    CONTRACTS.conditionalMarket.address,
    CONTRACTS.conditionalMarket.path,
    CONTRACTS.conditionalMarket.constructorArgs
  );
  await new Promise(r => setTimeout(r, 5000));

  // 3. Subjective Market
  results.subjective = await verifyContractDirect(
    CONTRACTS.subjectiveMarket.name,
    CONTRACTS.subjectiveMarket.address,
    CONTRACTS.subjectiveMarket.path,
    CONTRACTS.subjectiveMarket.constructorArgs
  );
  await new Promise(r => setTimeout(r, 5000));

  // 4. Prediction Market Core
  results.core = await verifyContractDirect(
    CONTRACTS.core.name,
    CONTRACTS.core.address,
    CONTRACTS.core.path,
    CONTRACTS.core.constructorArgs
  );

  // Resumen
  console.log("\n" + "=".repeat(70));
  console.log("📊 RESUMEN DE VERIFICACIÓN\n");
  
  const verified = Object.values(results).filter(v => v).length;
  const failed = Object.values(results).filter(v => !v).length;
  
  console.log(`✅ Enviados para verificación: ${verified}/4`);
  console.log(`❌ Fallidos: ${failed}/4\n`);

  if (failed > 0) {
    console.log("⚠️  Contratos con errores:");
    if (!results.binary) console.log("   - Binary Market");
    if (!results.conditional) console.log("   - Conditional Market");
    if (!results.subjective) console.log("   - Subjective Market");
    if (!results.core) console.log("   - Prediction Market Core");
  }

  if (verified === 4) {
    console.log("🎉 ¡Todos los contratos han sido enviados para verificación!");
    console.log("💡 La verificación puede tardar unos minutos. Revisa el estado en opBNBScan.\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });







