import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load .env from root directory (1 level up from smart-contracts/)
// .env.local has priority - load it LAST so it overwrites .env
const envPath = path.resolve(process.cwd(), '../.env');
const envLocalPath = path.resolve(process.cwd(), '../.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

// Import ethers - @nomicfoundation/hardhat-toolbox provides this
// @ts-ignore - Hardhat types may not be fully updated
// @ts-expect-error - hardhat exports ethers but TypeScript types may not reflect it
import { ethers } from "hardhat";

async function main() {
  console.log("📝 Desplegando ChainlinkDataStreamsIntegration...\n");

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

  // Helper function to get contract address
  const getAddress = async (contract: any) => await contract.getAddress();

  // Deploy ChainlinkDataStreamsIntegration
  const verifierProxy = process.env.CHAINLINK_DATA_STREAMS_VERIFIER_PROXY || "0x001225Aca0efe49Dbb48233aB83a9b4d177b581A";
  console.log("📝 Desplegando ChainlinkDataStreamsIntegration...");
  console.log("   Verifier Proxy:", verifierProxy, "\n");

  const ChainlinkDataStreamsIntegration = await ethers.getContractFactory("ChainlinkDataStreamsIntegration");
  const dataStreamsIntegration = await ChainlinkDataStreamsIntegration.deploy(verifierProxy);
  await dataStreamsIntegration.waitForDeployment();
  
  const dataStreamsAddress = await getAddress(dataStreamsIntegration);
  console.log("✅ ChainlinkDataStreamsIntegration desplegado!");
  console.log("   Address:", dataStreamsAddress);
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

