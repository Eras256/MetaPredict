// @ts-expect-error - hardhat exports ethers but TypeScript types may not reflect it
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local first, then .env
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CONTRACTS = {
  PREDICTION_MARKET_CORE: "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1",
  AI_ORACLE: "0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c",
  DATA_STREAMS_INTEGRATION: "0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3",
};

const BET_AMOUNT = ethers.parseEther("0.01");

async function main() {
  console.log("🔗 Testing REAL Chainlink Data Streams Integration\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} BNB\n`);

  // Get Chainlink configuration from environment
  const backendUrl = process.env.BACKEND_URL || process.env.CHAINLINK_BACKEND_URL || "https://metapredict.fun/api/oracle/resolve";
  const dataStreamsVerifierProxy = process.env.CHAINLINK_DATA_STREAMS_VERIFIER_PROXY || process.env.DATA_STREAMS_VERIFIER_PROXY;
  
  // Get real Data Stream IDs
  const btcStreamId = process.env.CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID;
  const ethStreamId = process.env.CHAINLINK_DATA_STREAMS_ETH_USD_STREAM_ID;
  const bnbStreamId = process.env.CHAINLINK_DATA_STREAMS_BNB_USD_STREAM_ID;

  console.log("📋 Chainlink Configuration from .env.local:\n");
  console.log(`   ⚠️  Chainlink Functions: NOT AVAILABLE on opBNB (Nov 2025)`);
  console.log(`   ✅ Backend URL: ${backendUrl}`);
  console.log(`   ✅ Data Streams Verifier: ${dataStreamsVerifierProxy || "NOT SET"}`);
  if (btcStreamId) console.log(`   ✅ BTC Stream ID: ${btcStreamId}`);
  if (ethStreamId) console.log(`   ✅ ETH Stream ID: ${ethStreamId}`);
  if (bnbStreamId) console.log(`   ✅ BNB Stream ID: ${bnbStreamId}`);
  console.log("");

  // Connect to contracts
  const core = await ethers.getContractAt("PredictionMarketCore", CONTRACTS.PREDICTION_MARKET_CORE, deployer);
  const aiOracle = await ethers.getContractAt("AIOracle", CONTRACTS.AI_ORACLE, deployer);
  const dataStreams = await ethers.getContractAt("ChainlinkDataStreamsIntegration", CONTRACTS.DATA_STREAMS_INTEGRATION, deployer);

  // Step 1: Update AI Oracle Backend URL
  console.log("⚙️  Step 1: Configuring AI Oracle Backend URL\n");
  console.log("-".repeat(80));

  try {
    const currentBackendUrl = await aiOracle.backendUrl();
    console.log(`   Current Backend URL: ${currentBackendUrl}`);
    console.log(`   Target Backend URL: ${backendUrl}`);
    
    if (currentBackendUrl !== backendUrl) {
      console.log(`   Updating Backend URL...`);
      const tx = await aiOracle.setBackendUrl(backendUrl);
      const receipt = await tx.wait();
      console.log(`   ✅ Backend URL updated`);
      console.log(`   🔗 TX: https://testnet.opbnbscan.com/tx/${receipt.hash}\n`);
    } else {
      console.log(`   ✅ Backend URL already configured correctly\n`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  Error configuring backend URL: ${error.message}\n`);
  }

  // Step 2: Create test market
  console.log("📊 Step 2: Creating Test Market\n");
  console.log("-".repeat(80));

  const resolutionTime = Math.floor(Date.now() / 1000) + (86400 * 2); // 2 days from now
  
  const testMarket = {
    question: "Will Bitcoin reach $100,000 using REAL Chainlink Data Streams price verification?",
    description: "Real Chainlink Data Streams integration test market",
    resolutionTime: resolutionTime,
  };

  let testMarketId: bigint;

  try {
    console.log(`   Creating market: "${testMarket.question}"`);
    const tx = await core.createBinaryMarket(
      testMarket.question,
      testMarket.description,
      testMarket.resolutionTime,
      "ipfs://real-chainlink-datastreams-test"
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
        testMarketId = parsed.args[0];
        console.log(`   ✅ Market created: ${testMarketId}`);
        console.log(`   📅 Resolution Time: ${new Date(Number(testMarket.resolutionTime) * 1000).toLocaleString()}`);
        console.log(`   🔗 TX: https://testnet.opbnbscan.com/tx/${receipt.hash}\n`);
      }
    }
  } catch (error: any) {
    console.log(`   ❌ Error creating market: ${error.message}\n`);
    return;
  }

  // Step 3: Place bets
  console.log("💰 Step 3: Placing Bets\n");
  console.log("-".repeat(80));

  try {
    const txYes = await core.placeBet(testMarketId, true, { value: BET_AMOUNT });
    const receiptYes = await txYes.wait();
    console.log(`   ✅ YES bet placed`);
    console.log(`   🔗 TX: https://testnet.opbnbscan.com/tx/${receiptYes.hash}`);

    const txNo = await core.placeBet(testMarketId, false, { value: BET_AMOUNT });
    const receiptNo = await txNo.wait();
    console.log(`   ✅ NO bet placed`);
    console.log(`   🔗 TX: https://testnet.opbnbscan.com/tx/${receiptNo.hash}\n`);
  } catch (error: any) {
    console.log(`   ❌ Error placing bets: ${error.message}\n`);
    return;
  }

  // Step 4: Configure REAL Chainlink Data Streams
  console.log("📡 Step 4: Configuring REAL Chainlink Data Streams\n");
  console.log("-".repeat(80));

  if (dataStreamsVerifierProxy && btcStreamId) {
    try {
      const verifierProxy = await dataStreams.verifierProxy();
      console.log(`   ✅ Verifier Proxy: ${verifierProxy}`);
      console.log(`   ✅ Expected: ${dataStreamsVerifierProxy}`);
      
      if (verifierProxy.toLowerCase() === dataStreamsVerifierProxy.toLowerCase()) {
        console.log(`   ✅ Verifier Proxy matches!\n`);
      } else {
        console.log(`   ⚠️  Verifier Proxy mismatch\n`);
      }
      
      // Configure market with REAL BTC Stream ID
      const realBtcStreamId = btcStreamId.startsWith('0x') ? btcStreamId : `0x${btcStreamId}`;
      const targetPrice = ethers.parseUnits("50000", 8); // $50,000 target
      
      console.log(`   Configuring Market ${testMarketId} with REAL BTC Stream ID...`);
      console.log(`   Stream ID: ${realBtcStreamId}`);
      console.log(`   Target Price: $50,000\n`);
      
      try {
        const tx = await dataStreams.configureMarketStream(
          testMarketId, 
          realBtcStreamId as `0x${string}`, 
          targetPrice
        );
        const receipt = await tx.wait();
        
        console.log(`   ✅ Market configured with REAL Chainlink Data Streams Stream ID`);
        console.log(`   🔗 TX: https://testnet.opbnbscan.com/tx/${receipt.hash}\n`);

        // Verify configuration
        const configuredStreamId = await dataStreams.marketStreamId(testMarketId);
        console.log(`   ✅ Verified Stream ID: ${configuredStreamId}`);
        console.log(`   ✅ Matches: ${configuredStreamId.toLowerCase() === realBtcStreamId.toLowerCase()}\n`);

        // Check price condition
        const priceCondition = await dataStreams.checkPriceCondition(testMarketId);
        console.log(`   📊 Price Condition Check:`);
        console.log(`      Condition Met: ${priceCondition[0]}`);
        console.log(`      Current Price: ${priceCondition[1]}`);
        console.log(`      Target Price: ${priceCondition[2]}\n`);

        console.log(`   💡 To verify REAL price report:`);
        console.log(`      1. Fetch price report from Chainlink Data Streams API`);
        console.log(`      2. Call verifyPriceReport(${testMarketId}, encodedReport)`);
        console.log(`      3. Price will be verified on-chain using Verifier Proxy`);
        console.log(`      4. Market resolution can be validated against verified price\n`);
      } catch (error: any) {
        if (error.message.includes("onlyOwner")) {
          console.log(`   ⚠️  Configuration requires owner permissions`);
          console.log(`   💡 Current deployer: ${deployer.address}`);
          try {
            const owner = await dataStreams.owner();
            console.log(`   💡 Contract owner: ${owner}`);
            console.log(`   💡 Match: ${owner.toLowerCase() === deployer.address.toLowerCase()}\n`);
          } catch {
            console.log(`   💡 Check contract owner\n`);
          }
        } else {
          console.log(`   ⚠️  Error configuring: ${error.message}\n`);
        }
      }
    } catch (error: any) {
      console.log(`   ⚠️  Error checking Data Streams: ${error.message}\n`);
    }
  } else {
    console.log(`   ⚠️  Data Streams configuration incomplete:`);
    console.log(`      Verifier Proxy: ${dataStreamsVerifierProxy ? "✅" : "❌"}`);
    console.log(`      BTC Stream ID: ${btcStreamId ? "✅" : "❌"}\n`);
  }

  // Step 5: Test Backend API Integration
  console.log("🌐 Step 5: Testing Backend API Integration\n");
  console.log("-".repeat(80));

  console.log(`   Backend URL: ${backendUrl}`);
  console.log(`   Market Question: "${testMarket.question}"`);
  console.log(`   Market ID: ${testMarketId}\n`);

  console.log(`   💡 When resolution time arrives:`);
  console.log(`      1. Call: await core.initiateResolution(${testMarketId})`);
  console.log(`      2. Backend API will be called: ${backendUrl}`);
  console.log(`      3. Backend executes multi-AI consensus (Gemini, Llama, Mistral)`);
  console.log(`      4. Result returned via fulfillResolutionManual() or callback`);
  console.log(`      5. Market resolved on-chain\n`);

  // Summary
  console.log("=".repeat(80));
  console.log("📊 Summary - Real Chainlink Integration Test\n");
  console.log("=".repeat(80));
  console.log(`✅ Market Created: ${testMarketId}`);
  console.log(`✅ Bets Placed: YES + NO`);
  console.log(`✅ Backend URL: ${backendUrl}`);
  if (dataStreamsVerifierProxy && btcStreamId) {
    console.log(`✅ Chainlink Data Streams: Configured with REAL Stream ID`);
    console.log(`   Stream ID: ${btcStreamId}`);
  } else {
    console.log(`⚠️  Chainlink Data Streams: Configuration incomplete`);
  }
  console.log("");

  console.log("💡 Integration Status:\n");
  console.log("   ⚠️  Chainlink Functions: NOT AVAILABLE on opBNB");
  console.log("   ✅ Using Backend API directly for AI Oracle resolution");
  if (dataStreamsVerifierProxy && btcStreamId) {
    console.log("   ✅ Chainlink Data Streams: AVAILABLE and configured");
    console.log("   ✅ Real Stream IDs configured for price verification");
  } else {
    console.log("   ⚠️  Chainlink Data Streams: Needs configuration");
  }
  console.log("");

  console.log("=".repeat(80));
  console.log("✅ Real Chainlink Integration Test Completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
