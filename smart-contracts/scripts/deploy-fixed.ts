import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load .env from root directory (1 level up from smart-contracts/)
// .env.local has priority - load it LAST so it overwrites .env
const envPath = path.resolve(__dirname, '../../.env');
const envLocalPath = path.resolve(__dirname, '../../.env.local');

console.log("🔍 Loading environment variables...");
console.log("   .env path:", envPath);
console.log("   .env.local path:", envLocalPath);
console.log("   .env exists:", fs.existsSync(envPath));
console.log("   .env.local exists:", fs.existsSync(envLocalPath));

// Load .env first
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("   ✅ Loaded .env");
}

// Load .env.local last (overwrites .env)
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
  console.log("   ✅ Loaded .env.local (overrides .env)");
}

// Debug: Show what PRIVATE_KEY was loaded (first 10 chars only for security)
const loadedKey = process.env.PRIVATE_KEY;
if (loadedKey) {
  console.log("   PRIVATE_KEY loaded:", loadedKey.substring(0, 10) + "..." + " (length: " + loadedKey.length + ")");
} else {
  console.log("   ⚠️  PRIVATE_KEY not found after loading .env files");
}
console.log("");

// Import ethers - @nomicfoundation/hardhat-toolbox provides this
// @ts-ignore - Hardhat types may not be fully updated
import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying MetaPredict.ai to opBNB...\n");

  // Debug: Check if PRIVATE_KEY is loaded
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ ERROR: PRIVATE_KEY not found in environment variables");
    console.error("   Make sure .env or .env.local exists in the root directory");
    console.error("   Current working directory:", process.cwd());
    throw new Error("PRIVATE_KEY not configured");
  }
  
  // Validate private key format
  const cleanKey = privateKey.trim().replace(/^0x/, '').replace(/\s/g, '');
  if (cleanKey.length !== 64 || !/^[0-9a-fA-F]{64}$/i.test(cleanKey)) {
    console.error("❌ ERROR: PRIVATE_KEY has invalid format");
    console.error("   Current length:", privateKey.length, "chars");
    console.error("   Expected: 64 hexadecimal characters (without 0x prefix)");
    console.error("   Example: 2003f926c578fea4a77ffdd98a288a3297ee12b8893505562422dd258e4a5765");
    console.error("\n   Make sure your .env.local or .env has:");
    console.error("   PRIVATE_KEY=tu_private_key_de_64_caracteres_sin_0x");
    throw new Error("PRIVATE_KEY format invalid");
  }
  
  console.log("✅ PRIVATE_KEY loaded and validated (64 chars)\n");
  
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No signers available. Hardhat config issue - check hardhat.config.ts");
  }
  
  const deployer = signers[0];
  console.log("Deploying with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "BNB\n");
  
  if (balance < ethers.parseEther("0.01")) {
    console.warn("⚠️  WARNING: Low balance! You may not have enough for deployment.\n");
  }

  // 1. Use USDC address (testnet or mainnet)
  // opBNB Testnet USDC: 0x845E27B8A4ad1Fe3dc0b41b900dC8C1Bb45141C3
  // opBNB Mainnet USDC: (check official docs)
  let usdcAddress: string;
  
  if (process.env.USDC_ADDRESS && process.env.USDC_ADDRESS !== "0x0000000000000000000000000000000000000000") {
    // Use custom USDC address from .env
    usdcAddress = process.env.USDC_ADDRESS;
    console.log("📝 Using USDC address from .env:", usdcAddress, "\n");
  } else {
    // Use default opBNB Testnet USDC address
    usdcAddress = "0x845E27B8A4ad1Fe3dc0b41b900dC8C1Bb45141C3";
    console.log("📝 Using default opBNB Testnet USDC:", usdcAddress, "\n");
    console.log("💡 Tip: Set USDC_ADDRESS in .env to use a different address\n");
  }
  
  const usdc = await ethers.getContractAt("IERC20", usdcAddress);

  // Helper function to get contract address
  const getAddress = async (contract: any) => await contract.getAddress();

  // 2. Deploy Insurance Pool
  console.log("📝 Deploying Insurance Pool...");
  const InsurancePool = await ethers.getContractFactory("InsurancePool");
  const insurancePool = await InsurancePool.deploy(
    usdcAddress,
    process.env.VENUS_VTOKEN || ethers.ZeroAddress, // Venus vUSDC
    "MetaPredict Insurance Shares",
    "mpINS"
  );
  await insurancePool.waitForDeployment();
  const insurancePoolAddress = await getAddress(insurancePool);
  console.log("✅ Insurance Pool deployed:", insurancePoolAddress, "\n");

  // 3. Deploy Reputation Staking
  console.log("📝 Deploying Reputation Staking...");
  const ReputationStaking = await ethers.getContractFactory("ReputationStaking");
  const reputationStaking = await ReputationStaking.deploy(usdcAddress);
  await reputationStaking.waitForDeployment();
  const reputationStakingAddress = await getAddress(reputationStaking);
  console.log("✅ Reputation Staking deployed:", reputationStakingAddress, "\n");

  // 4. Deploy AI Oracle
  console.log("📝 Deploying AI Oracle...");
  const AIOracle = await ethers.getContractFactory("AIOracle");
  const aiOracle = await AIOracle.deploy(
    process.env.CHAINLINK_FUNCTIONS_ROUTER || ethers.ZeroAddress,
    process.env.CHAINLINK_DON_ID || ethers.ZeroHash,
    process.env.CHAINLINK_SUBSCRIPTION_ID || 0,
    process.env.BACKEND_URL || "https://your-backend-url.com/api/oracle/resolve"
  );
  await aiOracle.waitForDeployment();
  const aiOracleAddress = await getAddress(aiOracle);
  console.log("✅ AI Oracle deployed:", aiOracleAddress, "\n");

  // 5. Deploy DAO Governance
  console.log("📝 Deploying DAO Governance...");
  const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
  const daoGovernance = await DAOGovernance.deploy(
    usdcAddress, // Using USDC as governance token for MVP
    reputationStakingAddress
  );
  await daoGovernance.waitForDeployment();
  const daoGovernanceAddress = await getAddress(daoGovernance);
  console.log("✅ DAO Governance deployed:", daoGovernanceAddress, "\n");

  // 6. Deploy Cross-Chain Router (OmniRouter)
  console.log("📝 Deploying Cross-Chain Router (OmniRouter)...");
  const OmniRouter = await ethers.getContractFactory("OmniRouter");
  const crossChainRouter = await OmniRouter.deploy(
    usdcAddress,
    process.env.CHAINLINK_CCIP_ROUTER || ethers.ZeroAddress,
    process.env.LAYERZERO_ENDPOINT || ethers.ZeroAddress
  );
  await crossChainRouter.waitForDeployment();
  const crossChainRouterAddress = await getAddress(crossChainRouter);
  console.log("✅ Cross-Chain Router (OmniRouter) deployed:", crossChainRouterAddress, "\n");

  // 7. Deploy Market Contracts FIRST (needed for Core)
  // Note: Markets need coreContract in constructor (immutable), so we use deployer temporarily
  // After Core is deployed, we'll transfer ownership to Core
  console.log("📝 Deploying Binary Market...");
  const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
  const binaryMarket = await BinaryMarket.deploy(
    usdcAddress,
    deployer.address // Temporary, will transfer ownership to Core
  );
  await binaryMarket.waitForDeployment();
  const binaryMarketAddress = await getAddress(binaryMarket);
  console.log("✅ Binary Market deployed:", binaryMarketAddress, "\n");

  console.log("📝 Deploying Conditional Market...");
  const ConditionalMarket = await ethers.getContractFactory("ConditionalMarket");
  const conditionalMarket = await ConditionalMarket.deploy(
    usdcAddress,
    deployer.address // Temporary, will transfer ownership to Core
  );
  await conditionalMarket.waitForDeployment();
  const conditionalMarketAddress = await getAddress(conditionalMarket);
  console.log("✅ Conditional Market deployed:", conditionalMarketAddress, "\n");

  console.log("📝 Deploying Subjective Market...");
  const SubjectiveMarket = await ethers.getContractFactory("SubjectiveMarket");
  const subjectiveMarket = await SubjectiveMarket.deploy(
    usdcAddress,
    deployer.address, // Temporary, will transfer ownership to Core
    daoGovernanceAddress
  );
  await subjectiveMarket.waitForDeployment();
  const subjectiveMarketAddress = await getAddress(subjectiveMarket);
  console.log("✅ Subjective Market deployed:", subjectiveMarketAddress, "\n");

  // 8. Deploy Core Contract
  console.log("📝 Deploying Prediction Market Core...");
  const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
  const core = await PredictionMarketCore.deploy(
    usdcAddress,
    binaryMarketAddress,
    conditionalMarketAddress,
    subjectiveMarketAddress,
    aiOracleAddress,
    reputationStakingAddress,
    insurancePoolAddress,
    crossChainRouterAddress,
    daoGovernanceAddress
  );
  await core.waitForDeployment();
  const coreAddress = await getAddress(core);
  console.log("✅ Prediction Market Core deployed:", coreAddress, "\n");

  // 9. Transfer Market Contracts ownership to Core
  console.log("📝 Transferring market contracts ownership to Core...");
  await binaryMarket.transferOwnership(coreAddress);
  await conditionalMarket.transferOwnership(coreAddress);
  await subjectiveMarket.transferOwnership(coreAddress);
  console.log("✅ Market contracts ownership transferred to Core\n");

  // 10. Configure Contracts
  console.log("⚙️  Configuring contracts...\n");

  console.log("Setting core contract in all modules...");
  await insurancePool.setCoreContract(coreAddress);
  await reputationStaking.setCoreContract(coreAddress);
  await aiOracle.setPredictionMarket(coreAddress);
  await daoGovernance.setCoreContract(coreAddress);
  await crossChainRouter.setCoreContract(coreAddress);

  console.log("Registering market types in core...");
  await core.registerMarketContract(0, binaryMarketAddress); // Binary
  await core.registerMarketContract(1, conditionalMarketAddress); // Conditional
  await core.registerMarketContract(2, subjectiveMarketAddress); // Subjective

  console.log("✅ Configuration complete\n");

  // 11. Export Addresses
  const addresses = {
    network: "opBNB Testnet",
    chainId: 5611,
    contracts: {
      usdc: usdcAddress,
      core: coreAddress,
      insurancePool: insurancePoolAddress,
      reputationStaking: reputationStakingAddress,
      aiOracle: aiOracleAddress,
      daoGovernance: daoGovernanceAddress,
      markets: {
        binary: binaryMarketAddress,
        conditional: conditionalMarketAddress,
        subjective: subjectiveMarketAddress,
      },
      crossChainRouter: crossChainRouterAddress,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\n📋 DEPLOYMENT SUMMARY:");
  console.log(JSON.stringify(addresses, null, 2));

  // Save to file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "opbnb-testnet.json"),
    JSON.stringify(addresses, null, 2)
  );

  console.log("\n✅ Deployment complete! Addresses saved to deployments/opbnb-testnet.json");
  console.log("\n🔗 Next steps:");
  console.log("1. Verify contracts on opBNBScan");
  console.log("2. Setup Chainlink Functions subscription");
  console.log("3. Fund contracts with test tokens");
  console.log("4. Update frontend .env with contract addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

