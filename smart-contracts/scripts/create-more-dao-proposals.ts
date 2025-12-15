import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
// @ts-ignore - Hardhat types may not be fully updated
import { ethers } from "hardhat";

// Load .env
const envPath = path.resolve(__dirname, '../../.env');
const envLocalPath = path.resolve(__dirname, '../../.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

async function main() {
  console.log("🗳️  Creating additional DAO proposals for testing...\n");

  const DAO_GOVERNANCE = process.env.NEXT_PUBLIC_DAO_GOVERNANCE_ADDRESS || "0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123";
  
  // Get signer from private key or use first hardhat signer
  let signer;
  if (process.env.PRIVATE_KEY) {
    const provider = new ethers.JsonRpcProvider("https://opbnb-testnet-rpc.bnbchain.org");
    signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("📝 Using account from PRIVATE_KEY:", signer.address);
  } else {
    const signers = await ethers.getSigners();
    signer = signers[0];
    console.log("📝 Using first Hardhat signer:", signer.address);
  }

  const balance = await signer.provider.getBalance(signer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "BNB\n");

  // Need at least 0.2 BNB (0.1 per proposal for 2 proposals)
  const minRequired = ethers.parseEther("0.2");
  if (balance < minRequired) {
    console.error("❌ Error: Insufficient balance!");
    console.error(`   You need at least ${ethers.formatEther(minRequired)} BNB`);
    console.error(`   You have: ${ethers.formatEther(balance)} BNB`);
    process.exit(1);
  }

  // Connect to DAOGovernance contract
  const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
  const dao = DAOGovernance.attach(DAO_GOVERNANCE);

  // Define additional proposals (2 proposals to match available balance)
  const proposals = [
    {
      title: "Extend Voting Period to 5 Days",
      description: "This proposal aims to extend the voting period from 3 days to 5 days to allow more community members to participate in governance decisions. This will provide more time for discussion and ensure better representation of the community's views."
    },
    {
      title: "Implement Reputation-Based Voting Multiplier",
      description: "This proposal suggests implementing a reputation-based voting multiplier system where users with higher reputation scores get additional voting power. This will incentivize active participation and reward long-term contributors to the platform."
    }
  ];

  const proposalAmount = ethers.parseEther("0.1"); // 0.1 BNB per proposal

  console.log("📋 Proposals to create:");
  proposals.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.title}`);
  });
  console.log("");

  // Create each proposal
  for (let i = 0; i < proposals.length; i++) {
    const proposal = proposals[i];
    console.log(`📝 Creating proposal ${i + 1}/${proposals.length}: "${proposal.title}"`);
    
    try {
      // Estimate gas first
      const gasEstimate = await dao.createParameterProposal.estimateGas(
        proposal.title,
        proposal.description,
        { value: proposalAmount }
      );
      console.log(`   Gas estimated: ${gasEstimate.toString()}`);

      // Create the proposal
      const tx = await dao.createParameterProposal(
        proposal.title,
        proposal.description,
        { value: proposalAmount }
      );
      
      console.log(`   ✅ Transaction sent: ${tx.hash}`);
      console.log(`   ⏳ Waiting for confirmation...`);
      
      const receipt = await tx.wait();
      console.log(`   ✅ Proposal ${i + 1} created successfully!`);
      console.log(`   Block: ${receipt.blockNumber}`);
      
      // Find the ProposalCreated event to get the ID
      const proposalCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = dao.interface.parseLog(log);
          return parsed && parsed.name === 'ProposalCreated';
        } catch {
          return false;
        }
      });

      if (proposalCreatedEvent) {
        const parsed = dao.interface.parseLog(proposalCreatedEvent);
        const proposalId = parsed?.args[0];
        console.log(`   🆔 Proposal ID: ${proposalId.toString()}`);
      }

      console.log("");
      
      // Wait a bit between transactions to avoid nonce issues
      if (i < proposals.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error: any) {
      console.error(`   ❌ Error creating proposal ${i + 1}:`, error.message);
      if (error.reason) {
        console.error(`   Reason: ${error.reason}`);
      }
      if (error.data) {
        console.error(`   Data: ${error.data}`);
      }
      console.log("");
    }
  }

  console.log("🎉 Process completed!");
  console.log("\n📊 Summary:");
  console.log(`   - Proposals created: ${proposals.length}`);
  console.log(`   - DAO Contract: ${DAO_GOVERNANCE}`);
  console.log(`   - View proposals at: https://testnet.opbnbscan.com/address/${DAO_GOVERNANCE}#readContract`);
  console.log(`   - View in app: https://www.metapredict.fun/dao`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

