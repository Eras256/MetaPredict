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

  // Solo habilitar la query si marketQuestion tiene al menos 3 caracteres y amount es válido
  const isValidQuery = Boolean(
    marketQuestion.trim().length >= 3 && 
    amount && 
    parseFloat(amount) > 0 && 
    contract
  );

  // Convertir amount a BigInt (BNB tiene 18 decimales, convertir a wei)
  const amountBigInt = useMemo(() => {
    if (!amount) return BigInt(0);
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return BigInt(0);
    return BigInt(Math.floor(amountNum * 1e18));
  }, [amount]);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'findBestPrice',
    params: [marketQuestion, isYes, amountBigInt],
    queryOptions: { enabled: isValidQuery },
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

// Mapeo de Chain IDs a nombres legibles
const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  5: 'Ethereum Goerli',
  56: 'BSC Mainnet',
  97: 'BSC Testnet',
  137: 'Polygon Mainnet',
  80001: 'Polygon Mumbai',
  204: 'opBNB Mainnet',
  5611: 'opBNB Testnet',
  42161: 'Arbitrum One',
  421614: 'Arbitrum Sepolia',
  10: 'Optimism',
  11155111: 'Sepolia',
  // Cadenas soportadas por MetaPredict
  // 5611: 'opBNB Testnet' - ✅ Configurada
  // 97: 'BSC Testnet' - ⏳ Pendiente despliegue
  // 56: 'BSC Mainnet' - ⏳ Pendiente despliegue
  // 204: 'opBNB Mainnet' - ⏳ Pendiente despliegue
};

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

  const { data: chainIds, isLoading } = useReadContract({
    contract: contract!,
    method: 'getSupportedChains',
    params: [],
    queryOptions: { enabled: !!contract },
  });

  // Obtener información detallada de cada cadena
  const chainsWithDetails = useMemo(() => {
    if (!chainIds || !Array.isArray(chainIds) || chainIds.length === 0) return [];
    
    return chainIds.map((chainId: bigint) => {
      const id = Number(chainId);
      return {
        chainId: id,
        name: CHAIN_NAMES[id] || `Chain ${id}`,
        isKnown: id in CHAIN_NAMES,
      };
    });
  }, [chainIds]);

  return {
    chains: chainIds || [],
    chainsWithDetails,
    isLoading,
  };
}
