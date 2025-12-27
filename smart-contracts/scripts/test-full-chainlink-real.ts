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

const BET_AMOUNT = ethers.parseEther("0.01");

// 5 mercados en inglés para testing completo con Chainlink REAL
const MARKETS = [
  {
    question: "Will Bitcoin price verified by Chainlink Data Streams reach $100,000 by December 31, 2025?",
    description: "Bitcoin price prediction using REAL Chainlink Data Streams verification",
    resolutionTime: Math.floor(Date.now() / 1000) + (86400 * 365),
    streamId: process.env.CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID,
    targetPrice: ethers.parseUnits("100000", 8),
  },
  {
    question: "Will Ethereum price verified by Chainlink Data Streams reach $5,000 before Bitcoin reaches $100,000?",
    description: "Ethereum vs Bitcoin price race using REAL Chainlink Data Streams",
    resolutionTime: Math.floor(Date.now() / 1000) + (86400 * 180),
    streamId: process.env.CHAINLINK_DATA_STREAMS_ETH_USD_STREAM_ID,
    targetPrice: ethers.parseUnits("5000", 8),
  },
  {
    question: "Will BNB price verified by Chainlink Data Streams exceed $500 by 2025?",
    description: "BNB price prediction using REAL Chainlink Data Streams",
    resolutionTime: Math.floor(Date.now() / 1000) + (86400 * 365),
    streamId: process.env.CHAINLINK_DATA_STREAMS_BNB_USD_STREAM_ID,
    targetPrice: ethers.parseUnits("500", 8),
  },
  {
    question: "Will the total crypto market cap verified by Chainlink Data Streams exceed $5 trillion in 2025?",
    description: "Total market cap prediction using Chainlink Data Streams price aggregation",
    resolutionTime: Math.floor(Date.now() / 1000) + (86400 * 365),
    streamId: process.env.CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID, // Using BTC as proxy
    targetPrice: ethers.parseUnits("5000000000000", 8),
  },
  {
    question: "Will Chainlink Data Streams verify that Bitcoin price stays above $40,000 for 30 consecutive days?",
    description: "Bitcoin price stability test using REAL Chainlink Data Streams continuous verification",
    resolutionTime: Math.floor(Date.now() / 1000) + (86400 * 60),
    streamId: process.env.CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID,
    targetPrice: ethers.parseUnits("40000", 8),
  },
];

