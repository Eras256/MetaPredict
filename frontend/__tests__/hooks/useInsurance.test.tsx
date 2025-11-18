import { renderHook } from '@testing-library/react';
import { useInsurance } from '@/lib/hooks/insurance/useInsurance';
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

describe('useInsurance Hook', () => {
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

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useInsurance());

    expect(result.current).toHaveProperty('deposit');
    expect(result.current).toHaveProperty('withdraw');
    expect(result.current).toHaveProperty('claimYield');
    expect(result.current).toHaveProperty('claimInsurance');
    expect(result.current).toHaveProperty('loading');
  });

  it('should deposit successfully', async () => {
    const mockTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const mockReceipt = { transactionHash: mockTxHash };

    mockSendTransaction.mockResolvedValue(mockReceipt);

    const { result } = renderHook(() => useInsurance());

    await result.current.deposit(BigInt('1000000000000000')); // 0.001 BNB

    expect(mockSendTransaction).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  it('should throw error when no account is connected', async () => {
    (useActiveAccount as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useInsurance());

    await expect(
      result.current.deposit(BigInt('1000000000000000'))
    ).rejects.toThrow('No account connected');
  });
});

