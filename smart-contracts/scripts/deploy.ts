import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function main() {
  console.log("🚀 Deploying MetaPredict.ai to opBNB...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString(), "\n");

  // 1. Deploy USDC Mock (testnet only)
  console.log("📝 Deploying Mock USDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.deployed();
  console.log("✅ Mock USDC deployed:", usdc.address, "\n");

  // 2. Deploy Insurance Pool
  console.log("📝 Deploying Insurance Pool...");
  const InsurancePool = await ethers.getContractFactory("InsurancePool");
  const insurancePool = await InsurancePool.deploy(
    usdc.address,
    process.env.VENUS_VTOKEN || ethers.constants.AddressZero, // Venus vUSDC
    process.env.PANCAKE_ROUTER || ethers.constants.AddressZero,
    "MetaPredict Insurance Shares",
    "mpINS"
  );
  await insurancePool.deployed();
  console.log("✅ Insurance Pool deployed:", insurancePool.address, "\n");

  // 3. Deploy Reputation Staking
  console.log("📝 Deploying Reputation Staking...");
  const ReputationStaking = await ethers.getContractFactory("ReputationStaking");
  const reputationStaking = await ReputationStaking.deploy(usdc.address);
  await reputationStaking.deployed();
  console.log("✅ Reputation Staking deployed:", reputationStaking.address, "\n");

  // 4. Deploy AI Oracle
  console.log("📝 Deploying AI Oracle...");
  const AIOracle = await ethers.getContractFactory("AIOracle");
  const aiOracle = await AIOracle.deploy(
    process.env.CHAINLINK_FUNCTIONS_ROUTER || ethers.constants.AddressZero,
    process.env.CHAINLINK_DON_ID || ethers.constants.HashZero,
    process.env.CHAINLINK_SUBSCRIPTION_ID || 0
  );
  await aiOracle.deployed();
  console.log("✅ AI Oracle deployed:", aiOracle.address, "\n");

  // 5. Deploy DAO Governance
  console.log("📝 Deploying DAO Governance...");
  const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
  const daoGovernance = await DAOGovernance.deploy(
    usdc.address, // Using USDC as governance token for MVP
    reputationStaking.address
  );
  await daoGovernance.deployed();
  console.log("✅ DAO Governance deployed:", daoGovernance.address, "\n");

  // 6. Deploy Cross-Chain Router
  console.log("📝 Deploying Cross-Chain Router...");
  const CrossChainRouter = await ethers.getContractFactory("CrossChainRouter");
  const crossChainRouter = await CrossChainRouter.deploy(
    usdc.address,
    process.env.CHAINLINK_CCIP_ROUTER || ethers.constants.AddressZero,
    process.env.LAYERZERO_ENDPOINT || ethers.constants.AddressZero
  );
  await crossChainRouter.deployed();
  console.log("✅ Cross-Chain Router deployed:", crossChainRouter.address, "\n");

  // 7. Deploy Core Contract
  console.log("📝 Deploying Prediction Market Core...");
  const PredictionMarketCore = await ethers.getContractFactory("PredictionMarketCore");
  const core = await PredictionMarketCore.deploy(
    usdc.address,
    aiOracle.address,
    reputationStaking.address,
    insurancePool.address,
    crossChainRouter.address,
    daoGovernance.address
  );
  await core.deployed();
  console.log("✅ Prediction Market Core deployed:", core.address, "\n");

  // 8. Deploy Market Contracts
  console.log("📝 Deploying Binary Market...");
  const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
  const binaryMarket = await BinaryMarket.deploy(
    usdc.address,
    core.address
  );
  await binaryMarket.deployed();
  console.log("✅ Binary Market deployed:", binaryMarket.address, "\n");

  console.log("📝 Deploying Conditional Market...");
  const ConditionalMarket = await ethers.getContractFactory("ConditionalMarket");
  const conditionalMarket = await ConditionalMarket.deploy(
    usdc.address,
    core.address
  );
  await conditionalMarket.deployed();
  console.log("✅ Conditional Market deployed:", conditionalMarket.address, "\n");

  console.log("📝 Deploying Subjective Market...");
  const SubjectiveMarket = await ethers.getContractFactory("SubjectiveMarket");
  const subjectiveMarket = await SubjectiveMarket.deploy(
    usdc.address,
    core.address,
    daoGovernance.address
  );
  await subjectiveMarket.deployed();
  console.log("✅ Subjective Market deployed:", subjectiveMarket.address, "\n");

  // 9. Configure Contracts
  console.log("⚙️  Configuring contracts...\n");

  console.log("Setting core contract in all modules...");
  await insurancePool.setCoreContract(core.address);
  await reputationStaking.setCoreContract(core.address);
  await aiOracle.setCoreContract(core.address);
  await daoGovernance.setCoreContract(core.address);
  await crossChainRouter.setCoreContract(core.address);

  console.log("Registering market types in core...");
  await core.registerMarketContract(0, binaryMarket.address); // Binary
  await core.registerMarketContract(1, conditionalMarket.address); // Conditional
  await core.registerMarketContract(2, subjectiveMarket.address); // Subjective

  console.log("✅ Configuration complete\n");

  // 10. Export Addresses
  const addresses = {
    network: "opBNB Testnet",
    chainId: 5611,
    contracts: {
      usdc: usdc.address,
      core: core.address,
      insurancePool: insurancePool.address,
      reputationStaking: reputationStaking.address,
      aiOracle: aiOracle.address,
      daoGovernance: daoGovernance.address,
      markets: {
        binary: binaryMarket.address,
        conditional: conditionalMarket.address,
        subjective: subjectiveMarket.address,
      },
      crossChainRouter: crossChainRouter.address,
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
