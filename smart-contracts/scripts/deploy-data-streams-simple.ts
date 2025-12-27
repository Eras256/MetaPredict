// Script simple para desplegar ChainlinkDataStreamsIntegration
// Uso: npx hardhat run scripts/deploy-data-streams-simple.ts --network opBNBTestnet

import hre from "hardhat";

async function main() {
  const verifierProxy = process.env.CHAINLINK_DATA_STREAMS_VERIFIER_PROXY || "0x001225Aca0efe49Dbb48233aB83a9b4d177b581A";
  
  console.log("📝 Desplegando ChainlinkDataStreamsIntegration...");
  console.log("   Verifier Proxy:", verifierProxy);
  
  const factory = await hre.ethers.getContractFactory("ChainlinkDataStreamsIntegration");
  const contract = await factory.deploy(verifierProxy);
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("✅ Desplegado en:", address);
  console.log("\n📋 Actualiza tu .env con:");
  console.log(`NEXT_PUBLIC_DATA_STREAMS_INTEGRATION_ADDRESS=${address}`);
}

main().catch(console.error);

