import { renderHook, waitFor } from '@testing-library/react';
import { usePlaceBet } from '@/lib/hooks/betting/usePlaceBet';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { toast } from 'sonner';

// Mock thirdweb
jest.mock('thirdweb/react', () => ({
  useActiveAccount: jest.fn(),
  useSendTransaction: jest.fn(),
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

describe('usePlaceBet Hook', () => {
  const mockAccount = {
    address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  };

  const mockSendTransaction = jest.fn();
  const mockWaitForReceipt = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useActiveAccount as jest.Mock).mockReturnValue(mockAccount);
    (useSendTransaction as jest.Mock).mockReturnValue({
      mutateAsync: mockSendTransaction,
      isPending: false,
    });

    // Mock waitForReceipt
    jest.doMock('thirdweb', () => ({
      waitForReceipt: mockWaitForReceipt,
    }));
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => usePlaceBet());

    expect(result.current).toHaveProperty('placeBet');
    expect(result.current).toHaveProperty('isPending');
    expect(result.current.isPending).toBe(false);
  });

  it('should throw error when no account is connected', async () => {
    (useActiveAccount as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => usePlaceBet());

    await expect(
      result.current.placeBet(1, true, '0.001')
    ).rejects.toThrow('No account connected');
  });

  it('should place a bet successfully', async () => {
    const mockTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const mockReceipt = { transactionHash: mockTxHash };

    mockSendTransaction.mockResolvedValue(mockReceipt);
    mockWaitForReceipt.mockResolvedValue(mockReceipt);

    const { result } = renderHook(() => usePlaceBet());

    await result.current.placeBet(1, true, '0.001');

    expect(mockSendTransaction).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Transaction failed');
    mockSendTransaction.mockRejectedValue(mockError);

    const { result } = renderHook(() => usePlaceBet());

    await expect(
      result.current.placeBet(1, true, '0.001')
    ).rejects.toThrow('Transaction failed');

    expect(toast.error).toHaveBeenCalled();
  });
});

