import { renderHook } from '@testing-library/react';
import {
  useProposal,
  useVoteOnProposal,
  useExecuteProposal,
  useUserProposals,
} from '@/lib/hooks/dao/useDAO';
import { useActiveAccount, useSendTransaction, useReadContract } from 'thirdweb/react';
import { toast } from 'sonner';

// Mock thirdweb
jest.mock('thirdweb/react', () => ({
  useActiveAccount: jest.fn(),
  useSendTransaction: jest.fn(),
  useReadContract: jest.fn(),
}));

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
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

describe('useProposal Hook', () => {
  it('should return proposal data', () => {
    const mockProposal = [
      BigInt(1), // id
      1, // proposalType
      '0x1234567890123456789012345678901234567890', // proposer
      'Test Proposal', // title
      'Test Description', // description
      BigInt(100), // forVotes
      BigInt(50), // againstVotes
      BigInt(10), // abstainVotes
      1, // status
      false, // executed
    ];

    (useReadContract as jest.Mock).mockReturnValue({
      data: mockProposal,
      isLoading: false,
    });

    const { result } = renderHook(() => useProposal(1));

    expect(result.current).toHaveProperty('proposal');
    expect(result.current).toHaveProperty('isLoading');
  });
});

describe('useVoteOnProposal Hook', () => {
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

  it('should vote on proposal', async () => {
    const mockTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const mockReceipt = { transactionHash: mockTxHash };

    mockSendTransaction.mockResolvedValue(mockReceipt);

    const { result } = renderHook(() => useVoteOnProposal());

    await result.current.vote(1, 1, '');

    expect(mockSendTransaction).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });
});

describe('useUserProposals Hook', () => {
  it('should return user proposals', () => {
    const mockProposals = [BigInt(1), BigInt(2), BigInt(3)];

    (useReadContract as jest.Mock).mockReturnValue({
      data: mockProposals,
      isLoading: false,
    });

    const { result } = renderHook(() => useUserProposals());

    expect(result.current).toHaveProperty('proposalIds');
    expect(result.current).toHaveProperty('isLoading');
  });
});

