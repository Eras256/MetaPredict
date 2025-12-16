import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from root directory (1 level up from smart-contracts/)
// .env.local tiene prioridad sobre .env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Helper function to validate and get private key
function getPrivateKey(): string[] {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey === 'your_private_key_here' || privateKey.length < 64) {
    return []; // Return empty array if no valid private key
  }
  // Remove 0x prefix if present and ensure it's 64 chars
  const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  if (cleanKey.length === 64 && /^[0-9a-fA-F]{64}$/i.test(cleanKey)) {
    return [privateKey]; // Return original (with or without 0x, Hardhat handles both)
  }
  return [];
}

const accounts = getPrivateKey();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable IR-based compilation to handle stack too deep errors
    },
  },
  networks: {
    "opbnb-mainnet": {
      url: process.env.RPC_URL || "https://opbnb-mainnet-nodereal.io",
      chainId: 204,
      accounts: accounts,
      gasPrice: 1000000000, // 1 gwei
    },
    opBNBTestnet: {
      url: process.env.RPC_URL_TESTNET || "https://opbnb-testnet-rpc.bnbchain.org",
      chainId: 5611,
      accounts: accounts,
      gasPrice: 1000000000, // 1 gwei
    },
    opBNBMainnet: {
      url: process.env.RPC_URL || "https://opbnb-mainnet-rpc.bnbchain.org",
      chainId: 204,
      accounts: accounts,
    },
    hardhat: {
      chainId: 1337,
    },
  },
  etherscan: {
    // opBNBScan uses NodeReal API for contract verification
    // Get your API key from: https://nodereal.io/ (Login with GitHub/Discord)
    // According to official opBNBScan documentation (December 2025)
    apiKey: {
      // Prefer BSCSCAN_API_KEY for opBNBScan (more reliable), then NODEREAL_API_KEY
      // BSCScan API works directly with opBNBScan
      opbnb: process.env.BSCSCAN_API_KEY || process.env.NODEREAL_API_KEY || process.env.ETHERSCAN_API_KEY || "",
      opBNBTestnet: process.env.BSCSCAN_API_KEY || process.env.NODEREAL_API_KEY || process.env.ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "opbnb",
        chainId: 5611, // opBNB Testnet
        urls: {
          // opBNB Testnet - NodeReal API (official opBNBScan documentation)
          // Format: https://open-platform.nodereal.io/{API_KEY}/op-bnb-testnet/contract/
          apiURL: process.env.NODEREAL_API_KEY 
            ? `https://open-platform.nodereal.io/${process.env.NODEREAL_API_KEY}/op-bnb-testnet/contract/`
            : "https://api-testnet.opbnbscan.com/api",
          browserURL: "https://testnet.opbnbscan.com/",
        },
      },
      {
        network: "opBNBTestnet",
        chainId: 5611, // opBNB Testnet
        urls: {
          // opBNB Testnet - NodeReal API (official opBNBScan documentation)
          // Format: https://open-platform.nodereal.io/{API_KEY}/op-bnb-testnet/contract/
          // IMPORTANT: La API key debe estar en NODEREAL_API_KEY en .env.local
          apiURL: process.env.NODEREAL_API_KEY 
            ? `https://open-platform.nodereal.io/${process.env.NODEREAL_API_KEY}/op-bnb-testnet/contract/`
            : "https://open-platform.nodereal.io/your-api-key/op-bnb-testnet/contract/",
          browserURL: "https://testnet.opbnbscan.com/",
        },
      },
      {
        network: "opbnbMainnet",
        chainId: 204, // opBNB Mainnet
        urls: {
          // opBNB Mainnet - NodeReal API
          apiURL: process.env.NODEREAL_API_KEY 
            ? `https://open-platform.nodereal.io/${process.env.NODEREAL_API_KEY}/op-bnb-mainnet/contract/`
            : "https://api.opbnbscan.com/api",
          browserURL: "https://opbnbscan.com/",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;

