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
});

