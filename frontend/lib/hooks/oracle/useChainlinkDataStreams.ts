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

const ChainlinkDataStreamsABI = [
  {
    name: 'getLastVerifiedPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [
      { name: 'price', type: 'int256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'isStale', type: 'bool' },
    ],
  },
  {
    name: 'checkPriceCondition',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [
      { name: 'conditionMet', type: 'bool' },
      { name: 'currentPrice', type: 'int256' },
      { name: 'targetPrice', type: 'int256' },
    ],
  },
  {
    name: 'validateMarketPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_marketId', type: 'uint256' },
      { name: '_predictedPrice', type: 'int256' },
    ],
    outputs: [
      { name: 'isValid', type: 'bool' },
      { name: 'actualPrice', type: 'int256' },
      { name: 'difference', type: 'int256' },
    ],
  },
  {
    name: 'marketStreamId',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'marketTargetPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [{ name: '', type: 'int256' }],
  },
] as const;

export function useLastVerifiedPrice(marketId: number) {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION,
      abi: ChainlinkDataStreamsABI as any,
    });
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'getLastVerifiedPrice',
    params: [BigInt(marketId)],
    queryOptions: { enabled: marketId > 0 && !!contract },
  });

  const result = data as any;

  return {
    price: result?.[0] ? Number(result[0]) / 1e8 : null, // Chainlink prices are typically 8 decimals
    timestamp: result?.[1] ? Number(result[1]) : null,
    isStale: result?.[2] || false,
    isLoading,
  };
}

export function usePriceCondition(marketId: number) {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION,
      abi: ChainlinkDataStreamsABI as any,
    });
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'checkPriceCondition',
    params: [BigInt(marketId)],
    queryOptions: { enabled: marketId > 0 && !!contract },
  });

  const result = data as any;

  return {
    conditionMet: result?.[0] || false,
    currentPrice: result?.[1] ? Number(result[1]) / 1e8 : null,
    targetPrice: result?.[2] ? Number(result[2]) / 1e8 : null,
    isLoading,
  };
}

export function useValidateMarketPrice(marketId: number, predictedPrice: number) {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION,
      abi: ChainlinkDataStreamsABI as any,
    });
  }, []);

  const predictedPriceBigInt = useMemo(() => {
    return BigInt(Math.floor(predictedPrice * 1e8));
  }, [predictedPrice]);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'validateMarketPrice',
    params: [BigInt(marketId), predictedPriceBigInt],
    queryOptions: { enabled: marketId > 0 && predictedPrice > 0 && !!contract },
  });

  const result = data as any;

  return {
    isValid: result?.[0] || false,
    actualPrice: result?.[1] ? Number(result[1]) / 1e8 : null,
    difference: result?.[2] ? Number(result[2]) / 1e8 : null,
    isLoading,
  };
}

export function useMarketStreamConfig(marketId: number) {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION,
      abi: ChainlinkDataStreamsABI as any,
    });
  }, []);

  const { data: streamId } = useReadContract({
    contract: contract!,
    method: 'marketStreamId',
    params: [BigInt(marketId)],
    queryOptions: { enabled: marketId > 0 && !!contract },
  });

  const { data: targetPrice } = useReadContract({
    contract: contract!,
    method: 'marketTargetPrice',
    params: [BigInt(marketId)],
    queryOptions: { enabled: marketId > 0 && !!contract },
  });

  return {
    streamId: streamId as string | null,
    targetPrice: targetPrice ? Number(targetPrice) / 1e8 : null,
  };
}

