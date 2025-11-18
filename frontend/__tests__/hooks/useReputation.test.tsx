import { renderHook } from '@testing-library/react';
import { useReputation, useStakeReputation } from '@/lib/hooks/reputation/useReputation';
import { useActiveAccount, useSendTransaction, useReadContract } from 'thirdweb/react';

// Mock thirdweb
jest.mock('thirdweb/react', () => ({
  useActiveAccount: jest.fn(),
  useSendTransaction: jest.fn(),
  useReadContract: jest.fn(),
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

// Mock thirdweb waitForReceipt
jest.mock('thirdweb', () => ({
  ...jest.requireActual('thirdweb'),
  waitForReceipt: jest.fn().mockResolvedValue({}),
}));

describe('useReputation Hook', () => {
  const mockAccount = {
    address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useActiveAccount as jest.Mock).mockReturnValue(mockAccount);
  });

  it('should return reputation data', () => {
    const mockStakerData = [
      BigInt('1000000000000000000'), // 1 BNB staked
      BigInt('1000'), // reputation score
      2, // tier (Gold)
      BigInt('10'), // correct votes
      BigInt('15'), // total votes
      BigInt('0'), // slashed amount
    ];

    (useReadContract as jest.Mock).mockReturnValue({
      data: mockStakerData,
      isLoading: false,
    });

    const { result } = renderHook(() => useReputation());

    expect(result.current.stakedAmount).toBe(1);
    expect(result.current.reputationScore).toBe(1000);
    expect(result.current.tier).toBe(2);
    expect(result.current.correctVotes).toBe(10);
    expect(result.current.totalVotes).toBe(15);
  });

  it('should handle loading state', () => {
    (useReadContract as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    const { result } = renderHook(() => useReputation());

    expect(result.current.isLoading).toBe(true);
  });
});

describe('useStakeReputation Hook', () => {
  const mockAccount = {
    address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  };

  const mockSendTransaction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useActiveAccount as jest.Mock).mockReturnValue(mockAccount);
    (useSendTransaction as jest.Mock).mockReturnValue({
      mutateAsync: mockSendTransaction,
      isPending: false,
    });
  });

  it('should stake successfully', async () => {
    const mockTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const mockReceipt = { transactionHash: mockTxHash };

    mockSendTransaction.mockResolvedValue(mockReceipt);

    const { result } = renderHook(() => useStakeReputation());

    await result.current.stake(BigInt('1000000000000000000')); // 1 BNB

    expect(mockSendTransaction).toHaveBeenCalled();
  });
});

