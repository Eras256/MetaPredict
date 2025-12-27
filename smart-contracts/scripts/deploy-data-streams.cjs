// Script simple para desplegar ChainlinkDataStreamsIntegration
// Uso: npx hardhat run scripts/deploy-data-streams.cjs --network opBNBTestnet

async function main() {
  const hreModule = await import("hardhat");
  const hre = hreModule.default || hreModule;
  
  const verifierProxy = process.env.CHAINLINK_DATA_STREAMS_VERIFIER_PROXY || "0x001225Aca0efe49Dbb48233aB83a9b4d177b581A";
  
  console.log("📝 Desplegando ChainlinkDataStreamsIntegration...");
  console.log("   Verifier Proxy:", verifierProxy);
  
  // Access ethers through hre
  if (!hre.ethers) {
    console.error("❌ Error: ethers no está disponible en hre");
    console.error("   Esto puede ser un problema con la configuración de Hardhat 3.x y ES modules");
    process.exit(1);
  }
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying con cuenta:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "BNB\n");
  
  const factory = await hre.ethers.getContractFactory("ChainlinkDataStreamsIntegration");
  const contract = await factory.deploy(verifierProxy);
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("\n✅ Desplegado en:", address);
  console.log("\n📋 Actualiza tu .env o .env.local con:");
  console.log(`NEXT_PUBLIC_DATA_STREAMS_INTEGRATION_ADDRESS=${address}`);
  console.log("\n🔗 Ver en opBNBScan:");
  console.log(`https://testnet.opbnbscan.com/address/${address}`);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
