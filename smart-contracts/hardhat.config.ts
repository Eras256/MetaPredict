import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "opbnb-mainnet": {
      url: process.env.RPC_URL || "https://opbnb-mainnet-nodereal.io",
      chainId: 204,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
    opBNBTestnet: {
      url: process.env.RPC_URL_TESTNET || "https://opbnb-testnet-rpc.bnbchain.org",
      chainId: 5611,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
    opBNBMainnet: {
      url: process.env.RPC_URL || "https://opbnb-mainnet-rpc.bnbchain.org",
      chainId: 204,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    hardhat: {
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: {
      opbnbMainnet: process.env.BSCSCAN_API_KEY || "",
      opbnbTestnet: process.env.BSCSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "opbnbMainnet",
        chainId: 204,
        urls: {
          apiURL: "https://api-opbnb.bscscan.com/api",
          browserURL: "https://opbnb.bscscan.com",
        },
      },
      {
        network: "opbnbTestnet",
        chainId: 5611,
        urls: {
          apiURL: "https://api-opbnb-testnet.bscscan.com/api",
          browserURL: "https://opbnb-testnet.bscscan.com",
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

