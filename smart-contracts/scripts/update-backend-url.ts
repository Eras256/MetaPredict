// @ts-expect-error - hardhat exports ethers but TypeScript types may not reflect it
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CONTRACTS = {
  AI_ORACLE: "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c",
};

// Target URL: use metapredict.fun as production URL
// If BACKEND_URL is configured and is not "your-backend-url", use it
// Otherwise, use metapredict.fun directly
const envBackendUrl = process.env.BACKEND_URL || process.env.CHAINLINK_BACKEND_URL;
const TARGET_BACKEND_URL = (envBackendUrl && !envBackendUrl.includes('your-backend-url')) 
  ? envBackendUrl 
  : "https://metapredict.fun/api/oracle/resolve";

async function main() {
  console.log("🌐 Updating Backend URL in AI Oracle Contract\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} BNB\n`);

  const aiOracle = await ethers.getContractAt("AIOracle", CONTRACTS.AI_ORACLE, deployer);

  // Verify owner
  try {
    const owner = await aiOracle.owner();
    console.log(`📋 Contract Owner: ${owner}`);
    console.log(`📋 Deployer: ${deployer.address}`);
    
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log(`\n❌ ERROR: Deployer is not the contract owner`);
      console.log(`   Owner: ${owner}`);
      console.log(`   Deployer: ${deployer.address}`);
      console.log(`\n💡 Solution: Use the account that deployed the contract\n`);
      return;
    }
  } catch (error: any) {
    console.log(`⚠️  Could not verify owner: ${error.message}\n`);
  }

  // Get current URL
  const currentBackendUrl = await aiOracle.backendUrl();
  console.log(`📋 Current Backend URL: ${currentBackendUrl}`);
  console.log(`📋 Target Backend URL: ${TARGET_BACKEND_URL}\n`);

  if (currentBackendUrl === TARGET_BACKEND_URL) {
    console.log(`✅ Backend URL is already configured correctly`);
    console.log(`   No update required\n`);
    return;
  }

  console.log(`🔄 Updating Backend URL...\n`);

  try {
    const tx = await aiOracle.setBackendUrl(TARGET_BACKEND_URL);
    console.log(`⏳ Transaction sent: ${tx.hash}`);
    console.log(`🔗 Explorer: https://testnet.opbnbscan.com/tx/${tx.hash}\n`);

    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(`✅ Gas used: ${receipt.gasUsed.toString()}\n`);

    // Verify update
    const newBackendUrl = await aiOracle.backendUrl();
    console.log(`📋 Verification:`);
    console.log(`   Previous URL: ${currentBackendUrl}`);
    console.log(`   New URL: ${newBackendUrl}`);
    console.log(`   Match: ${newBackendUrl === TARGET_BACKEND_URL ? "✅" : "❌"}\n`);

    if (newBackendUrl === TARGET_BACKEND_URL) {
      console.log("=".repeat(80));
      console.log("✅ Backend URL updated successfully!");
      console.log("=".repeat(80));
    } else {
      console.log("=".repeat(80));
      console.log("⚠️  Backend URL updated but does not match target");
      console.log("=".repeat(80));
    }
  } catch (error: any) {
    console.log(`\n❌ Error updating Backend URL:`);
    console.log(`   ${error.message}\n`);
    
    if (error.message.includes("onlyOwner")) {
      console.log(`💡 Solution: Make sure to use the contract owner account`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

