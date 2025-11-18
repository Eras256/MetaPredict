import { renderHook } from '@testing-library/react';
import { useOracle } from '@/lib/hooks/useOracle';
import { useReadContract } from 'thirdweb/react';

// Mock thirdweb
jest.mock('thirdweb/react', () => ({
  useReadContract: jest.fn(),
}));

// Mock thirdweb client
jest.mock('@/lib/config/thirdweb', () => ({
  client: {},
}));

describe('useOracle Hook', () => {
  it('should return oracle result', () => {
    const mockResult = [
      true, // resolved
      BigInt(10), // yesVotes
      BigInt(5), // noVotes
      BigInt(0), // invalidVotes
      BigInt(85), // confidence
      BigInt(Date.now()), // timestamp
    ];

    (useReadContract as jest.Mock).mockReturnValue({
      data: mockResult,
      isLoading: false,
    });

    const { result } = renderHook(() => useOracle(1));

    expect(result.current).toHaveProperty('result');
    expect(result.current).toHaveProperty('loading');
    expect(result.current.loading).toBe(false);
  });

  it('should handle loading state', () => {
    (useReadContract as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    const { result } = renderHook(() => useOracle(1));

    expect(result.current.loading).toBe(true);
  });
});

