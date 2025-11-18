import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  console.log("🚀 Deploying MockUSDC to opBNB Testnet...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "BNB\n");

  if (balance < ethers.parseEther("0.01")) {
    console.warn("⚠️  WARNING: Low balance! You may not have enough for deployment.\n");
  }

  // Deploy MockUSDC
  console.log("📝 Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log("✅ MockUSDC deployed:", mockUSDCAddress);
  console.log("🔗 Explorer:", `https://testnet.opbnbscan.com/address/${mockUSDCAddress}\n`);

  // Mint tokens to deployer
  console.log("📝 Minting 10,000 USDC to deployer...");
  const mintAmount = 10_000; // 10,000 USDC (sin decimales, el contrato los agrega)
  const mintTx = await mockUSDC.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log("✅ Minted", mintAmount, "USDC to", deployer.address, "\n");

  // Check balance
  const balanceRaw = await mockUSDC.balanceOf(deployer.address);
  const balanceFormatted = ethers.formatUnits(balanceRaw, 6);
  console.log("💰 Your MockUSDC balance:", balanceFormatted, "USDC\n");

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentInfo = {
    network: "opBNB Testnet",
    chainId: 5611,
    deployer: deployer.address,
    contracts: {
      MockUSDC: {
        address: mockUSDCAddress,
        deployedAt: new Date().toISOString(),
        mintAmount: mintAmount,
      },
    },
  };

  const deploymentFile = path.join(deploymentsDir, "mock-usdc-opbnb-testnet.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("📄 Deployment info saved to:", deploymentFile, "\n");

  // Instructions
  console.log("=".repeat(80));
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("=".repeat(80));
  console.log("\n📋 Next Steps:\n");
  console.log("1. Update your .env file with:");
  console.log(`   USDC_ADDRESS=${mockUSDCAddress}`);
  console.log(`   NEXT_PUBLIC_USDC_ADDRESS=${mockUSDCAddress}\n`);
  console.log("2. Mint more tokens if needed:");
  console.log(`   await mockUSDC.mint("0xTuDireccion", 10000);\n`);
  console.log("3. Verify the contract (optional):");
  console.log(`   npx hardhat verify --network opBNBTestnet ${mockUSDCAddress}\n`);
  console.log("=".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

