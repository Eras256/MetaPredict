'use client';

import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/config/constants';

// ABI placeholder
const OmniRouterABI = [
  {
    name: 'findBestPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_marketQuestion', type: 'string' },
      { name: '_isYes', type: 'bool' },
      { name: '_amount', type: 'uint256' },
    ],
    outputs: [
      { name: 'bestChainId', type: 'uint256' },
      { name: 'bestPrice', type: 'uint256' },
      { name: 'estimatedShares', type: 'uint256' },
      { name: 'gasCost', type: 'uint256' },
    ],
  },
  {
    name: 'getMarketPrices',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketQuestion', type: 'string' }],
    outputs: [
      { name: 'chainIds', type: 'uint256[]' },
      { name: 'yesPrices', type: 'uint256[]' },
      { name: 'noPrices', type: 'uint256[]' },
      { name: 'liquidities', type: 'uint256[]' },
    ],
  },
  {
    name: 'getSupportedChains',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
] as const;

export function usePriceComparison(marketQuestion: string, isYes: boolean, amount: string) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACTS.CROSS_CHAIN_ROUTER as `0x${string}`,
    abi: OmniRouterABI,
    functionName: 'findBestPrice',
    args: [marketQuestion, isYes, BigInt(amount || '0')],
    query: { enabled: !!marketQuestion && !!amount },
  });

  const result = data as any;

  return {
    bestChainId: result?.[0] ? Number(result[0]) : null,
    bestPrice: result?.[1] ? Number(result[1]) : null,
    estimatedShares: result?.[2] ? Number(result[2]) : null,
    gasCost: result?.[3] ? Number(result[3]) : null,
    isLoading,
    error,
  };
}

export function useMarketPrices(marketQuestion: string) {
  const { data, isLoading } = useReadContract({
    address: CONTRACTS.CROSS_CHAIN_ROUTER as `0x${string}`,
    abi: OmniRouterABI,
    functionName: 'getMarketPrices',
    args: [marketQuestion],
    query: { enabled: !!marketQuestion },
  });

  const result = data as any;

  return {
    chainIds: result?.[0] || [],
    yesPrices: result?.[1] || [],
    noPrices: result?.[2] || [],
    liquidities: result?.[3] || [],
    isLoading,
  };
}

export function useSupportedChains() {
  const { data, isLoading } = useReadContract({
    address: CONTRACTS.CROSS_CHAIN_ROUTER as `0x${string}`,
    abi: OmniRouterABI,
    functionName: 'getSupportedChains',
    args: [],
  });

  return {
    chains: (data as any) || [],
    isLoading,
  };
}

