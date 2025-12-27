'use client';

import { useMemo } from 'react';
import { useReadContract } from 'thirdweb/react';
import { defineChain } from 'thirdweb/chains';
import { getContract } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import { client } from '@/lib/config/thirdweb';
import BINARY_MARKET_ABI from '@/lib/contracts/abi/BinaryMarket.json';
import CONDITIONAL_MARKET_ABI from '@/lib/contracts/abi/ConditionalMarket.json';
import PREDICTION_MARKET_CORE_ABI from '@/lib/contracts/abi/PredictionMarketCore.json';

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

/**
 * Hook to get current odds for a BinaryMarket
 */
export function useCurrentOdds(marketId: number) {
  // CONTRACT_ADDRESSES siempre tiene valores por defecto, así que coreContract siempre existe
  const coreContract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET || CONTRACT_ADDRESSES.CORE_CONTRACT,
      abi: PREDICTION_MARKET_CORE_ABI as any,
    });
  }, []);

  // Get market contract address
  const { data: contractAddress } = useReadContract({
    contract: coreContract,
    method: 'getMarketContract',
    params: [BigInt(marketId)],
    queryOptions: {
      enabled: marketId > 0,
      refetchInterval: 60000,
    },
  });

  const marketContract = useMemo(() => {
    // Si no hay contractAddress o es la dirección cero, crear un contrato con dirección cero
    // que no se usará (la query estará deshabilitada)
    const address = contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000'
      ? (contractAddress as `0x${string}`)
      : '0x0000000000000000000000000000000000000000' as `0x${string}`;
    
    return getContract({
      client,
      chain: opBNBTestnet,
      address,
      abi: BINARY_MARKET_ABI as any,
    });
  }, [contractAddress]);

  const hasValidMarketContract = contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000';

  const { data, isLoading } = useReadContract({
    contract: marketContract,
    method: 'getCurrentOdds',
    params: [BigInt(marketId)],
    queryOptions: {
      enabled: hasValidMarketContract && marketId > 0,
      refetchInterval: 60000, // Refetch every 60 seconds
    },
  }) as { data: any; isLoading: boolean };

  const result = data as any;

  return {
    yesOdds: result?.[0] ? Number(result[0]) / 100 : 50, // Convert from basis points (10000 = 100%)
    noOdds: result?.[1] ? Number(result[1]) / 100 : 50,
    isLoading,
  };
}

/**
 * Hook to get child markets for a ConditionalMarket parent
 */
export function useChildMarkets(parentMarketId: number) {
  // CONTRACT_ADDRESSES siempre tiene valores por defecto, así que coreContract siempre existe
  const coreContract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET || CONTRACT_ADDRESSES.CORE_CONTRACT,
      abi: PREDICTION_MARKET_CORE_ABI as any,
    });
  }, []);

  // Get market contract address
  const { data: marketContractAddress } = useReadContract({
    contract: coreContract,
    method: 'getMarketContract',
    params: [BigInt(parentMarketId)],
    queryOptions: {
      enabled: parentMarketId > 0,
    },
  });

  const conditionalMarketContract = useMemo(() => {
    // Si no hay marketContractAddress o es la dirección cero, crear un contrato con dirección cero
    // que no se usará (la query estará deshabilitada)
    const address = marketContractAddress && marketContractAddress !== '0x0000000000000000000000000000000000000000'
      ? (marketContractAddress as `0x${string}`)
      : '0x0000000000000000000000000000000000000000' as `0x${string}`;
    
    return getContract({
      client,
      chain: opBNBTestnet,
      address,
      abi: CONDITIONAL_MARKET_ABI as any,
    });
  }, [marketContractAddress]);

  const hasValidConditionalContract = marketContractAddress && marketContractAddress !== '0x0000000000000000000000000000000000000000';

  const { data, isLoading } = useReadContract({
    contract: conditionalMarketContract,
    method: 'getChildMarkets',
    params: [BigInt(parentMarketId)],
    queryOptions: {
      enabled: hasValidConditionalContract && parentMarketId > 0,
    },
  }) as { data: any; isLoading: boolean };

  const childMarketIds = data as bigint[] | undefined;

  return {
    childMarketIds: childMarketIds ? childMarketIds.map(id => Number(id)) : [],
    isLoading,
  };
}

