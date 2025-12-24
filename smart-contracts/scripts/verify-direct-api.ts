import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { ethers } from "ethers";

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
 * Script para verificar contratos directamente usando la API de Etherscan v2
 * Solución alternativa para Hardhat 2.x que tiene problemas con API v2
 */

const API_KEY = process.env.ETHERSCAN_API_KEY || "";
const CHAIN_ID = 5611; // opBNB Testnet
const API_URL = "https://api.etherscan.io/v2/api";

interface VerificationParams {
  contractAddress: string;
  sourceCode: string;
  contractName: string;
  compilerVersion: string;
  optimizationUsed: string;
  runs: string;
  constructorArguments: string;
}

async function verifyContractDirect(params: VerificationParams): Promise<boolean> {
  const formData = new URLSearchParams();
  formData.append("apikey", API_KEY);
  formData.append("module", "contract");
  formData.append("action", "verifysourcecode");
  formData.append("chainid", CHAIN_ID.toString());
  formData.append("contractaddress", params.contractAddress);
  formData.append("sourceCode", params.sourceCode);
  formData.append("codeformat", "solidity-single-file");
  formData.append("contractname", params.contractName);
  formData.append("compilerversion", params.compilerVersion);
  formData.append("optimizationUsed", params.optimizationUsed);
  formData.append("runs", params.runs);
  formData.append("constructorArguements", params.constructorArguments);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const result = await response.json();
    
    if (result.status === "1" && result.message === "OK") {
      console.log(`✅ Contrato enviado para verificación. GUID: ${result.result}`);
      console.log(`🔗 Verifica el estado en: https://testnet.opbnbscan.com/address/${params.contractAddress}#code`);
      return true;
    } else {
      console.error(`❌ Error: ${result.message}`);
      if (result.result) {
        console.error(`   Detalles: ${result.result}`);
      }
      return false;
    }
  } catch (error: any) {
    console.error(`❌ Error de red: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🔍 Verificación directa usando Etherscan API v2\n");
  console.log(`📡 API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`🌐 Chain ID: ${CHAIN_ID} (opBNB Testnet)\n`);

  // Este script requiere que proporciones manualmente los parámetros
  // o que los obtengas de los artifacts de Hardhat
  console.log("⚠️  Este script requiere los siguientes parámetros:");
  console.log("   1. Dirección del contrato");
  console.log("   2. Código fuente (flattened)");
  console.log("   3. Nombre del contrato");
  console.log("   4. Versión del compilador");
  console.log("   5. Argumentos del constructor (ABI encoded)\n");
  
  console.log("💡 Para obtener el código fuente flattened:");
  console.log("   pnpm hardhat flatten contracts/[CONTRACT_NAME].sol > flattened.sol\n");
  
  console.log("💡 Para obtener los argumentos del constructor ABI encoded:");
  console.log("   Usa el script get-constructor-abi-encoded.ts\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



