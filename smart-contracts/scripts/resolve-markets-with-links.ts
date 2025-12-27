// @ts-expect-error - hardhat exports ethers but TypeScript types may not reflect it
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CONTRACTS = {
  PREDICTION_MARKET_CORE: "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1",
  AI_ORACLE: "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c",
  DATA_STREAMS_INTEGRATION: "0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3",
};

const EXPLORER_BASE = "https://testnet.opbnbscan.com";

interface TransactionLink {
  description: string;
  hash: string;
  link: string;
}

async function main() {
  console.log("🔗 Market Resolution with Transaction Links\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deployer: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB\n`);

  const core = await ethers.getContractAt("PredictionMarketCore", CONTRACTS.PREDICTION_MARKET_CORE, deployer);
  const aiOracle = await ethers.getContractAt("AIOracle", CONTRACTS.AI_ORACLE, deployer);

  // Get all markets
  const marketCounter = await core.marketCounter();
  console.log(`📊 Total Markets: ${marketCounter.toString()}\n`);

  const transactionLinks: TransactionLink[] = [];

  // Get recent markets (last 10)
  const recentMarkets: bigint[] = [];
  const maxMarkets = marketCounter > 10n ? 10n : marketCounter;
  
  for (let i = marketCounter; i > 0n && recentMarkets.length < Number(maxMarkets); i--) {
    recentMarkets.push(i - 1n);
  }

  console.log("📋 Recent Markets:\n");
  console.log("-".repeat(80));

  for (const marketId of recentMarkets) {
    try {
      const market = await core.markets(marketId);
      const status = market.status;
      
      if (status === 0) { // Active market
        console.log(`\nMarket ID: ${marketId}`);
        console.log(`   Question: ${market.question}`);
        console.log(`   Status: Active`);
        console.log(`   Total Volume: ${ethers.formatEther(market.totalVolume)} BNB`);
        console.log(`   Resolution Time: ${new Date(Number(market.resolutionTime) * 1000).toLocaleString()}`);
        console.log(`   Explorer: ${EXPLORER_BASE}/address/${CONTRACTS.PREDICTION_MARKET_CORE}#readContract`);
        
        // Try to resolve if resolution time has passed
        const currentTime = Math.floor(Date.now() / 1000);
        if (Number(market.resolutionTime) <= currentTime) {
          console.log(`   ⏰ Resolution time has passed, attempting resolution...`);
          
          try {
            // Call backend API for resolution
            const backendUrl = await aiOracle.backendUrl();
            console.log(`   📡 Calling backend: ${backendUrl}`);
            
            // Simulate resolution (you would call the actual backend here)
            const outcome = 1; // YES
            const confidence = 85;
            
            const tx = await aiOracle.fulfillResolutionManual(marketId, outcome, confidence);
            const receipt = await tx.wait();
            
            const link = `${EXPLORER_BASE}/tx/${receipt.hash}`;
            transactionLinks.push({
              description: `Market ${marketId} Resolution`,
              hash: receipt.hash,
              link: link,
            });
            
            console.log(`   ✅ Market resolved`);
            console.log(`   🔗 Resolution TX: ${link}`);
          } catch (error: any) {
            console.log(`   ⚠️  Resolution error: ${error.message}`);
          }
        }
      }
    } catch (error: any) {
      // Market might not exist, skip
    }
  }

  // Display all transaction links
  console.log("\n" + "=".repeat(80));
  console.log("🔗 All Transaction Links\n");
  console.log("=".repeat(80));

  if (transactionLinks.length === 0) {
    console.log("No transactions to display.\n");
  } else {
    transactionLinks.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.description}`);
      console.log(`   Hash: ${tx.hash}`);
      console.log(`   Link: ${tx.link}\n`);
    });
  }

  console.log("=".repeat(80));
  console.log("✅ Transaction Links Summary Complete");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

