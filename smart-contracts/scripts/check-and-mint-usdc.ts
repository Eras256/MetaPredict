import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("📝 Checking USDC balance for:", deployer.address);

  const mockUSDCAddress = "0xB3Fd473A31dE87527cE289Ba6A04869fD3d6C16A";
  
  const mockUSDC = await ethers.getContractAt("MockUSDC", mockUSDCAddress);
  
  const balance = await mockUSDC.balanceOf(deployer.address);
  const balanceFormatted = ethers.formatUnits(balance, 6);
  
  console.log("💰 Current USDC balance:", balanceFormatted, "USDC");
  
  // Si el balance es menor a 10,000 USDC, mintear más
  if (balance < ethers.parseUnits("10000", 6)) {
    console.log("\n📝 Minting 50,000 USDC...");
    const mintTx = await mockUSDC.mint(deployer.address, 50000);
    await mintTx.wait();
    console.log("✅ Minted 50,000 USDC");
    
    const newBalance = await mockUSDC.balanceOf(deployer.address);
    console.log("💰 New balance:", ethers.formatUnits(newBalance, 6), "USDC");
  } else {
    console.log("✅ Balance suficiente, no se necesita mintear más");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

