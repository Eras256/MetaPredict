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
  console.log("🔍 Verifying DAO proposals on-chain...\n");

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

  // Connect to DAOGovernance contract
  const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
  const dao = DAOGovernance.attach(DAO_GOVERNANCE);

  // Get proposal counter
  const proposalCounter = await dao.proposalCounter();
  const totalProposals = Number(proposalCounter);
  
  console.log("📊 Contract Information:");
  console.log(`   Total Proposals: ${totalProposals}`);
  console.log(`   Contract Address: ${DAO_GOVERNANCE}\n`);

  if (totalProposals === 0) {
    console.log("⚠️  No proposals found in the contract.");
    return;
  }

  console.log("📋 Reading all proposals:\n");
  console.log("=".repeat(80));

  // Read all proposals
  for (let i = 1; i <= totalProposals; i++) {
    try {
      const proposal = await dao.getProposal(i);
      
      const proposalId = Number(proposal[0]);
      const proposalType = Number(proposal[1]);
      const proposer = proposal[2];
      const title = proposal[3];
      const description = proposal[4];
      const forVotes = Number(proposal[5]);
      const againstVotes = Number(proposal[6]);
      const abstainVotes = Number(proposal[7]);
      const status = Number(proposal[8]);
      const executed = proposal[9];

      // Status labels
      const statusLabels: Record<number, string> = {
        0: "Pending",
        1: "Active",
        2: "Succeeded",
        3: "Defeated",
        4: "Executed",
        5: "Cancelled"
      };

      // Type labels
      const typeLabels: Record<number, string> = {
        0: "MarketResolution",
        1: "ParameterChange",
        2: "TreasurySpend",
        3: "EmergencyAction"
      };

      const totalVotes = forVotes + againstVotes + abstainVotes;

      console.log(`\n📄 Proposal #${proposalId}`);
      console.log(`   Type: ${typeLabels[proposalType] || 'Unknown'}`);
      console.log(`   Status: ${statusLabels[status] || 'Unknown'} ${executed ? '(Executed)' : ''}`);
      console.log(`   Title: ${title || 'No title'}`);
      console.log(`   Description: ${description ? description.substring(0, 100) + '...' : 'No description'}`);
      console.log(`   Proposer: ${proposer}`);
      console.log(`   Votes:`);
      console.log(`      For: ${forVotes.toLocaleString()}`);
      console.log(`      Against: ${againstVotes.toLocaleString()}`);
      console.log(`      Abstain: ${abstainVotes.toLocaleString()}`);
      console.log(`      Total: ${totalVotes.toLocaleString()}`);
      console.log(`   View on opBNBScan: https://testnet.opbnbscan.com/address/${DAO_GOVERNANCE}#readContract`);
      
      if (i < totalProposals) {
        console.log("-".repeat(80));
      }
    } catch (error: any) {
      console.error(`❌ Error reading proposal ${i}:`, error.message);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n✅ Verification complete!");
  console.log(`\n📊 Summary:`);
  console.log(`   - Total proposals: ${totalProposals}`);
  console.log(`   - Active proposals: ${totalProposals >= 1 ? 'Check status above' : 'None'}`);
  console.log(`   - View in app: https://www.metapredict.fun/dao`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

