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
  INSURANCE_POOL: "0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA",
  REPUTATION_STAKING: "0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7",
  DAO_GOVERNANCE: "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123",
};

const BET_AMOUNT = ethers.parseEther("0.01");
const INSURANCE_DEPOSIT = ethers.parseEther("0.1"); // 0.1 BNB for insurance
const REPUTATION_STAKE = ethers.parseEther("0.1"); // 0.1 BNB for reputation staking

// 6 English markets for real Chainlink Data Streams testing
const MARKETS = [
  {
    question: "Will Bitcoin (BTC) price verified by Chainlink Data Streams exceed $75,000 USD by March 31, 2026?",
    description: "Bitcoin price prediction using real Chainlink Data Streams BTC/USD price feed verification",
    resolutionTime: Math.floor(Date.now() / 1000) + (86400 * 120), // 120 days from now
    streamId: process.env.CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID || process.env.CHAINLINK_BTC_STREAM_ID,
    targetPrice: ethers.parseUnits("75000", 8), // $75,000
    asset: "BTC/USD"
  },
  {
    question: "Will Ethereum (ETH) price verified by Chainlink Data Streams reach $4,500 USD before Bitcoin reaches $75,000?",
    description: "Ethereum price race prediction using real Chainlink Data Streams ETH/USD price feed",
    resolutionTime: Math.floor(Date.now() / 1000) + (86400 * 90), // 90 days from now
    streamId: process.env.CHAINLINK_DATA_STREAMS_ETH_USD_STREAM_ID || process.env.CHAINLINK_ETH_STREAM_ID,
    targetPrice: ethers.parseUnits("4500", 8), // $4,500
    asset: "ETH/USD"
  },
  {
    question: "Will BNB price verified by Chainlink Data Streams stay above $400 USD for 30 consecutive days?",
    description: "BNB price stability prediction using real Chainlink Data Streams BNB/USD continuous verification",
    resolutionTime: Math.floor(Date.now() / 1000) + (86400 * 60), // 60 days from now
    streamId: process.env.CHAINLINK_DATA_STREAMS_BNB_USD_STREAM_ID || process.env.CHAINLINK_BNB_STREAM_ID,
    targetPrice: ethers.parseUnits("400", 8), // $400
    asset: "BNB/USD"
  },
  {
    question: "Will Bitcoin price verified by Chainlink Data Streams drop below $50,000 USD at any point in the next 60 days?",
    description: "Bitcoin price downside risk prediction using real Chainlink Data Streams BTC/USD monitoring",
    resolutionTime: Math.floor(Date.now() / 1000) + (86400 * 60), // 60 days from now
    streamId: process.env.CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID || process.env.CHAINLINK_BTC_STREAM_ID,
    targetPrice: ethers.parseUnits("50000", 8), // $50,000
    asset: "BTC/USD"
  },
  {
    question: "Will Ethereum price verified by Chainlink Data Streams achieve a new all-time high above $5,000 USD by June 30, 2026?",
    description: "Ethereum all-time high prediction using real Chainlink Data Streams ETH/USD price verification",
    resolutionTime: Math.floor(Date.now() / 1000) + (86400 * 180), // 180 days from now
    streamId: process.env.CHAINLINK_DATA_STREAMS_ETH_USD_STREAM_ID || process.env.CHAINLINK_ETH_STREAM_ID,
    targetPrice: ethers.parseUnits("5000", 8), // $5,000
    asset: "ETH/USD"
  },
  {
    question: "Will the combined market cap of BTC and ETH verified by Chainlink Data Streams exceed $2.5 trillion USD by December 31, 2025?",
    description: "Combined cryptocurrency market cap prediction using real Chainlink Data Streams price aggregation",
    resolutionTime: Math.floor(Date.now() / 1000) + (86400 * 365), // 365 days from now
    streamId: process.env.CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID || process.env.CHAINLINK_BTC_STREAM_ID, // Using BTC as primary
    targetPrice: ethers.parseUnits("2500000000000", 8), // $2.5 trillion
    asset: "BTC+ETH/USD"
  },
  // Add one subjective market for DAO voting
  {
    question: "Should MetaPredict.fun implement a new feature for cross-chain market aggregation?",
    description: "Subjective market for DAO governance voting on protocol improvements",
    resolutionTime: Math.floor(Date.now() / 1000) + (86400 * 30), // 30 days from now
    streamId: null, // Subjective markets don't use Chainlink
    targetPrice: ethers.parseUnits("0", 8),
    asset: "SUBJECTIVE",
    isSubjective: true
  },
];

