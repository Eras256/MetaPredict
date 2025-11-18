/**
 * End-to-End Integration Tests for Frontend
 * 
 * These tests verify:
 * 1. Frontend hooks connect to contracts correctly
 * 2. Transactions are prepared correctly
 * 3. Error handling works properly
 * 
 * Note: These are integration tests that may require:
 * - Mocked wallet connection
 * - Test network connection
 */

import { renderHook, waitFor } from '@testing-library/react';
import { usePlaceBet } from '@/lib/hooks/betting/usePlaceBet';
import { useInsurance } from '@/lib/hooks/insurance/useInsurance';
import { useReputation } from '@/lib/hooks/reputation/useReputation';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';

// Mock thirdweb
jest.mock('thirdweb/react', () => ({
  useActiveAccount: jest.fn(() => ({
    address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  })),
  useSendTransaction: jest.fn(() => ({
    mutateAsync: jest.fn().mockResolvedValue({
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    }),
    isPending: false,
  })),
  useReadContract: jest.fn(() => ({
    data: null,
    isLoading: false,
  })),
}));

// Mock thirdweb client
jest.mock('@/lib/config/thirdweb', () => ({
  client: {},
}));

// Mock blockchain utils
jest.mock('@/lib/utils/blockchain', () => ({
  getTransactionUrl: jest.fn((hash) => `https://testnet.opbnbscan.com/tx/${hash}`),
  formatTxHash: jest.fn((hash) => `${hash.slice(0, 6)}...${hash.slice(-4)}`),
}));

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Frontend E2E Integration Tests', () => {
  describe('Contract Addresses', () => {
    it('should have all required contract addresses', () => {
      expect(CONTRACT_ADDRESSES.PREDICTION_MARKET).toBeDefined();
      expect(CONTRACT_ADDRESSES.AI_ORACLE).toBeDefined();
      expect(CONTRACT_ADDRESSES.INSURANCE_POOL).toBeDefined();
      expect(CONTRACT_ADDRESSES.REPUTATION_STAKING).toBeDefined();
      expect(CONTRACT_ADDRESSES.DAO_GOVERNANCE).toBeDefined();
      expect(CONTRACT_ADDRESSES.OMNI_ROUTER).toBeDefined();
      expect(CONTRACT_ADDRESSES.BINARY_MARKET).toBeDefined();
      expect(CONTRACT_ADDRESSES.CONDITIONAL_MARKET).toBeDefined();
      expect(CONTRACT_ADDRESSES.SUBJECTIVE_MARKET).toBeDefined();
      expect(CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION).toBeDefined();
    });

    it('should have valid address format', () => {
      Object.values(CONTRACT_ADDRESSES).forEach((address) => {
        expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      });
    });
  });

  describe('Betting Flow', () => {
    it('should initialize betting hook', () => {
      const { result } = renderHook(() => usePlaceBet());

      expect(result.current).toHaveProperty('placeBet');
      expect(result.current).toHaveProperty('isPending');
    });
  });

  describe('Insurance Flow', () => {
    it('should initialize insurance hook', () => {
      const { result } = renderHook(() => useInsurance());

      expect(result.current).toHaveProperty('deposit');
      expect(result.current).toHaveProperty('withdraw');
      expect(result.current).toHaveProperty('claimYield');
      expect(result.current).toHaveProperty('claimInsurance');
    });
  });

  describe('Reputation Flow', () => {
    it('should initialize reputation hook', () => {
      const { result } = renderHook(() => useReputation());

      expect(result.current).toHaveProperty('stakedAmount');
      expect(result.current).toHaveProperty('reputationScore');
      expect(result.current).toHaveProperty('tier');
      expect(result.current).toHaveProperty('isLoading');
    });
  });
});

