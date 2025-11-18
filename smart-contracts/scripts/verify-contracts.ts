import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import hre from "hardhat";
import { Contract } from "ethers";

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
 * Script para verificar todos los contratos desplegados en opBNBScan
 * Usa Etherscan API V2 (unificada para todas las chains)
 * IMPORTANTE: Necesitas una API key de Etherscan.io (no de BSCScan)
 * Obtén tu API key en: https://etherscan.io/apidashboard
 */
async function main() {
  console.log("🔍 Verificando contratos en opBNBScan...\n");

  // Etherscan API V2 - Use ETHERSCAN_API_KEY (from etherscan.io, not BSCScan)
  const apiKey = process.env.ETHERSCAN_API_KEY || process.env.BSCSCAN_API_KEY || "J437RFU1KXCPYIPUI4238QC7Y87HC8ADKS";
  const network = "opBNBTestnet";
  
  // Load deployment addresses
  const deploymentsPath = path.join(__dirname, "../deployments/opbnb-testnet.json");
  if (!fs.existsSync(deploymentsPath)) {
    console.error("❌ No se encontró el archivo de deployment:", deploymentsPath);
    console.error("   Ejecuta primero: pnpm run deploy:testnet");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));
  const contracts = deployment.contracts;

  console.log("📋 Contratos a verificar:\n");

  // 1. Insurance Pool (BNB native - no constructor args)
  console.log("1️⃣ Verificando Insurance Pool (BNB native)...");
  try {
    await verifyContract(
      "InsurancePool",
      contracts.insurancePool,
      [], // No constructor arguments - uses BNB native
      apiKey,
      network
    );
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
  }

  // 2. Reputation Staking (BNB native - no constructor args)
  console.log("\n2️⃣ Verificando Reputation Staking (BNB native)...");
  try {
    await verifyContract(
      "ReputationStaking",
      contracts.reputationStaking,
      [], // No constructor arguments - uses BNB native
      apiKey,
      network
    );
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
  }

  // 3. AI Oracle
  console.log("\n3️⃣ Verificando AI Oracle...");
  try {
    await verifyContract(
      "AIOracle",
      contracts.aiOracle,
      [
        process.env.CHAINLINK_FUNCTIONS_ROUTER || "0x0000000000000000000000000000000000000000", // CHAINLINK_FUNCTIONS_ROUTER
        process.env.CHAINLINK_DON_ID || "0x0000000000000000000000000000000000000000000000000000000000000000", // CHAINLINK_DON_ID
        process.env.CHAINLINK_SUBSCRIPTION_ID ? parseInt(process.env.CHAINLINK_SUBSCRIPTION_ID) : 0, // CHAINLINK_SUBSCRIPTION_ID
        process.env.BACKEND_URL || "https://your-backend-url.com/api/oracle/resolve" // BACKEND_URL
      ],
      apiKey,
      network
    );
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
  }

  // 4. DAO Governance (BNB native)
  console.log("\n4️⃣ Verificando DAO Governance (BNB native)...");
  try {
    await verifyContract(
      "DAOGovernance",
      contracts.daoGovernance,
      [
        contracts.reputationStaking // Only reputation contract, no token
      ],
      apiKey,
      network
    );
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
  }

  // 5. OmniRouter (BNB native - no constructor args)
  console.log("\n5️⃣ Verificando Cross-Chain Router (OmniRouter) (BNB native)...");
  try {
    await verifyContract(
      "OmniRouter",
      contracts.crossChainRouter,
      [], // No constructor arguments - uses BNB native
      apiKey,
      network
    );
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
  }

  // 6. Binary Market (BNB native)
  console.log("\n6️⃣ Verificando Binary Market (BNB native)...");
  try {
    await verifyContract(
      "BinaryMarket",
      contracts.markets.binary,
      [
        deployment.deployer // coreContract (temporal, luego transferido)
      ],
      apiKey,
      network
    );
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
  }

  // 7. Conditional Market (BNB native)
  console.log("\n7️⃣ Verificando Conditional Market (BNB native)...");
  try {
    await verifyContract(
      "ConditionalMarket",
      contracts.markets.conditional,
      [
        deployment.deployer // coreContract (temporal)
      ],
      apiKey,
      network
    );
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
  }

  // 8. Subjective Market (BNB native)
  console.log("\n8️⃣ Verificando Subjective Market (BNB native)...");
  try {
    await verifyContract(
      "SubjectiveMarket",
      contracts.markets.subjective,
      [
        deployment.deployer, // coreContract (temporal)
        contracts.daoGovernance
      ],
      apiKey,
      network
    );
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
  }

  // 9. Prediction Market Core (BNB native - no token parameter)
  console.log("\n9️⃣ Verificando Prediction Market Core (BNB native)...");
  try {
    await verifyContract(
      "PredictionMarketCore",
      contracts.core,
      [
        contracts.markets.binary,
        contracts.markets.conditional,
        contracts.markets.subjective,
        contracts.aiOracle,
        contracts.reputationStaking,
        contracts.insurancePool,
        contracts.crossChainRouter,
        contracts.daoGovernance
      ],
      apiKey,
      network
    );
  } catch (error: any) {
    console.error("   ❌ Error:", error.message);
  }

  // 10. Chainlink Data Streams Integration (if deployed)
  if (contracts.dataStreamsIntegration && contracts.dataStreamsIntegration !== "0x0000000000000000000000000000000000000000") {
    console.log("\n🔟 Verificando Chainlink Data Streams Integration...");
    try {
      await verifyContract(
        "ChainlinkDataStreamsIntegration",
        contracts.dataStreamsIntegration,
        [
          process.env.CHAINLINK_DATA_STREAMS_VERIFIER_PROXY || "0x001225Aca0efe49Dbb48233aB83a9b4d177b581A"
        ],
        apiKey,
        network
      );
    } catch (error: any) {
      console.error("   ❌ Error:", error.message);
    }
  }

  console.log("\n✅ Verificación completada!");
  console.log("\n🔗 Verifica los contratos en opBNBScan:");
  console.log("   Core:", `https://testnet.opbnbscan.com/address/${contracts.core}`);
  console.log("   Insurance Pool:", `https://testnet.opbnbscan.com/address/${contracts.insurancePool}`);
  console.log("   AI Oracle:", `https://testnet.opbnbscan.com/address/${contracts.aiOracle}`);
  console.log("   Reputation Staking:", `https://testnet.opbnbscan.com/address/${contracts.reputationStaking}`);
  console.log("   DAO Governance:", `https://testnet.opbnbscan.com/address/${contracts.daoGovernance}`);
}

