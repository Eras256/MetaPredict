// @ts-expect-error - hardhat exports ethers but TypeScript types may not reflect it
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CONTRACTS = {
  PREDICTION_MARKET_CORE: "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1",
  DATA_STREAMS_INTEGRATION: "0x1758d4da0bAd4DB90Dfd56Be259C19cabDcF03fd",
};

async function main() {
  console.log("📡 Testing REAL Chainlink Data Streams Price Verification\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deployer: ${deployer.address}\n`);

  // Get real Stream IDs from .env.local
  const btcStreamId = process.env.CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID;
  const ethStreamId = process.env.CHAINLINK_DATA_STREAMS_ETH_USD_STREAM_ID;
  const bnbStreamId = process.env.CHAINLINK_DATA_STREAMS_BNB_USD_STREAM_ID;
  const dataStreamsVerifierProxy = process.env.CHAINLINK_DATA_STREAMS_VERIFIER_PROXY;

  console.log("📋 Real Chainlink Data Streams Configuration:\n");
  console.log(`   Verifier Proxy: ${dataStreamsVerifierProxy}`);
  console.log(`   BTC Stream ID: ${btcStreamId}`);
  console.log(`   ETH Stream ID: ${ethStreamId}`);
  console.log(`   BNB Stream ID: ${bnbStreamId}\n`);

  const dataStreams = await ethers.getContractAt(
    "ChainlinkDataStreamsIntegration",
    CONTRACTS.DATA_STREAMS_INTEGRATION,
    deployer
  );

  // Check owner
  try {
    const owner = await dataStreams.owner();
    console.log(`📋 Contract Owner: ${owner}`);
    console.log(`📋 Deployer: ${deployer.address}`);
    console.log(`📋 Is Owner: ${owner.toLowerCase() === deployer.address.toLowerCase()}\n`);
  } catch (error: any) {
    console.log(`⚠️  Could not check owner: ${error.message}\n`);
  }

  // Verify Verifier Proxy
  try {
    const verifierProxy = await dataStreams.verifierProxy();
    console.log(`✅ Verifier Proxy: ${verifierProxy}`);
    if (dataStreamsVerifierProxy && verifierProxy.toLowerCase() === dataStreamsVerifierProxy.toLowerCase()) {
      console.log(`✅ Verifier Proxy matches configuration!\n`);
    }
  } catch (error: any) {
    console.log(`⚠️  Error checking verifier: ${error.message}\n`);
  }

  // Create a market and configure it with REAL Stream ID
  const core = await ethers.getContractAt("PredictionMarketCore", CONTRACTS.PREDICTION_MARKET_CORE, deployer);
  
  console.log("📊 Creating Market for Real Data Streams Test\n");
  console.log("-".repeat(80));

  const resolutionTime = Math.floor(Date.now() / 1000) + (86400 * 2);
  let marketId: bigint;

  try {
    const tx = await core.createBinaryMarket(
      "Will BTC price verified by Chainlink Data Streams reach $50,000?",
      "Real Chainlink Data Streams price verification test",
      resolutionTime,
      "ipfs://datastreams-real-test"
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
        marketId = parsed.args[0];
        console.log(`✅ Market created: ${marketId}`);
        console.log(`🔗 TX: https://testnet.opbnbscan.com/tx/${receipt.hash}\n`);
      }
    }
  } catch (error: any) {
    console.log(`❌ Error creating market: ${error.message}\n`);
    return;
  }

  // Configure with REAL BTC Stream ID
  if (btcStreamId && marketId) {
    console.log("🔗 Configuring Market with REAL Chainlink Data Streams Stream ID\n");
    console.log("-".repeat(80));

    const realBtcStreamId = btcStreamId.startsWith('0x') ? btcStreamId : `0x${btcStreamId}`;
    const targetPrice = ethers.parseUnits("50000", 8); // $50,000

    try {
      const tx = await dataStreams.configureMarketStream(
        marketId,
        realBtcStreamId as `0x${string}`,
        targetPrice
      );
      const receipt = await tx.wait();
      
      console.log(`✅ Market ${marketId} configured with REAL BTC Stream ID`);
      console.log(`   Stream ID: ${realBtcStreamId}`);
      console.log(`   Target Price: $50,000`);
      console.log(`🔗 TX: https://testnet.opbnbscan.com/tx/${receipt.hash}\n`);

      // Verify configuration
      const configuredStreamId = await dataStreams.marketStreamId(marketId);
      console.log(`✅ Verified Stream ID: ${configuredStreamId}`);
      console.log(`✅ Matches: ${configuredStreamId.toLowerCase() === realBtcStreamId.toLowerCase()}\n`);

      // Check price functions
      const priceCondition = await dataStreams.checkPriceCondition(marketId);
      console.log(`📊 Price Condition:`);
      console.log(`   Condition Met: ${priceCondition[0]}`);
      console.log(`   Current Price: ${priceCondition[1]}`);
      console.log(`   Target Price: ${priceCondition[2]}\n`);

      const lastPrice = await dataStreams.getLastVerifiedPrice(marketId);
      console.log(`📊 Last Verified Price:`);
      console.log(`   Price: ${lastPrice[0]}`);
      console.log(`   Timestamp: ${lastPrice[1]}`);
      console.log(`   Is Stale: ${lastPrice[2]}\n`);

      console.log(`💡 To verify REAL price report:`);
      console.log(`   1. Fetch price report from Chainlink Data Streams API`);
      console.log(`   2. Use Stream ID: ${realBtcStreamId}`);
      console.log(`   3. Call: await dataStreams.verifyPriceReport(${marketId}, encodedReport)`);
      console.log(`   4. Price will be verified on-chain using Verifier Proxy: ${dataStreamsVerifierProxy}\n`);

    } catch (error: any) {
      if (error.message.includes("onlyOwner")) {
        console.log(`⚠️  Configuration requires owner permissions`);
        try {
          const owner = await dataStreams.owner();
          console.log(`   Contract Owner: ${owner}`);
          console.log(`   Deployer: ${deployer.address}`);
          console.log(`   Match: ${owner.toLowerCase() === deployer.address.toLowerCase()}\n`);
        } catch {
          console.log(`   Check contract ownership\n`);
        }
      } else {
        console.log(`⚠️  Error: ${error.message}\n`);
      }
    }
  }

  console.log("=".repeat(80));
  console.log("✅ Real Chainlink Data Streams Test Completed!");
  console.log(`📊 Market ID: ${marketId}`);
  console.log(`📡 Stream ID: ${btcStreamId}`);
  console.log("=".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

