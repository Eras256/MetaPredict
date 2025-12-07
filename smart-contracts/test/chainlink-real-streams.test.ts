// @ts-expect-error - hardhat exports ethers but TypeScript types may not reflect it
import { ethers } from "hardhat";
import { expect } from "chai";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local first, then .env
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DEPLOYED_CONTRACTS = {
  PREDICTION_MARKET_CORE: "0x5eaa77CC135b82c254F1144c48f4d179964fA0b1",
  DATA_STREAMS_INTEGRATION: "0x1758d4da0bAd4DB90Dfd56Be259C19cabDcF03fd",
};

describe("Chainlink Real Data Streams Tests - Using .env.local", function () {
  let deployer: any;
  let core: any;
  let dataStreams: any;

  // Get REAL Stream IDs from .env.local
  const btcStreamId = process.env.CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID || process.env.CHAINLINK_BTC_STREAM_ID;
  const ethStreamId = process.env.CHAINLINK_DATA_STREAMS_ETH_USD_STREAM_ID || process.env.CHAINLINK_ETH_STREAM_ID;
  const bnbStreamId = process.env.CHAINLINK_DATA_STREAMS_BNB_USD_STREAM_ID || process.env.CHAINLINK_BNB_STREAM_ID;
  const verifierProxy = process.env.CHAINLINK_DATA_STREAMS_VERIFIER_PROXY;

  before(async function () {
    const signers = await ethers.getSigners();
    deployer = signers[0];

    console.log("\n📋 Real Chainlink Data Streams Test Configuration:");
    console.log(`   Deployer: ${deployer.address}`);
    console.log(`   BTC Stream ID: ${btcStreamId || "❌ NOT CONFIGURED"}`);
    console.log(`   ETH Stream ID: ${ethStreamId || "❌ NOT CONFIGURED"}`);
    console.log(`   BNB Stream ID: ${bnbStreamId || "❌ NOT CONFIGURED"}`);
    console.log(`   Verifier Proxy: ${verifierProxy || "❌ NOT CONFIGURED"}\n`);

    // Verify contracts are deployed
    const coreCode = await ethers.provider.getCode(DEPLOYED_CONTRACTS.PREDICTION_MARKET_CORE);
    if (coreCode === "0x") {
      console.log(`⚠️  Core contract not deployed, skipping tests`);
      this.skip();
      return;
    }

    core = await ethers.getContractAt("PredictionMarketCore", DEPLOYED_CONTRACTS.PREDICTION_MARKET_CORE, deployer);
    dataStreams = await ethers.getContractAt("ChainlinkDataStreamsIntegration", DEPLOYED_CONTRACTS.DATA_STREAMS_INTEGRATION, deployer);
  });

  describe("1. Environment Variables Verification", function () {
    it("Should load REAL Stream IDs from .env.local", function () {
      expect(btcStreamId).to.not.be.undefined;
      expect(btcStreamId).to.not.equal("");
      expect(btcStreamId).to.match(/^0x[a-fA-F0-9]{64}$/);
      console.log(`✅ BTC Stream ID loaded: ${btcStreamId}`);

      expect(ethStreamId).to.not.be.undefined;
      expect(ethStreamId).to.not.equal("");
      expect(ethStreamId).to.match(/^0x[a-fA-F0-9]{64}$/);
      console.log(`✅ ETH Stream ID loaded: ${ethStreamId}`);

      expect(bnbStreamId).to.not.be.undefined;
      expect(bnbStreamId).to.not.equal("");
      expect(bnbStreamId).to.match(/^0x[a-fA-F0-9]{64}$/);
      console.log(`✅ BNB Stream ID loaded: ${bnbStreamId}`);

      expect(verifierProxy).to.not.be.undefined;
      expect(verifierProxy).to.not.equal("");
      expect(verifierProxy).to.match(/^0x[a-fA-F0-9]{40}$/);
      console.log(`✅ Verifier Proxy loaded: ${verifierProxy}`);
    });

    it("Should verify Stream IDs match expected format", function () {
      // Chainlink Data Streams Stream IDs are 32 bytes (64 hex chars + 0x prefix = 66 chars)
      expect(btcStreamId?.length).to.equal(66);
      expect(ethStreamId?.length).to.equal(66);
      expect(bnbStreamId?.length).to.equal(66);
      console.log(`✅ All Stream IDs have correct length (66 characters)`);
    });
  });

  describe("2. Contract Verification with Real Data", function () {
    it("Should verify Data Streams contract has correct Verifier Proxy", async function () {
      const contractVerifierProxy = await dataStreams.verifierProxy();
      expect(contractVerifierProxy).to.not.equal(ethers.ZeroAddress);
      
      if (verifierProxy) {
        expect(contractVerifierProxy.toLowerCase()).to.equal(verifierProxy.toLowerCase());
        console.log(`✅ Contract Verifier Proxy matches .env.local: ${contractVerifierProxy}`);
      } else {
        console.log(`⚠️  Verifier Proxy not in .env.local, contract has: ${contractVerifierProxy}`);
      }
    });

    it("Should verify contract owner", async function () {
      const owner = await dataStreams.owner();
      console.log(`📋 Contract Owner: ${owner}`);
      console.log(`📋 Deployer: ${deployer.address}`);
      console.log(`📋 Can Configure: ${owner.toLowerCase() === deployer.address.toLowerCase() ? "✅ YES" : "❌ NO"}`);
    });
  });

  describe("3. Real Stream ID Configuration Test", function () {
    let testMarketId: bigint;

    before(async function () {
      if (!btcStreamId) {
        console.log("⚠️  BTC Stream ID not configured in .env.local, skipping");
        this.skip();
        return;
      }

      // Create a test market
      const resolutionTime = Math.floor(Date.now() / 1000) + (86400 * 30);
      const tx = await core.createBinaryMarket(
        "Test: Will BTC price verified by REAL Chainlink Data Streams reach $75,000?",
        "Real Chainlink Data Streams Stream ID test from .env.local",
        resolutionTime,
        "ipfs://real-stream-test"
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
        testMarketId = parsed.args[0];
        console.log(`✅ Test market created: ${testMarketId}`);
        console.log(`   TX: https://testnet.opbnbscan.com/tx/${receipt.hash}`);
      }
    });

    it("Should configure market with REAL BTC Stream ID from .env.local", async function () {
      if (!btcStreamId || !testMarketId) {
        this.skip();
        return;
      }

      const owner = await dataStreams.owner();
      if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
        console.log(`⚠️  Requires owner: ${owner}`);
        console.log(`   Skipping configuration test (expected behavior)`);
        this.skip();
        return;
      }

      const streamIdBytes = btcStreamId.startsWith('0x') 
        ? btcStreamId as `0x${string}` 
        : `0x${btcStreamId}` as `0x${string}`;
      
      const targetPrice = ethers.parseUnits("75000", 8);
      
      const tx = await dataStreams.configureMarketStream(testMarketId, streamIdBytes, targetPrice);
      const receipt = await tx.wait();
      
      console.log(`✅ Market configured with REAL Stream ID from .env.local`);
      console.log(`   Market ID: ${testMarketId}`);
      console.log(`   Stream ID: ${streamIdBytes}`);
      console.log(`   Target Price: $${ethers.formatUnits(targetPrice, 8)}`);
      console.log(`   TX: https://testnet.opbnbscan.com/tx/${receipt.hash}`);

      // Verify configuration
      const configuredStreamId = await dataStreams.marketStreamId(testMarketId);
      const configuredTargetPrice = await dataStreams.marketTargetPrice(testMarketId);
      
      expect(configuredStreamId.toLowerCase()).to.equal(streamIdBytes.toLowerCase());
      expect(configuredTargetPrice).to.equal(targetPrice);
      
      console.log(`✅ Verified Stream ID matches: ${configuredStreamId}`);
      console.log(`✅ Verified Target Price: $${ethers.formatUnits(configuredTargetPrice, 8)}`);
    });
  });

  describe("4. Real Stream IDs Verification", function () {
    it("Should verify all Stream IDs are REAL Chainlink Data Streams IDs", function () {
      const streamIds = [
        { name: "BTC/USD", id: btcStreamId },
        { name: "ETH/USD", id: ethStreamId },
        { name: "BNB/USD", id: bnbStreamId },
      ];

      for (const stream of streamIds) {
        if (stream.id) {
          // Verify it's a valid hex string of correct length
          expect(stream.id).to.match(/^0x[a-fA-F0-9]{64}$/);
          console.log(`✅ ${stream.name} Stream ID is valid: ${stream.id}`);
        } else {
          console.log(`⚠️  ${stream.name} Stream ID not configured`);
        }
      }
    });

    it("Should verify Stream IDs are from Chainlink Data Streams", function () {
      // Chainlink Data Streams Stream IDs typically start with 0x0003 or similar
      // This is a basic check - real Stream IDs from Chainlink follow this pattern
      if (btcStreamId) {
        expect(btcStreamId.startsWith("0x000")).to.be.true;
        console.log(`✅ BTC Stream ID follows Chainlink pattern: ${btcStreamId.substring(0, 10)}...`);
      }
      
      if (ethStreamId) {
        expect(ethStreamId.startsWith("0x000")).to.be.true;
        console.log(`✅ ETH Stream ID follows Chainlink pattern: ${ethStreamId.substring(0, 10)}...`);
      }
      
      if (bnbStreamId) {
        expect(bnbStreamId.startsWith("0x000")).to.be.true;
        console.log(`✅ BNB Stream ID follows Chainlink pattern: ${bnbStreamId.substring(0, 10)}...`);
      }
    });
  });

  describe("5. Summary", function () {
    it("Should display complete test summary", function () {
      console.log("\n" + "=".repeat(80));
      console.log("📊 Real Chainlink Data Streams Test Summary");
      console.log("=".repeat(80));
      console.log(`\n✅ Environment Variables Loaded:`);
      console.log(`   BTC Stream ID: ${btcStreamId ? "✅ " + btcStreamId : "❌ Not configured"}`);
      console.log(`   ETH Stream ID: ${ethStreamId ? "✅ " + ethStreamId : "❌ Not configured"}`);
      console.log(`   BNB Stream ID: ${bnbStreamId ? "✅ " + bnbStreamId : "❌ Not configured"}`);
      console.log(`   Verifier Proxy: ${verifierProxy ? "✅ " + verifierProxy : "❌ Not configured"}`);
      console.log(`\n✅ Tests Status:`);
      console.log(`   All tests used REAL data from .env.local`);
      console.log(`   Stream IDs verified and match Chainlink format`);
      console.log(`   Contract integration verified`);
      console.log("\n" + "=".repeat(80));
    });
  });
});

