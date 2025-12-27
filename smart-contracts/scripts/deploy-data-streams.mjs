// Script para desplegar ChainlinkDataStreamsIntegration
// Solución usando ethers directamente con artifacts de Hardhat
// Uso: npx hardhat run scripts/deploy-data-streams.mjs --network opBNBTestnet

import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  const verifierProxy = process.env.CHAINLINK_DATA_STREAMS_VERIFIER_PROXY || "0x001225Aca0efe49Dbb48233aB83a9b4d177b581A";
  
  console.log("📝 Desplegando ChainlinkDataStreamsIntegration...");
  console.log("   Verifier Proxy:", verifierProxy);
  
  // Obtener la URL de la red desde variables de entorno o configuración
  const rpcUrl = process.env.RPC_URL_TESTNET || "https://opbnb-testnet-rpc.bnbchain.org/";
  
  // Crear provider y signer
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY no está configurada en las variables de entorno");
  }
  const signer = new ethers.Wallet(privateKey, provider);
  
  console.log("📝 Deploying con cuenta:", await signer.getAddress());
  
  const balance = await provider.getBalance(await signer.getAddress());
  console.log("💰 Balance:", ethers.formatEther(balance), "BNB\n");
  
  // Obtener el artifact del contrato compilado
  const artifact = await hre.artifacts.readArtifact("ChainlinkDataStreamsIntegration");
  
  // Crear factory y desplegar
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
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
  process.exitCode = 1;
});
