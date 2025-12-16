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
 * Script para verificar el contrato PredictionMarketCore usando la configuración correcta
 * Dirección: 0x5eaa77CC135b82c254F1144c48f4d179964fA0b1
 * 
 * Según documentación oficial de opBNBScan (Diciembre 2025):
 * - Usa NodeReal API con formato: https://open-platform.nodereal.io/{API_KEY}/op-bnb-testnet/contract/
 * - Red: opBNBTestnet (chainId: 5611)
 */
async function main() {
  console.log("🔍 Verificando PredictionMarketCore en opBNBScan...\n");
  console.log("📚 Usando configuración oficial de opBNBScan (Diciembre 2025)\n");

  const contractAddress = "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1";
  
  // Argumentos del constructor obtenidos del contrato desplegado
  const constructorArgs = [
    "0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d", // binaryMarket
    "0x41C2b1FB595Ad18cb111c3a3Fc1B2d6307e43741", // conditionalMarket
    "0xAE88cE8f797FCBD36b0Ae78f80FDb11774d766f8", // subjectiveMarket
    "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c", // aiOracle
    "0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7", // reputationStaking
    "0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA", // insurancePool
    "0x11C1124384e463d99Ba84348280e318FbeE544d0", // crossChainRouter
    "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123"  // daoGovernance
  ];

  console.log(`📍 Contrato: ${contractAddress}`);
  console.log(`📋 Argumentos del constructor: ${constructorArgs.length} parámetros\n`);

  // Verificar API key
  const apiKey = process.env.NODEREAL_API_KEY || process.env.ETHERSCAN_API_KEY || process.env.BSCSCAN_API_KEY;
  if (!apiKey || apiKey === "") {
    console.error("❌ Error: No se encontró API key en .env.local");
    console.error("   Necesitas una de estas variables:");
    console.error("   - NODEREAL_API_KEY (recomendado para opBNB)");
    console.error("   - ETHERSCAN_API_KEY");
    console.error("   - BSCSCAN_API_KEY");
    console.error("\n   Obtén tu API key en:");
    console.error("   - https://nodereal.io/ (recomendado para opBNB)");
    console.error("   - https://etherscan.io/apidashboard");
    process.exit(1);
  }

  console.log(`✅ API Key encontrada: ${apiKey.substring(0, 10)}...`);
  console.log(`🌐 Red: opBNBTestnet (Chain ID: 5611)`);
  console.log(`🔗 API URL: https://open-platform.nodereal.io/${apiKey.substring(0, 10)}.../op-bnb-testnet/contract/\n`);

  try {
    console.log("⏳ Compilando contratos...\n");
    await hre.run("compile");
    console.log("✅ Compilación completada\n");

    console.log("⏳ Verificando contrato (esto puede tardar 30-60 segundos)...\n");
    
    // Usar el método de verificación estándar de Hardhat
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
      contract: "contracts/core/PredictionMarketCore.sol:PredictionMarketCore",
    });
    
    console.log(`\n✅ ✅ Contrato verificado exitosamente!`);
    console.log(`🔗 Ver en opBNBScan: https://testnet.opbnbscan.com/address/${contractAddress}#code`);
  } catch (error: any) {
    const errorMsg = error.message || error.toString();
    
    if (errorMsg.includes("Already Verified") || 
        errorMsg.includes("already verified") ||
        errorMsg.includes("Contract source code already verified")) {
      console.log(`\n✅ El contrato ya está verificado!`);
      console.log(`🔗 Ver en opBNBScan: https://testnet.opbnbscan.com/address/${contractAddress}#code`);
    } else if (errorMsg.includes("Invalid API Key") || 
               errorMsg.includes("Invalid API") ||
               errorMsg.includes("invalid api key")) {
      console.error(`\n❌ Error: API Key inválida`);
      console.error(`   Verifica que tu API key sea correcta en .env.local`);
      console.error(`   Obtén una API key válida en: https://nodereal.io/`);
    } else if (errorMsg.includes("does not have bytecode") || 
               errorMsg.includes("Contract does not have bytecode")) {
      console.error(`\n❌ Error: El contrato no tiene bytecode`);
      console.error(`   Verifica que la dirección sea correcta`);
    } else if (errorMsg.includes("Too many invalid") || 
               errorMsg.includes("rate limit")) {
      console.error(`\n⏳ Rate limit alcanzado. Espera unos minutos antes de intentar de nuevo.`);
    } else if (errorMsg.includes("Unexpected token") || 
               errorMsg.includes("<html>") ||
               errorMsg.includes("network request failed")) {
      console.error(`\n❌ Error: Problema con la API de opBNBScan`);
      console.error(`   El servidor está devolviendo HTML en lugar de JSON`);
      console.error(`   Esto puede indicar:`);
      console.error(`   1. La API key no es válida o no está activa`);
      console.error(`   2. La URL de la API está incorrecta`);
      console.error(`   3. Problema temporal con el servicio de NodeReal`);
      console.error(`\n💡 Soluciones:`);
      console.error(`   - Verifica que NODEREAL_API_KEY esté correcta en .env.local`);
      console.error(`   - Espera unos minutos y vuelve a intentar`);
      console.error(`   - Verifica manualmente en: https://testnet.opbnbscan.com/address/${contractAddress}#code`);
    } else {
      console.error(`\n❌ Error verificando contrato:`);
      console.error(`   ${errorMsg.substring(0, 500)}`);
      console.error(`\n💡 Intenta verificar manualmente:`);
      console.error(`   1. Ve a: https://testnet.opbnbscan.com/address/${contractAddress}#code`);
      console.error(`   2. Haz clic en la pestaña "Contract"`);
      console.error(`   3. Haz clic en "Verify and Publish"`);
      console.error(`   4. Selecciona "Solidity (Standard JSON Input)"`);
      console.error(`   5. Sube el archivo de compilación desde: smart-contracts/artifacts/build-info/`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

