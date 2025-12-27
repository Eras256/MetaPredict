import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load .env from root directory (1 level up from smart-contracts/)
// .env.local has priority - load it LAST so it overwrites .env
const envPath = path.resolve(process.cwd(), '../.env');
const envLocalPath = path.resolve(process.cwd(), '../.env.local');

console.log("🔍 Loading environment variables...");
console.log("   .env path:", envPath);
console.log("   .env.local path:", envLocalPath);
console.log("   .env exists:", fs.existsSync(envPath));
console.log("   .env.local exists:", fs.existsSync(envLocalPath));

// Load .env first
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("   ✅ Loaded .env");
}

// Load .env.local last (overwrites .env)
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
  console.log("   ✅ Loaded .env.local (overrides .env)");
}
console.log("");

// Import ethers - @nomicfoundation/hardhat-toolbox provides this
// @ts-ignore - Hardhat types may not be fully updated
// @ts-expect-error - hardhat exports ethers but TypeScript types may not reflect it
import { ethers } from "hardhat";

/**
 * Script para redesplegar ChainlinkDataStreamsIntegration
 * 
 * Este script redespliega el contrato con las correcciones aplicadas
 */
async function main() {
  console.log("🔄 Redesplegando ChainlinkDataStreamsIntegration...\n");

  // Check PRIVATE_KEY
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey === 'your_private_key_here') {
    console.error("❌ ERROR: PRIVATE_KEY no está configurada en .env o .env.local");
    process.exit(1);
  }

  // Check VERIFIER_PROXY
  const verifierProxy = process.env.CHAINLINK_DATA_STREAMS_VERIFIER_PROXY;
  if (!verifierProxy || verifierProxy === '0x0000000000000000000000000000000000000000') {
    console.error("❌ ERROR: CHAINLINK_DATA_STREAMS_VERIFIER_PROXY no está configurado");
    console.error("   Configúralo en .env o .env.local");
    process.exit(1);
  }

  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No signers available. Hardhat config issue - check hardhat.config.ts");
  }

  const deployer = signers[0];
  console.log("📝 Deploying con cuenta:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "BNB\n");

  if (balance < ethers.parseEther("0.01")) {
    console.warn("⚠️  Balance bajo. Asegúrate de tener suficiente BNB para gas.\n");
  }

  // Deploy ChainlinkDataStreamsIntegration
  console.log("📝 Desplegando ChainlinkDataStreamsIntegration...");
  console.log("   Verifier Proxy:", verifierProxy, "\n");

  const ChainlinkDataStreamsIntegration = await ethers.getContractFactory("ChainlinkDataStreamsIntegration");
  const dataStreamsIntegration = await ChainlinkDataStreamsIntegration.deploy(verifierProxy);
  await dataStreamsIntegration.waitForDeployment();
  
  const dataStreamsAddress = await dataStreamsIntegration.getAddress();
  console.log("✅ ChainlinkDataStreamsIntegration desplegado!");
  console.log("   Address:", dataStreamsAddress);
  
  // Get deployment transaction
  const deployTx = dataStreamsIntegration.deploymentTransaction();
  if (deployTx) {
    const receipt = await deployTx.wait();
    console.log("   Transaction:", receipt?.hash);
    console.log("   Gas usado:", receipt?.gasUsed.toString());
  }

  // Helper function to get address
  const getAddress = async (contract: any) => {
    if (typeof contract.getAddress === 'function') {
      return await contract.getAddress();
    }
    return contract.address;
  };

  // Update deployments file
  const deploymentsPath = path.join(process.cwd(), "deployments/opbnb-testnet.json");
  let deployments: any = {};
  
  if (fs.existsSync(deploymentsPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  } else {
    // Create directory if it doesn't exist
    const deploymentsDir = path.dirname(deploymentsPath);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    deployments.network = "opBNB Testnet";
    deployments.contracts = {};
  }

  if (!deployments.contracts) {
    deployments.contracts = {};
  }

  deployments.contracts.dataStreamsIntegration = dataStreamsAddress;
  deployments.lastUpdated = new Date().toISOString();

  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log("\n✅ Archivo de deployments actualizado:", deploymentsPath);

  // Show info about updating .env
  console.log("\n📋 IMPORTANTE: Actualiza la dirección en tu .env o .env.local:");
  console.log("   NEXT_PUBLIC_DATA_STREAMS_INTEGRATION_ADDRESS=" + dataStreamsAddress);
  console.log("\n🔗 Ver el contrato en opBNBScan:");
  console.log("   https://testnet.opbnbscan.com/address/" + dataStreamsAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
