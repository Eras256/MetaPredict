import { renderHook } from '@testing-library/react';
import {
  useCreateBinaryMarket,
  useCreateConditionalMarket,
  useCreateSubjectiveMarket,
  useInitiateResolution,
} from '@/lib/hooks/markets/useCreateMarket';
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

describe('useCreateBinaryMarket Hook', () => {
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

  it('should create binary market', async () => {
    const mockTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const mockReceipt = { transactionHash: mockTxHash };

    mockSendTransaction.mockResolvedValue(mockReceipt);

    const { result } = renderHook(() => useCreateBinaryMarket());

    await result.current.createMarket(
      'Will BTC reach $100K?',
      'Test description',
      Math.floor(Date.now() / 1000) + 86400,
      ''
    );

    expect(mockSendTransaction).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });
});

describe('useCreateConditionalMarket Hook', () => {
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

  it('should create conditional market', async () => {
    const mockTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const mockReceipt = { transactionHash: mockTxHash };

    mockSendTransaction.mockResolvedValue(mockReceipt);

    const { result } = renderHook(() => useCreateConditionalMarket());

    await result.current.createMarket(
      1,
      'If parent resolves YES',
      'Will ETH reach $10K?',
      Math.floor(Date.now() / 1000) + 86400,
      ''
    );

    expect(mockSendTransaction).toHaveBeenCalled();
  });
});

describe('useInitiateResolution Hook', () => {
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

  it('should initiate resolution', async () => {
    const mockTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const mockReceipt = { transactionHash: mockTxHash };

    mockSendTransaction.mockResolvedValue(mockReceipt);

    const { result } = renderHook(() => useInitiateResolution());

    await result.current.initiateResolution(1);

    expect(mockSendTransaction).toHaveBeenCalled();
  });
});