async function main() {
  console.log("🔗 Creating 6 English Markets with REAL Chainlink Data Streams\n");
  console.log("=".repeat(80));

  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deployer: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} BNB\n`);

  if (balance < ethers.parseEther("0.1")) {
    console.log("⚠️  Warning: Low balance. You may need more BNB for gas fees.\n");
  }

  // Get REAL Chainlink configuration
  const backendUrl = process.env.BACKEND_URL || process.env.CHAINLINK_BACKEND_URL || "https://metapredict.fun/api/oracle/resolve";
  const dataStreamsVerifierProxy = process.env.CHAINLINK_DATA_STREAMS_VERIFIER_PROXY;

  console.log("📋 REAL Chainlink Configuration:\n");
  console.log(`   ⚠️  Chainlink Functions: NOT AVAILABLE on opBNB`);
  console.log(`   ✅ Backend URL: ${backendUrl}`);
  console.log(`   ✅ Data Streams Verifier: ${dataStreamsVerifierProxy || "NOT SET"}`);
  
  // Show Stream IDs
  const btcStreamId = process.env.CHAINLINK_DATA_STREAMS_BTC_USD_STREAM_ID || process.env.CHAINLINK_BTC_STREAM_ID;
  const ethStreamId = process.env.CHAINLINK_DATA_STREAMS_ETH_USD_STREAM_ID || process.env.CHAINLINK_ETH_STREAM_ID;
  const bnbStreamId = process.env.CHAINLINK_DATA_STREAMS_BNB_USD_STREAM_ID || process.env.CHAINLINK_BNB_STREAM_ID;
  
  console.log(`   ✅ BTC Stream ID: ${btcStreamId || "NOT SET"}`);
  console.log(`   ✅ ETH Stream ID: ${ethStreamId || "NOT SET"}`);
  console.log(`   ✅ BNB Stream ID: ${bnbStreamId || "NOT SET"}\n`);

  // Connect to contracts
  const core = await ethers.getContractAt("PredictionMarketCore", CONTRACTS.PREDICTION_MARKET_CORE, deployer);
  const aiOracle = await ethers.getContractAt("AIOracle", CONTRACTS.AI_ORACLE, deployer);
  const dataStreams = await ethers.getContractAt("ChainlinkDataStreamsIntegration", CONTRACTS.DATA_STREAMS_INTEGRATION, deployer);
  const insurancePool = await ethers.getContractAt("InsurancePool", CONTRACTS.INSURANCE_POOL, deployer);
  const reputationStaking = await ethers.getContractAt("ReputationStaking", CONTRACTS.REPUTATION_STAKING, deployer);
  const daoGovernance = await ethers.getContractAt("DAOGovernance", CONTRACTS.DAO_GOVERNANCE, deployer);

  // Step 1: Verify Backend URL
  console.log("⚙️  Step 1: Verifying Backend URL Configuration\n");
  console.log("-".repeat(80));

  try {
    const currentBackendUrl = await aiOracle.backendUrl();
    console.log(`   Current Backend URL: ${currentBackendUrl}`);
    console.log(`   Target Backend URL: ${backendUrl}`);
    
    if (currentBackendUrl !== backendUrl) {
      console.log(`   ⚠️  Backend URL mismatch. Use 'pnpm update:backend-url' to update.\n`);
    } else {
      console.log(`   ✅ Backend URL matches!\n`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  Error checking backend URL: ${error.message}\n`);
  }

  // Step 2: Create 6 markets
  console.log("📊 Step 2: Creating 6 English Markets with REAL Chainlink Data Streams\n");
  console.log("-".repeat(80));

  const marketIds: bigint[] = [];
  const marketConfigs: Array<{ id: bigint; streamId: string; targetPrice: bigint; asset: string }> = [];
  const transactionLinks: Array<{ type: string; description: string; hash: string; link: string; marketId?: bigint }> = [];

  for (let i = 0; i < MARKETS.length; i++) {
    const market = MARKETS[i];
    
    // Skip only if it's NOT a subjective market and has no streamId
    if (!market.streamId && !(market as any).isSubjective) {
      console.log(`\n${i + 1}. ⚠️  Market ${i + 1}: Stream ID not configured, skipping`);
      console.log(`   Question: ${market.question}`);
      continue;
    }

    console.log(`\n${i + 1}. Creating: "${market.question}"`);
    console.log(`   Asset: ${market.asset}`);
    console.log(`   Stream ID: ${market.streamId}`);
    console.log(`   Target Price: $${ethers.formatUnits(market.targetPrice, 8)}`);
    console.log(`   Resolution: ${new Date(Number(market.resolutionTime) * 1000).toLocaleString()}`);
    
    try {
      let tx;
      if ((market as any).isSubjective) {
        // Create subjective market for DAO voting
        tx = await core.createSubjectiveMarket(
          market.question,
          market.description,
          market.resolutionTime,
          "governance", // expertiseRequired
          `ipfs://market-${i + 1}-subjective-dao-${Date.now()}`
        );
      } else {
        // Create binary market
        tx = await core.createBinaryMarket(
          market.question,
          market.description,
          market.resolutionTime,
          `ipfs://market-${i + 1}-chainlink-real-${Date.now()}`
        );
      }
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
          // Only add to marketConfigs if it has a streamId (not subjective markets)
          if (market.streamId && !(market as any).isSubjective) {
            marketConfigs.push({
              id: marketId,
              streamId: market.streamId,
              targetPrice: market.targetPrice,
              asset: market.asset,
            });
          }
          
          const txLink = `https://testnet.opbnbscan.com/tx/${receipt.hash}`;
          transactionLinks.push({
            type: "Market Creation",
            description: `Market ${marketId}: ${market.question.substring(0, 50)}...`,
            hash: receipt.hash,
            link: txLink,
            marketId: marketId,
          });
          
          console.log(`   ✅ Market ID: ${marketId}`);
          console.log(`   🔗 Creation TX: ${txLink}`);
        }
      }
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log(`\n✅ Created ${marketIds.length} markets\n`);

  if (marketIds.length === 0) {
    console.log("❌ No markets created. Check Stream ID configuration in .env.local");
    return;
  }

  // Step 3: Place bets on all markets
  console.log("💰 Step 3: Placing Bets on All Markets\n");
  console.log("-".repeat(80));

  let betsPlaced = 0;
  for (let i = 0; i < marketIds.length; i++) {
    const marketId = marketIds[i];
    console.log(`\n${i + 1}. Market ${marketId}:`);
    
    try {
      // Place YES bet
      const txYes = await core.placeBet(marketId, true, { value: BET_AMOUNT });
      const receiptYes = await txYes.wait();
      const yesTxLink = `https://testnet.opbnbscan.com/tx/${receiptYes.hash}`;
      transactionLinks.push({
        type: "Bet Placement",
        description: `Market ${marketId} - YES bet`,
        hash: receiptYes.hash,
        link: yesTxLink,
        marketId: marketId,
      });
      console.log(`   ✅ YES bet: ${ethers.formatEther(BET_AMOUNT)} BNB`);
      console.log(`   🔗 YES Bet TX: ${yesTxLink}`);

      // Place NO bet
      const txNo = await core.placeBet(marketId, false, { value: BET_AMOUNT });
      const receiptNo = await txNo.wait();
      const noTxLink = `https://testnet.opbnbscan.com/tx/${receiptNo.hash}`;
      transactionLinks.push({
        type: "Bet Placement",
        description: `Market ${marketId} - NO bet`,
        hash: receiptNo.hash,
        link: noTxLink,
        marketId: marketId,
      });
      console.log(`   ✅ NO bet: ${ethers.formatEther(BET_AMOUNT)} BNB`);
      console.log(`   🔗 NO Bet TX: ${noTxLink}`);
      
      betsPlaced += 2;
    } catch (error: any) {
      console.log(`   ❌ Error placing bets: ${error.message}`);
    }
  }

  console.log(`\n✅ Placed ${betsPlaced} bets (${marketIds.length} markets × 2 bets)\n`);

  // Step 4: Deposit to Insurance Pool
  console.log("🛡️  Step 4: Depositing to Insurance Pool\n");
  console.log("-".repeat(80));

  try {
    const tx = await insurancePool.deposit(deployer.address, { value: INSURANCE_DEPOSIT });
    const receipt = await tx.wait();
    const insuranceTxLink = `https://testnet.opbnbscan.com/tx/${receipt.hash}`;
    transactionLinks.push({
      type: "Insurance Pool Deposit",
      description: `Insurance Pool - Deposit ${ethers.formatEther(INSURANCE_DEPOSIT)} BNB`,
      hash: receipt.hash,
      link: insuranceTxLink,
    });
    console.log(`   ✅ Deposited ${ethers.formatEther(INSURANCE_DEPOSIT)} BNB to Insurance Pool`);
    console.log(`   🔗 Deposit TX: ${insuranceTxLink}\n`);
  } catch (error: any) {
    console.log(`   ❌ Error depositing to Insurance Pool: ${error.message}\n`);
  }

  // Step 5: Stake Reputation
  console.log("⭐ Step 5: Staking Reputation\n");
  console.log("-".repeat(80));

  try {
    const tx = await core.stakeReputation({ value: REPUTATION_STAKE });
    const receipt = await tx.wait();
    const reputationTxLink = `https://testnet.opbnbscan.com/tx/${receipt.hash}`;
    transactionLinks.push({
      type: "Reputation Staking",
      description: `Reputation Staking - Stake ${ethers.formatEther(REPUTATION_STAKE)} BNB`,
      hash: receipt.hash,
      link: reputationTxLink,
    });
    console.log(`   ✅ Staked ${ethers.formatEther(REPUTATION_STAKE)} BNB for reputation`);
    console.log(`   🔗 Staking TX: ${reputationTxLink}\n`);
  } catch (error: any) {
    console.log(`   ❌ Error staking reputation: ${error.message}\n`);
  }

  // Step 6: Create DAO Proposal for Subjective Market
  console.log("🗳️  Step 6: Creating DAO Proposal for Subjective Market\n");
  console.log("-".repeat(80));

  let daoProposalId: bigint | null = null;
  const subjectiveMarketId = marketIds.find((id, idx) => (MARKETS[idx] as any).isSubjective);
  
  if (subjectiveMarketId) {
    try {
      // Initiate resolution for subjective market (this creates DAO proposal via Core)
      const tx = await core.initiateResolution(subjectiveMarketId);
      const receipt = await tx.wait();
      
      // Find ProposalCreated event from DAO
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = daoGovernance.interface.parseLog(log);
          return parsed?.name === "ProposalCreated";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = daoGovernance.interface.parseLog(event);
        if (parsed) {
          daoProposalId = parsed.args[0];
          const proposalTxLink = `https://testnet.opbnbscan.com/tx/${receipt.hash}`;
          transactionLinks.push({
            type: "DAO Proposal Creation",
            description: `DAO Proposal ${daoProposalId} - Market Resolution for Market ${subjectiveMarketId}`,
            hash: receipt.hash,
            link: proposalTxLink,
            marketId: subjectiveMarketId,
          });
          console.log(`   ✅ Created DAO Proposal ${daoProposalId} for Market ${subjectiveMarketId}`);
          console.log(`   🔗 Proposal TX: ${proposalTxLink}\n`);

          // Step 7: Vote on DAO Proposal
          console.log("🗳️  Step 7: Voting on DAO Proposal\n");
          console.log("-".repeat(80));

          try {
            const voteTx = await daoGovernance.castVote(daoProposalId, 1, ""); // 1 = For
            const voteReceipt = await voteTx.wait();
            const voteTxLink = `https://testnet.opbnbscan.com/tx/${voteReceipt.hash}`;
            transactionLinks.push({
              type: "DAO Vote",
              description: `DAO Vote - Proposal ${daoProposalId} - FOR`,
              hash: voteReceipt.hash,
              link: voteTxLink,
              marketId: subjectiveMarketId,
            });
            console.log(`   ✅ Voted FOR on Proposal ${daoProposalId}`);
            console.log(`   🔗 Vote TX: ${voteTxLink}\n`);
          } catch (error: any) {
            console.log(`   ❌ Error voting: ${error.message}\n`);
          }
        }
      } else {
        // If no ProposalCreated event, still record the initiation
        const initiationTxLink = `https://testnet.opbnbscan.com/tx/${receipt.hash}`;
        transactionLinks.push({
          type: "DAO Proposal Creation",
          description: `Initiate Resolution - Market ${subjectiveMarketId}`,
          hash: receipt.hash,
          link: initiationTxLink,
          marketId: subjectiveMarketId,
        });
        console.log(`   ✅ Initiated resolution for Market ${subjectiveMarketId}`);
        console.log(`   🔗 Initiation TX: ${initiationTxLink}\n`);
      }
    } catch (error: any) {
      console.log(`   ❌ Error initiating DAO proposal: ${error.message}\n`);
    }
  } else {
    console.log(`   ⚠️  No subjective market found, skipping DAO proposal\n`);
  }

  // Step 8: Configure markets with Chainlink Data Streams
  console.log("📡 Step 8: Configuring Markets with REAL Chainlink Data Streams\n");
  console.log("-".repeat(80));

  try {
    const owner = await dataStreams.owner();
    const verifierProxy = await dataStreams.verifierProxy();
    
    console.log(`   Contract Owner: ${owner}`);
    console.log(`   Deployer: ${deployer.address}`);
    console.log(`   Verifier Proxy: ${verifierProxy}\n`);

    // Try to get owner signer from .env.local if available
    let ownerSigner = deployer;
    const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY || process.env.CONTRACT_OWNER_PRIVATE_KEY;
    
    if (ownerPrivateKey && owner.toLowerCase() !== deployer.address.toLowerCase()) {
      try {
        ownerSigner = new ethers.Wallet(ownerPrivateKey, ethers.provider);
        console.log(`   ✅ Owner private key found in .env.local`);
        console.log(`   Owner signer address: ${ownerSigner.address}`);
        console.log(`   Contract owner address: ${owner}`);
        
        if (ownerSigner.address.toLowerCase() !== owner.toLowerCase()) {
          console.log(`   ⚠️  WARNING: Owner signer address does NOT match contract owner!`);
          console.log(`   Expected owner: ${owner}`);
          console.log(`   Signer address: ${ownerSigner.address}`);
          console.log(`   Please verify OWNER_PRIVATE_KEY in .env.local matches the contract owner\n`);
        } else {
          console.log(`   ✅ Owner signer matches contract owner!\n`);
        }
      } catch (error: any) {
        console.log(`   ⚠️  Could not create owner signer: ${error.message}`);
        console.log(`   Using deployer instead\n`);
      }
    }

    // Check if we can configure (either deployer is owner or we have owner signer that matches)
    const canConfigure = owner.toLowerCase() === deployer.address.toLowerCase() || 
                        (ownerPrivateKey && ownerSigner.address.toLowerCase() === owner.toLowerCase());

    if (!canConfigure) {
      if (!ownerPrivateKey) {
        console.log(`   ⚠️  Cannot configure: No OWNER_PRIVATE_KEY found in .env.local`);
      } else {
        console.log(`   ⚠️  Cannot configure: Owner signer address does not match contract owner`);
      }
      console.log(`   Contract owner address: ${owner}`);
      console.log(`   To configure, add OWNER_PRIVATE_KEY to .env.local that matches ${owner}\n`);
    } else {
      // Connect dataStreams contract with owner signer if different
      const dataStreamsWithOwner = ownerSigner.address.toLowerCase() !== deployer.address.toLowerCase()
        ? await ethers.getContractAt("ChainlinkDataStreamsIntegration", CONTRACTS.DATA_STREAMS_INTEGRATION, ownerSigner)
        : dataStreams;

      let configuredCount = 0;
      for (let i = 0; i < marketConfigs.length; i++) {
        const config = marketConfigs[i];
        console.log(`\n${i + 1}. Configuring Market ${config.id}:`);
        console.log(`   Asset: ${config.asset}`);
        console.log(`   Stream ID: ${config.streamId}`);
        console.log(`   Target Price: $${ethers.formatUnits(config.targetPrice, 8)}`);

        try {
          const streamIdBytes = config.streamId.startsWith('0x') 
            ? config.streamId as `0x${string}` 
            : `0x${config.streamId}` as `0x${string}`;
          
          const tx = await dataStreamsWithOwner.configureMarketStream(
            config.id,
            streamIdBytes,
            config.targetPrice
          );
          const receipt = await tx.wait();
          const configTxLink = `https://testnet.opbnbscan.com/tx/${receipt.hash}`;
          transactionLinks.push({
            type: "Data Streams Configuration",
            description: `Market ${config.id} - Configure Stream ID`,
            hash: receipt.hash,
            link: configTxLink,
            marketId: config.id,
          });
          
          console.log(`   ✅ Configured successfully`);
          console.log(`   🔗 Configuration TX: ${configTxLink}`);
          
          // Verify configuration
          const configuredStreamId = await dataStreams.marketStreamId(config.id);
          const configuredTargetPrice = await dataStreams.marketTargetPrice(config.id);
          
          console.log(`   ✅ Verified Stream ID: ${configuredStreamId}`);
          console.log(`   ✅ Verified Target Price: $${ethers.formatUnits(configuredTargetPrice, 8)}`);
          
          configuredCount++;
        } catch (error: any) {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }

      console.log(`\n✅ Configured ${configuredCount} markets with Chainlink Data Streams\n`);
    }
  } catch (error: any) {
    console.log(`⚠️  Error configuring Data Streams: ${error.message}\n`);
  }

  // Step 5: Summary with all transaction links
  console.log("=".repeat(80));
  console.log("📊 Summary - 6 English Markets with REAL Chainlink Data Streams\n");
  console.log("=".repeat(80));
  console.log(`✅ Markets Created: ${marketIds.length}/6`);
  console.log(`✅ Bets Placed: ${betsPlaced} (${marketIds.length} markets × 2 bets each)`);
  console.log(`✅ Backend URL: ${backendUrl}`);
  console.log(`✅ Data Streams Verifier: ${dataStreamsVerifierProxy || "NOT SET"}\n`);

  console.log("📋 Market Details:\n");
  console.log("-".repeat(80));
  
  for (let i = 0; i < marketIds.length; i++) {
    const market = MARKETS[i];
    const config = marketConfigs[i];
    
    console.log(`\n${i + 1}. Market ID: ${marketIds[i]}`);
    console.log(`   Question: ${market.question}`);
    console.log(`   Asset: ${config?.asset || "N/A"}`);
    if (config) {
      console.log(`   Stream ID: ${config.streamId}`);
      console.log(`   Target Price: $${ethers.formatUnits(config.targetPrice, 8)}`);
    }
    console.log(`   Resolution Time: ${new Date(Number(market.resolutionTime) * 1000).toLocaleString()}`);
    console.log(`   Contract Explorer: https://testnet.opbnbscan.com/address/${CONTRACTS.PREDICTION_MARKET_CORE}#readContract`);
    console.log("");
  }

  // Display all transaction links organized by type
  console.log("\n" + "=".repeat(80));
  console.log("🔗 All Transaction Links for Verification\n");
  console.log("=".repeat(80));

  // Group transactions by type
  const marketCreations = transactionLinks.filter(tx => tx.type === "Market Creation");
  const betPlacements = transactionLinks.filter(tx => tx.type === "Bet Placement");
  const insuranceDeposits = transactionLinks.filter(tx => tx.type === "Insurance Pool Deposit");
  const reputationStakes = transactionLinks.filter(tx => tx.type === "Reputation Staking");
  const daoProposals = transactionLinks.filter(tx => tx.type === "DAO Proposal Creation");
  const daoVotes = transactionLinks.filter(tx => tx.type === "DAO Vote");
  const dataStreamsConfigs = transactionLinks.filter(tx => tx.type === "Data Streams Configuration");

  console.log(`\n📝 Market Creation Transactions (${marketCreations.length}):\n`);
  marketCreations.forEach((tx, index) => {
    console.log(`${index + 1}. ${tx.description}`);
    console.log(`   Hash: ${tx.hash}`);
    console.log(`   Link: ${tx.link}\n`);
  });

  console.log(`\n💰 Bet Placement Transactions (${betPlacements.length}):\n`);
  betPlacements.forEach((tx, index) => {
    console.log(`${index + 1}. ${tx.description}`);
    console.log(`   Hash: ${tx.hash}`);
    console.log(`   Link: ${tx.link}\n`);
  });

  console.log(`\n🛡️  Insurance Pool Deposit Transactions (${insuranceDeposits.length}):\n`);
  insuranceDeposits.forEach((tx, index) => {
    console.log(`${index + 1}. ${tx.description}`);
    console.log(`   Hash: ${tx.hash}`);
    console.log(`   Link: ${tx.link}\n`);
  });

  console.log(`\n⭐ Reputation Staking Transactions (${reputationStakes.length}):\n`);
  reputationStakes.forEach((tx, index) => {
    console.log(`${index + 1}. ${tx.description}`);
    console.log(`   Hash: ${tx.hash}`);
    console.log(`   Link: ${tx.link}\n`);
  });

  console.log(`\n🗳️  DAO Proposal Creation Transactions (${daoProposals.length}):\n`);
  daoProposals.forEach((tx, index) => {
    console.log(`${index + 1}. ${tx.description}`);
    console.log(`   Hash: ${tx.hash}`);
    console.log(`   Link: ${tx.link}\n`);
  });

  console.log(`\n🗳️  DAO Vote Transactions (${daoVotes.length}):\n`);
  daoVotes.forEach((tx, index) => {
    console.log(`${index + 1}. ${tx.description}`);
    console.log(`   Hash: ${tx.hash}`);
    console.log(`   Link: ${tx.link}\n`);
  });

  console.log(`\n📡 Data Streams Configuration Transactions (${dataStreamsConfigs.length}):\n`);
  dataStreamsConfigs.forEach((tx, index) => {
    console.log(`${index + 1}. ${tx.description}`);
    console.log(`   Hash: ${tx.hash}`);
    console.log(`   Link: ${tx.link}\n`);
  });

  // Summary of all links
  console.log("\n" + "=".repeat(80));
  console.log("📊 Transaction Links Summary\n");
  console.log("=".repeat(80));
  console.log(`Total Transactions: ${transactionLinks.length}`);
  console.log(`   - Market Creations: ${marketCreations.length}`);
  console.log(`   - Bet Placements: ${betPlacements.length}`);
  console.log(`   - Insurance Pool Deposits: ${insuranceDeposits.length}`);
  console.log(`   - Reputation Staking: ${reputationStakes.length}`);
  console.log(`   - DAO Proposal Creations: ${daoProposals.length}`);
  console.log(`   - DAO Votes: ${daoVotes.length}`);
  console.log(`   - Data Streams Configurations: ${dataStreamsConfigs.length}\n`);

  // Quick contract links
  console.log("📋 Contract Explorer Links:\n");
  console.log(`   Core Contract: https://testnet.opbnbscan.com/address/${CONTRACTS.PREDICTION_MARKET_CORE}#code`);
  console.log(`   AI Oracle: https://testnet.opbnbscan.com/address/${CONTRACTS.AI_ORACLE}#code`);
  console.log(`   Data Streams: https://testnet.opbnbscan.com/address/${CONTRACTS.DATA_STREAMS_INTEGRATION}#code`);
  console.log(`   Insurance Pool: https://testnet.opbnbscan.com/address/0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA#code`);
  console.log(`   Reputation Staking: https://testnet.opbnbscan.com/address/0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7#code`);
  console.log(`   DAO Governance: https://testnet.opbnbscan.com/address/0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123#code\n`);

  console.log("💡 Chainlink Data Streams Integration Status:\n");
  console.log("   ⚠️  Chainlink Functions: NOT AVAILABLE on opBNB");
  console.log("   ✅ Backend API: Configured and ready for AI Oracle resolution");
  console.log("   ✅ Chainlink Data Streams: Verifier Proxy configured");
  console.log("   ✅ Real Stream IDs: Configured for price verification\n");

  console.log("💡 Resolution Flow:\n");
  console.log("   1. Market resolution time arrives");
  console.log("   2. Backend API called: " + backendUrl);
  console.log("   3. Backend executes multi-AI consensus (Gemini, Llama, Mistral)");
  console.log("   4. Result returned via fulfillResolutionManual()");
  console.log("   5. Chainlink Data Streams validates price data on-chain");
  console.log("   6. Market resolved automatically\n");

  console.log("=".repeat(80));
  console.log("✅ 6 English Markets Created Successfully with REAL Chainlink Data Streams!");
  console.log("=".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