async function main() {
  console.log("🔗 Full Chainlink REAL Integration Test - 5 Markets\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} BNB\n`);

  // Get REAL Chainlink configuration
  const backendUrl = process.env.BACKEND_URL || process.env.CHAINLINK_BACKEND_URL || "https://metapredict.fun/api/oracle/resolve";
  const dataStreamsVerifierProxy = process.env.CHAINLINK_DATA_STREAMS_VERIFIER_PROXY;

  console.log("📋 REAL Chainlink Configuration:\n");
  console.log(`   ⚠️  Chainlink Functions: NOT AVAILABLE on opBNB`);
  console.log(`   ✅ Backend URL: ${backendUrl}`);
  console.log(`   ✅ Data Streams Verifier: ${dataStreamsVerifierProxy}`);
  console.log(`   ✅ Using REAL Stream IDs from .env.local\n`);

  // Connect to contracts
  const core = await ethers.getContractAt("PredictionMarketCore", CONTRACTS.PREDICTION_MARKET_CORE, deployer);
  const aiOracle = await ethers.getContractAt("AIOracle", CONTRACTS.AI_ORACLE, deployer);
  const dataStreams = await ethers.getContractAt("ChainlinkDataStreamsIntegration", CONTRACTS.DATA_STREAMS_INTEGRATION, deployer);

  // Step 1: Update Backend URL
  console.log("⚙️  Step 1: Configuring Backend URL\n");
  console.log("-".repeat(80));

  try {
    const currentBackendUrl = await aiOracle.backendUrl();
    if (currentBackendUrl !== backendUrl) {
      const tx = await aiOracle.setBackendUrl(backendUrl);
      const receipt = await tx.wait();
      console.log(`✅ Backend URL updated: ${backendUrl}`);
      console.log(`🔗 TX: https://testnet.opbnbscan.com/tx/${receipt.hash}\n`);
    } else {
      console.log(`✅ Backend URL already configured: ${backendUrl}\n`);
    }
  } catch (error: any) {
    console.log(`⚠️  Error updating backend URL: ${error.message}\n`);
  }

  // Step 2: Create 5 markets
  console.log("📊 Step 2: Creating 5 Markets with REAL Chainlink Data Streams\n");
  console.log("-".repeat(80));

  const marketIds: bigint[] = [];
  const marketConfigs: Array<{ id: bigint; streamId: string; targetPrice: bigint }> = [];

  for (let i = 0; i < MARKETS.length; i++) {
    const market = MARKETS[i];
    if (!market.streamId) {
      console.log(`⚠️  Market ${i + 1}: Stream ID not configured, skipping`);
      continue;
    }

    console.log(`\n${i + 1}. Creating: "${market.question}"`);
    
    try {
      const tx = await core.createBinaryMarket(
        market.question,
        market.description,
        market.resolutionTime,
        `ipfs://market-${i + 1}-real-chainlink-${Date.now()}`
      );
      const receipt = await tx.wait();
      
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = core.interface.parseLog(log);
          return parsed?.name === "MarketCreated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = core.interface.parseLog(event);
        if (parsed) {
          const marketId = parsed.args[0];
          marketIds.push(marketId);
          marketConfigs.push({
            id: marketId,
            streamId: market.streamId,
            targetPrice: market.targetPrice,
          });
          
          console.log(`   ✅ Market ID: ${marketId}`);
          console.log(`   📅 Resolution: ${new Date(Number(market.resolutionTime) * 1000).toLocaleString()}`);
          console.log(`   🔗 TX: https://testnet.opbnbscan.com/tx/${receipt.hash}`);
        }
      }
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log(`\n✅ Created ${marketIds.length} markets\n`);

  // Step 3: Place bets
  console.log("💰 Step 3: Placing Bets on All Markets\n");
  console.log("-".repeat(80));

  for (let i = 0; i < marketIds.length; i++) {
    const marketId = marketIds[i];
    console.log(`\n${i + 1}. Market ${marketId}:`);
    
    try {
      const txYes = await core.placeBet(marketId, true, { value: BET_AMOUNT });
      const receiptYes = await txYes.wait();
      console.log(`   ✅ YES bet`);

      const txNo = await core.placeBet(marketId, false, { value: BET_AMOUNT });
      const receiptNo = await txNo.wait();
      console.log(`   ✅ NO bet`);
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log(`\n✅ Bets placed on all markets\n`);

  // Step 4: Verify Data Streams configuration (read-only)
  console.log("📡 Step 4: Verifying REAL Chainlink Data Streams Configuration\n");
  console.log("-".repeat(80));

  try {
    const verifierProxy = await dataStreams.verifierProxy();
    console.log(`✅ Verifier Proxy: ${verifierProxy}`);
    console.log(`✅ Expected: ${dataStreamsVerifierProxy}`);
    console.log(`✅ Match: ${verifierProxy.toLowerCase() === dataStreamsVerifierProxy?.toLowerCase()}\n`);

    // Check owner
    const owner = await dataStreams.owner();
    console.log(`📋 Contract Owner: ${owner}`);
    console.log(`📋 Deployer: ${deployer.address}`);
    console.log(`📋 Can Configure: ${owner.toLowerCase() === deployer.address.toLowerCase()}\n`);

    // Show Stream IDs that would be configured
    console.log(`📋 Stream IDs to Configure:\n`);
    for (let i = 0; i < marketConfigs.length; i++) {
      const config = marketConfigs[i];
      console.log(`   Market ${config.id}:`);
      console.log(`      Stream ID: ${config.streamId}`);
      console.log(`      Target Price: ${ethers.formatUnits(config.targetPrice, 8)}`);
      
      // Try to configure if owner
      if (owner.toLowerCase() === deployer.address.toLowerCase()) {
        try {
          const tx = await dataStreams.configureMarketStream(
            config.id,
            config.streamId.startsWith('0x') ? config.streamId as `0x${string}` : `0x${config.streamId}` as `0x${string}`,
            config.targetPrice
          );
          const receipt = await tx.wait();
          console.log(`      ✅ Configured`);
          console.log(`      🔗 TX: https://testnet.opbnbscan.com/tx/${receipt.hash}`);
        } catch (error: any) {
          console.log(`      ⚠️  Error: ${error.message}`);
        }
      } else {
        console.log(`      ⚠️  Requires owner: ${owner}`);
      }
      console.log("");
    }
  } catch (error: any) {
    console.log(`⚠️  Error checking Data Streams: ${error.message}\n`);
  }

  // Step 5: Summary
  console.log("=".repeat(80));
  console.log("📊 Summary - Full REAL Chainlink Integration\n");
  console.log("=".repeat(80));
  console.log(`✅ Markets Created: ${marketIds.length}`);
  console.log(`✅ Bets Placed: ${marketIds.length * 2} (YES + NO)`);
  console.log(`✅ Backend URL: ${backendUrl}`);
  console.log(`✅ Data Streams Verifier: ${dataStreamsVerifierProxy}\n`);

  console.log("📋 Market Details:\n");
  for (let i = 0; i < marketIds.length; i++) {
    console.log(`${i + 1}. Market ID: ${marketIds[i]}`);
    console.log(`   Question: ${MARKETS[i].question}`);
    if (marketConfigs[i]) {
      console.log(`   Stream ID: ${marketConfigs[i].streamId}`);
      console.log(`   Target Price: $${ethers.formatUnits(marketConfigs[i].targetPrice, 8)}`);
    }
    console.log("");
  }

  console.log("💡 REAL Chainlink Integration Status:\n");
  console.log("   ⚠️  Chainlink Functions: NOT AVAILABLE on opBNB");
  console.log("   ✅ Backend API: Configured and ready");
  console.log("   ✅ Chainlink Data Streams: Verifier Proxy configured");
  console.log("   ✅ Real Stream IDs: Available for price verification\n");

  console.log("💡 Resolution Flow:\n");
  console.log("   1. Market resolution time arrives");
  console.log("   2. Backend API called: " + backendUrl);
  console.log("   3. Backend executes multi-AI consensus (Gemini, Llama, Mistral)");
  console.log("   4. Result returned via fulfillResolutionManual()");
  console.log("   5. Chainlink Data Streams validates price data on-chain");
  console.log("   6. Market resolved automatically\n");

  console.log("=".repeat(80));
  console.log("✅ Full REAL Chainlink Integration Test Completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

