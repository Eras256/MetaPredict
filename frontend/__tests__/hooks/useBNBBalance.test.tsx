import { renderHook, waitFor } from '@testing-library/react';
import { useBNBBalance } from '@/lib/hooks/useBNBBalance';
import { useActiveAccount } from 'thirdweb/react';
import { eth_getBalance } from 'thirdweb/rpc';

// Mock thirdweb
jest.mock('thirdweb/react', () => ({
  useActiveAccount: jest.fn(),
}));

jest.mock('thirdweb/rpc', () => ({
  eth_getBalance: jest.fn(),
  getRpcClient: jest.fn(() => ({})),
}));

// Mock thirdweb client
jest.mock('@/lib/config/thirdweb', () => ({
  client: {},
}));

describe('useBNBBalance Hook', () => {
  const mockAccount = {
    address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return balance when account is connected', async () => {
    (useActiveAccount as jest.Mock).mockReturnValue(mockAccount);
    (eth_getBalance as jest.Mock).mockResolvedValue(BigInt('1000000000000000000')); // 1 BNB

    const { result } = renderHook(() => useBNBBalance());

    await waitFor(() => {
      expect(result.current.balance).toBe(1);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should return zero when no account', () => {
    (useActiveAccount as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useBNBBalance());

    expect(result.current.balance).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });
});