async function verifyContract(
  contractName: string,
  contractAddress: string,
  constructorArgs: any[],
  apiKey: string,
  network: string
) {
  console.log(`   📍 ${contractName}: ${contractAddress}`);
  
  // Add delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds delay
  
  try {
    // Try verification with explicit contract name to help Hardhat find the right artifact
    // The "General exception" error often occurs when Hardhat can't match the contract
    const verificationParams: any = {
      address: contractAddress,
      constructorArguments: constructorArgs,
    };
    
    // Specify the contract path to help Hardhat find the right artifact
    // This is important for contracts in subdirectories
    const contractPaths: { [key: string]: string } = {
      "InsurancePool": "contracts/oracle/InsurancePool.sol:InsurancePool",
      "ReputationStaking": "contracts/reputation/ReputationStaking.sol:ReputationStaking",
      "AIOracle": "contracts/oracle/AIOracle.sol:AIOracle",
      "DAOGovernance": "contracts/governance/DAOGovernance.sol:DAOGovernance",
      "OmniRouter": "contracts/aggregation/OmniRouter.sol:OmniRouter",
      "BinaryMarket": "contracts/markets/BinaryMarket.sol:BinaryMarket",
      "ConditionalMarket": "contracts/markets/ConditionalMarket.sol:ConditionalMarket",
      "SubjectiveMarket": "contracts/markets/SubjectiveMarket.sol:SubjectiveMarket",
      "PredictionMarketCore": "contracts/core/PredictionMarketCore.sol:PredictionMarketCore",
      "ChainlinkDataStreamsIntegration": "contracts/oracle/ChainlinkDataStreamsIntegration.sol:ChainlinkDataStreamsIntegration",
    };
    
    if (contractPaths[contractName]) {
      verificationParams.contract = contractPaths[contractName];
    }
    
    await hre.run("verify:verify", verificationParams);
    console.log(`   ✅ ${contractName} verificado exitosamente`);
  } catch (error: any) {
    const errorMsg = error.message || error.toString();
    if (errorMsg.includes("Already Verified") || 
        errorMsg.includes("already verified") ||
        errorMsg.includes("Contract source code already verified")) {
      console.log(`   ✅ ${contractName} ya estaba verificado`);
    } else if (errorMsg.includes("does not have bytecode") || 
               errorMsg.includes("Contract does not have bytecode")) {
      console.log(`   ⚠️  ${contractName} no tiene bytecode (puede ser un EOA)`);
    } else if (errorMsg.includes("Invalid API Key") || 
               errorMsg.includes("Invalid API") ||
               errorMsg.includes("invalid api key")) {
      console.error(`   ❌ Error: API Key inválida o no reconocida por Etherscan API V2`);
      console.error(`   💡 Asegúrate de tener una API key válida de Etherscan.io: https://etherscan.io/apidashboard`);
      console.error(`   💡 La API key debe ser de Etherscan.io (no de BSCScan), ya que ahora usan API V2 unificada`);
    } else if (errorMsg.includes("Too many invalid") || 
               errorMsg.includes("rate limit") ||
               errorMsg.includes("try again later")) {
      console.error(`   ⏳ Rate limit alcanzado. Espera unos minutos antes de intentar de nuevo.`);
    } else if (errorMsg.includes("General exception") || 
               errorMsg.includes("already verified") ||
               errorMsg.includes("Contract source code already verified")) {
      // This might mean the contract is already verified or there's a temporary issue
      console.log(`   ⚠️  ${contractName}: Error general (puede estar ya verificado o problema temporal)`);
      console.log(`   💡 Verifica manualmente en: https://opbnb-testnet.bscscan.com/address/${contractAddress}`);
    } else {
      console.error(`   ❌ Error verificando ${contractName}:`, errorMsg.substring(0, 200));
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

