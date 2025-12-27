import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../../../test-utils/contracts';

// Integration tests for smart contract interactions
describe('Smart Contract Integration Tests', () => {
  let provider: ethers.Provider;
  let signer: ethers.Signer;

  beforeAll(() => {
    const rpcUrl = process.env.RPC_URL || 'https://opbnb-testnet-rpc.bnbchain.org';
    provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Use a test account (you should use a test account with testnet BNB)
    const privateKey = process.env.TEST_PRIVATE_KEY || '';
    if (privateKey) {
      signer = new ethers.Wallet(privateKey, provider);
    }
  });

  describe('PredictionMarketCore Contract', () => {
    it('should connect to deployed contract', async () => {
      const contractAddress = CONTRACT_ADDRESSES.PREDICTION_MARKET_CORE;
      const code = await provider.getCode(contractAddress);
      
      expect(code).not.toBe('0x');
      expect(contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should read contract version', async () => {
      // This would require the contract ABI
      // For now, just verify the contract exists
      const contractAddress = CONTRACT_ADDRESSES.PREDICTION_MARKET_CORE;
      const code = await provider.getCode(contractAddress);
      
      expect(code).not.toBe('0x');
    });
  });

  describe('AIOracle Contract', () => {
    it('should connect to deployed contract', async () => {
      const contractAddress = CONTRACT_ADDRESSES.AI_ORACLE;
      const code = await provider.getCode(contractAddress);
      
      expect(code).not.toBe('0x');
    });
  });

  describe('InsurancePool Contract', () => {
    it('should connect to deployed contract', async () => {
      const contractAddress = CONTRACT_ADDRESSES.INSURANCE_POOL;
      const code = await provider.getCode(contractAddress);
      
      expect(code).not.toBe('0x');
    });
  });

  describe('ChainlinkDataStreamsIntegration Contract', () => {
    const DATA_STREAMS_ABI = [
      'function verifierProxy() external view returns (address)',
      'function PRICE_STALENESS_THRESHOLD() external view returns (uint256)',
      'function marketStreamId(uint256) external view returns (bytes32)',
      'function marketTargetPrice(uint256) external view returns (int256)',
      'function lastVerifiedPrice(uint256) external view returns (int256)',
      'function lastPriceTimestamp(uint256) external view returns (uint256)',
      'function owner() external view returns (address)',
    ];

    let contract: ethers.Contract;

    beforeAll(() => {
      const contractAddress = CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION;
      contract = new ethers.Contract(contractAddress, DATA_STREAMS_ABI, provider);
    });

    it('should connect to deployed contract', async () => {
      const contractAddress = CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION;
      const code = await provider.getCode(contractAddress);
      
      expect(code).not.toBe('0x');
      expect(contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(contractAddress).toBe('0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3');
    });

    it('should read verifierProxy address', async () => {
      const verifierProxy = await contract.verifierProxy();
      
      expect(verifierProxy).toBeDefined();
      expect(verifierProxy).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(verifierProxy.toLowerCase()).toBe('0x001225aca0efe49dbb48233ab83a9b4d177b581a'.toLowerCase());
    });

    it('should read PRICE_STALENESS_THRESHOLD constant', async () => {
      const threshold = await contract.PRICE_STALENESS_THRESHOLD();
      
      expect(threshold).toBeDefined();
      expect(Number(threshold)).toBe(60); // 60 seconds
    });

    it('should read owner address', async () => {
      const owner = await contract.owner();
      
      expect(owner).toBeDefined();
      expect(owner).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should return zero values for unconfigured market', async () => {
      // Test with marketId 0 (should not be configured)
      const streamId = await contract.marketStreamId(0);
      const targetPrice = await contract.marketTargetPrice(0);
      const lastPrice = await contract.lastVerifiedPrice(0);
      const lastTimestamp = await contract.lastPriceTimestamp(0);
      
      // All should be zero for unconfigured market
      expect(streamId).toBeDefined();
      expect(Number(targetPrice)).toBe(0);
      expect(Number(lastPrice)).toBe(0);
      expect(Number(lastTimestamp)).toBe(0);
    });

    it('should have correct contract address format', () => {
      const contractAddress = CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION;
      
      expect(contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(contractAddress).toBe('0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3');
    });
  });
});

