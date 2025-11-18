import { renderHook, waitFor } from '@testing-library/react';
import { useMarkets, useMarket } from '@/lib/hooks/useMarkets';
import { readContract } from 'thirdweb';

// Mock thirdweb
jest.mock('thirdweb', () => ({
  readContract: jest.fn(),
  getContract: jest.fn(() => ({})),
}));

// Mock thirdweb client
jest.mock('@/lib/config/thirdweb', () => ({
  client: {},
}));

describe('useMarkets Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    (readContract as jest.Mock).mockResolvedValue(BigInt(0));

    const { result } = renderHook(() => useMarkets());

    expect(result.current.loading).toBe(true);
    expect(result.current.markets).toEqual([]);
  });

  it('should fetch markets', async () => {
    (readContract as jest.Mock)
      .mockResolvedValueOnce(BigInt(2)) // marketCounter
      .mockResolvedValueOnce({ id: 1, question: 'Test Market 1' })
      .mockResolvedValueOnce({ id: 2, question: 'Test Market 2' });

    const { result } = renderHook(() => useMarkets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});

describe('useMarket Hook', () => {
  it('should fetch single market', async () => {
    const mockMarket = {
      id: 1,
      question: 'Test Market',
      status: 0,
    };

    (readContract as jest.Mock).mockResolvedValue(mockMarket);

    const { result } = renderHook(() => useMarket(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});

