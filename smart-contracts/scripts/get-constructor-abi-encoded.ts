import { ethers } from "ethers";

/**
 * Script para generar los argumentos del constructor en formato ABI-encoded
 * para usar en opBNBScan verification
 */
async function main() {
  // Argumentos del constructor en el orden correcto
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

  // ABI del constructor: constructor(address,address,address,address,address,address,address,address)
  const constructorAbi = "constructor(address,address,address,address,address,address,address,address)";
  
  const iface = new ethers.Interface([constructorAbi]);
  const encoded = iface.encodeDeploy(constructorArgs);
  
  console.log("📋 Argumentos del constructor (formato individual):");
  constructorArgs.forEach((arg, i) => {
    console.log(`  ${i + 1}. ${arg}`);
  });
  
  console.log("\n📋 Argumentos ABI-Encoded (para opBNBScan):");
  console.log(encoded);
  
  console.log("\n💡 En opBNBScan:");
  console.log("   - Si hay un campo 'Constructor Arguments (ABI-Encoded)', usa el valor de arriba");
  console.log("   - Si hay campos separados, usa los valores individuales de arriba");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

