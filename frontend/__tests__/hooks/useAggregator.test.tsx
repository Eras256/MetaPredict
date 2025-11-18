import { renderHook } from '@testing-library/react';
import {
  usePriceComparison,
  useMarketPrices,
  useSupportedChains,
} from '@/lib/hooks/aggregator/useAggregator';
import { useReadContract } from 'thirdweb/react';

// Mock thirdweb
jest.mock('thirdweb/react', () => ({
  useReadContract: jest.fn(),
}));

// Mock thirdweb client
jest.mock('@/lib/config/thirdweb', () => ({
  client: {},
}));

describe('usePriceComparison Hook', () => {
  it('should return price comparison', () => {
    const mockResult = [
      BigInt(5611), // bestChainId
      BigInt('520000000000000000'), // bestPrice (0.52)
      BigInt('1000000000000000000'), // estimatedShares
      BigInt('500000000000000'), // gasCost
    ];

    (useReadContract as jest.Mock).mockReturnValue({
      data: mockResult,
      isLoading: false,
    });

    const { result } = renderHook(() =>
      usePriceComparison('Will BTC reach $100K?', true, '1000000000000000000')
    );

    expect(result.current).toHaveProperty('bestChainId');
    expect(result.current).toHaveProperty('bestPrice');
    expect(result.current).toHaveProperty('isLoading');
  });
});

describe('useMarketPrices Hook', () => {
  it('should return market prices', () => {
    const mockResult = [
      [BigInt(5611), BigInt(204)], // chainIds
      [BigInt('520000000000000000'), BigInt('510000000000000000')], // yesPrices
      [BigInt('480000000000000000'), BigInt('490000000000000000')], // noPrices
      [BigInt('10000000000000000000'), BigInt('20000000000000000000')], // liquidities
    ];

    (useReadContract as jest.Mock).mockReturnValue({
      data: mockResult,
      isLoading: false,
    });

    const { result } = renderHook(() => useMarketPrices('Will BTC reach $100K?'));

    expect(result.current).toHaveProperty('chainIds');
    expect(result.current).toHaveProperty('yesPrices');
    expect(result.current).toHaveProperty('noPrices');
  });
});

describe('useSupportedChains Hook', () => {
  it('should return supported chains', () => {
    const mockChains = [BigInt(5611), BigInt(204), BigInt(8453)];

    (useReadContract as jest.Mock).mockReturnValue({
      data: mockChains,
      isLoading: false,
    });

    const { result } = renderHook(() => useSupportedChains());

    expect(result.current).toHaveProperty('chains');
    expect(result.current).toHaveProperty('isLoading');
  });
});

