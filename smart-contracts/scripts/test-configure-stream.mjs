// Script para probar que configureMarketStream funciona sin onlyOwner
import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  const contractAddress = process.env.DATA_STREAMS_INTEGRATION_ADDRESS || "0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3";
  const rpcUrl = process.env.RPC_URL_TESTNET || "https://opbnb-testnet-rpc.bnbchain.org/";
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error("PRIVATE_KEY no está configurada");
  }
  
  console.log("🧪 Probando configureMarketStream...");
  console.log("   Contract:", contractAddress);
  console.log("   RPC:", rpcUrl, "\n");
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  
  console.log("📝 Usando cuenta:", await signer.getAddress());
  
  // Get artifact
  const artifact = await hre.artifacts.readArtifact("ChainlinkDataStreamsIntegration");
  const contract = new ethers.Contract(contractAddress, artifact.abi, signer);
  
  // Test configureMarketStream
  const testMarketId = 999; // Market ID de prueba
  const testStreamId = "0x00039d9e45394f473ab1f050a1b963e6b05351e52d71e507509ada0c95ed75b8"; // BTC/USD Stream ID
  const testTargetPrice = ethers.parseUnits("50000", 8); // $50,000
  
  try {
    console.log("\n📝 Intentando configurar Stream ID...");
    console.log("   Market ID:", testMarketId);
    console.log("   Stream ID:", testStreamId);
    console.log("   Target Price:", ethers.formatUnits(testTargetPrice, 8), "USD\n");
    
    const tx = await contract.configureMarketStream(
      testMarketId,
      testStreamId,
      testTargetPrice
    );
    
    console.log("⏳ Esperando confirmación...");
    const receipt = await tx.wait();
    
    console.log("\n✅ ¡Éxito! configureMarketStream funciona sin onlyOwner");
    console.log("   Transaction:", receipt.hash);
    console.log("   Block:", receipt.blockNumber);
    
    // Verificar que se configuró
    const configuredStreamId = await contract.marketStreamId(testMarketId);
    const configuredTargetPrice = await contract.marketTargetPrice(testMarketId);
    
    console.log("\n✅ Verificación:");
    console.log("   Stream ID configurado:", configuredStreamId);
    console.log("   Target Price configurado:", ethers.formatUnits(configuredTargetPrice, 8), "USD");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    
    if (error.message.includes("0x118cdaa7") || error.message.includes("OwnableUnauthorizedAccount")) {
      console.error("\n⚠️ El contrato AÚN tiene la restricción onlyOwner");
      console.error("   Necesitas desplegar nuevamente el contrato con el código actualizado");
    } else {
      throw error;
    }
  }
}

main().catch(console.error);

