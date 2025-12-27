// Script para verificar el código del contrato desplegado
import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  const contractAddress = "0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3";
  const rpcUrl = process.env.RPC_URL_TESTNET || "https://opbnb-testnet-rpc.bnbchain.org/";
  
  console.log("🔍 Verificando código del contrato desplegado...");
  console.log("   Address:", contractAddress);
  console.log("   RPC:", rpcUrl, "\n");
  
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  // Get contract code
  const code = await provider.getCode(contractAddress);
  console.log("📋 Código del contrato:");
  console.log("   Length:", code.length);
  console.log("   Has code:", code !== "0x" && code.length > 2);
  
  // Try to get the artifact and compare
  try {
    const artifact = await hre.artifacts.readArtifact("ChainlinkDataStreamsIntegration");
    console.log("\n✅ Artifact encontrado localmente");
    console.log("   Bytecode length:", artifact.bytecode.length);
    
    // Get bytecode from contract
    const deployedCode = await provider.getCode(contractAddress);
    console.log("\n📊 Comparación:");
    console.log("   Deployed code length:", deployedCode.length);
    console.log("   Local bytecode length:", artifact.bytecode.length);
    
    // Check if they match (deployed code is usually shorter because it excludes constructor)
    const deployedBytecode = artifact.deployedBytecode || artifact.bytecode;
    const deployedCodeClean = deployedCode.replace(/^0x/, '');
    const localBytecodeClean = deployedBytecode.replace(/^0x/, '');
    
    // Check if the deployed code contains key parts of our bytecode
    if (localBytecodeClean.includes(deployedCodeClean.substring(2)) || 
        deployedCodeClean.includes(localBytecodeClean.substring(0, 100))) {
      console.log("\n✅ El código parece coincidir");
    } else {
      console.log("\n⚠️ El código puede no coincidir exactamente");
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error);

