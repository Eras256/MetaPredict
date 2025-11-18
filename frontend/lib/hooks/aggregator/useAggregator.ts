'use client';

import { useMemo } from 'react';
import { useReadContract } from 'thirdweb/react';
import { defineChain } from 'thirdweb/chains';
import { getContract } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import { client } from '@/lib/config/thirdweb';

const opBNBTestnet = defineChain({
  id: 5611,
  name: 'opBNB Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpc: 'https://opbnb-testnet-rpc.bnbchain.org',
});

// ABI simplificado
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
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.OMNI_ROUTER) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.OMNI_ROUTER,
      abi: OmniRouterABI as any,
    });
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'findBestPrice',
    params: [marketQuestion, isYes, BigInt(amount || '0')],
    queryOptions: { enabled: !!marketQuestion && !!amount && !!contract },
  });

  const result = data as any;

  return {
    bestChainId: result?.[0] ? Number(result[0]) : null,
    bestPrice: result?.[1] ? Number(result[1]) : null,
    estimatedShares: result?.[2] ? Number(result[2]) : null,
    gasCost: result?.[3] ? Number(result[3]) : null,
    isLoading,
  };
}

export function useMarketPrices(marketQuestion: string) {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.OMNI_ROUTER) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.OMNI_ROUTER,
      abi: OmniRouterABI as any,
    });
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'getMarketPrices',
    params: [marketQuestion],
    queryOptions: { enabled: !!marketQuestion && !!contract },
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
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.OMNI_ROUTER) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.OMNI_ROUTER,
      abi: OmniRouterABI as any,
    });
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'getSupportedChains',
    params: [],
    queryOptions: { enabled: !!contract },
  });

  return {
    chains: (data as any) || [],
    isLoading,
  };
}
