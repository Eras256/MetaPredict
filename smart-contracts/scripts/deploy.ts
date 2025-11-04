import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Deploying MetaPredict.ai contracts to opBNB...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy InsurancePool first (needed by TruthChain)
  console.log("\n📦 Deploying InsurancePool...");
  const USDC_ADDRESS = process.env.USDC_ADDRESS || "0x0000000000000000000000000000000000000000"; // Replace with actual USDC address
  const InsurancePool = await ethers.getContractFactory("InsurancePool");
  const insurancePool = await InsurancePool.deploy(
    USDC_ADDRESS,
    "MetaPredict Insurance Pool",
    "MIP"
  );
  await insurancePool.waitForDeployment();
  const insurancePoolAddress = await insurancePool.getAddress();
  console.log("✅ InsurancePool deployed to:", insurancePoolAddress);

  // Deploy TruthChain
  console.log("\n🧠 Deploying TruthChain...");
  const FunctionsRouter = process.env.CHAINLINK_FUNCTIONS_ROUTER || "0x0000000000000000000000000000000000000000";
  const LinkToken = process.env.LINK_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
  const TruthChain = await ethers.getContractFactory("TruthChain");
  const truthChain = await TruthChain.deploy(
    insurancePoolAddress,
    FunctionsRouter,
    LinkToken
  );
  await truthChain.waitForDeployment();
  const truthChainAddress = await truthChain.getAddress();
  console.log("✅ TruthChain deployed to:", truthChainAddress);

  // Grant CLAIMER_ROLE to TruthChain
  console.log("\n🔐 Granting CLAIMER_ROLE to TruthChain...");
  await insurancePool.grantRole(
    await insurancePool.CLAIMER_ROLE(),
    truthChainAddress
  );
  console.log("✅ Role granted");

  // Deploy ReputationDAO
  console.log("\n💎 Deploying ReputationDAO...");
  const CCIPRouter = process.env.CHAINLINK_CCIP_ROUTER || "0x0000000000000000000000000000000000000000";
  const ReputationDAO = await ethers.getContractFactory("ReputationDAO");
  const reputationDAO = await ReputationDAO.deploy(CCIPRouter);
  await reputationDAO.waitForDeployment();
  const reputationDAOAddress = await reputationDAO.getAddress();
  console.log("✅ ReputationDAO deployed to:", reputationDAOAddress);

  // Deploy ConditionalMarket
  console.log("\n🔄 Deploying ConditionalMarket...");
  const ConditionalMarket = await ethers.getContractFactory("ConditionalMarket");
  const conditionalMarket = await ConditionalMarket.deploy();
  await conditionalMarket.waitForDeployment();
  const conditionalMarketAddress = await conditionalMarket.getAddress();
  console.log("✅ ConditionalMarket deployed to:", conditionalMarketAddress);

  // Deploy SubjectiveMarket
  console.log("\n📊 Deploying SubjectiveMarket...");
  const SubjectiveMarket = await ethers.getContractFactory("SubjectiveMarket");
  const subjectiveMarket = await SubjectiveMarket.deploy();
  await subjectiveMarket.waitForDeployment();
  const subjectiveMarketAddress = await subjectiveMarket.getAddress();
  console.log("✅ SubjectiveMarket deployed to:", subjectiveMarketAddress);

  // Deploy OmniRouter
  console.log("\n🌉 Deploying OmniRouter...");
  const OmniRouter = await ethers.getContractFactory("OmniRouter");
  const omniRouter = await OmniRouter.deploy(CCIPRouter);
  await omniRouter.waitForDeployment();
  const omniRouterAddress = await omniRouter.getAddress();
  console.log("✅ OmniRouter deployed to:", omniRouterAddress);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("InsurancePool:", insurancePoolAddress);
  console.log("TruthChain:", truthChainAddress);
  console.log("ReputationDAO:", reputationDAOAddress);
  console.log("ConditionalMarket:", conditionalMarketAddress);
  console.log("SubjectiveMarket:", subjectiveMarketAddress);
  console.log("OmniRouter:", omniRouterAddress);
  console.log("=".repeat(60));

  // Save addresses to file
  const addresses = {
    network: process.env.NETWORK || "opbnb-testnet",
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      InsurancePool: insurancePoolAddress,
      TruthChain: truthChainAddress,
      ReputationDAO: reputationDAOAddress,
      ConditionalMarket: conditionalMarketAddress,
      SubjectiveMarket: subjectiveMarketAddress,
      OmniRouter: omniRouterAddress,
    },
  };

  const fs = require("fs");
  fs.writeFileSync(
    "./deployment-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\n✅ Addresses saved to deployment-addresses.json");

  console.log("\n🎉 Deployment complete! 🏆");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

