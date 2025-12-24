import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

export default defineConfig({
  plugins: [
    hardhatVerify,
    // ...other plugins...
  ],
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable IR-based compilation to handle stack too deep errors
      evmVersion: "paris", // Match deployment configuration exactly
    },
  },
  networks: {
    "opbnb-mainnet": {
      type: "http",
      url: process.env.RPC_URL || "https://opbnb-mainnet-nodereal.io",
      chainId: 204,
      accounts: accounts,
      gasPrice: 1000000000, // 1 gwei
    },
    opBNBTestnet: {
      type: "http",
      url: process.env.RPC_URL_TESTNET || "https://opbnb-testnet-rpc.bnbchain.org/",
      chainId: 5611,
      accounts: accounts,
      gasPrice: 20000000000, // 20 gwei (as per official docs)
    },
    opbnb: {
      type: "http",
      url: process.env.RPC_URL_TESTNET || "https://opbnb-testnet-rpc.bnbchain.org/",
      chainId: 5611,
      accounts: accounts,
      gasPrice: 20000000000, // 20 gwei (as per official docs)
    },
    opBNBMainnet: {
      type: "http",
      url: process.env.RPC_URL || "https://opbnb-mainnet-rpc.bnbchain.org",
      chainId: 204,
      accounts: accounts,
    },
    hardhat: {
      type: "edr-simulated",
      chainId: 1337,
    },
  },
  // opBNBScan verification using Etherscan API v2
  // opBNB Testnet (chainId: 5611) is supported by Etherscan API v2
  // Official documentation: https://docs.etherscan.io/supported-chains
  // Solution for Hardhat 3.x: Use chainDescriptors with Etherscan API v2
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY || "",
    },
    blockscout: {
      enabled: false,
    },
  },
  chainDescriptors: {
    5611: {
      name: "opbnb",
      blockExplorers: {
        etherscan: {
          name: "opBNB Testnet Explorer",
          url: "https://testnet.opbnbscan.com",
          apiUrl: "https://api.etherscan.io/v2/api",
        },
      },
    },
  },
  // Disable Sourcify verification completely
  sourcify: {
    enabled: false,
  },
  // Disable Blockscout as well
  blockscout: {
    enabled: false,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  // Exclude Foundry test files from compilation
  mocha: {
    timeout: 40000,
  },
});

