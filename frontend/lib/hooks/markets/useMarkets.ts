'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { CONTRACTS } from '@/lib/config/constants';

// ABI placeholder - should import from actual ABI files
const PredictionMarketCoreABI = [
  {
    name: 'marketCounter',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getMarket',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'marketType', type: 'uint8' },
      { name: 'creator', type: 'address' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'resolutionTime', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'metadata', type: 'string' },
    ],
  },
  {
    name: 'getMarketContract',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

const BinaryMarketABI = [
  {
    name: 'getMarket',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [
      { name: 'question', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'resolutionTime', type: 'uint256' },
      { name: 'totalYesShares', type: 'uint256' },
      { name: 'totalNoShares', type: 'uint256' },
      { name: 'yesPool', type: 'uint256' },
      { name: 'noPool', type: 'uint256' },
      { name: 'resolved', type: 'bool' },
      { name: 'outcome', type: 'uint8' },
    ],
  },
  {
    name: 'getCurrentOdds',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [
      { name: 'yesOdds', type: 'uint256' },
      { name: 'noOdds', type: 'uint256' },
    ],
  },
] as const;

export function useMarkets() {
  const { data: marketCounter } = useReadContract({
    address: CONTRACTS.PREDICTION_MARKET_CORE as `0x${string}`,
    abi: PredictionMarketCoreABI,
    functionName: 'marketCounter',
  });

  const marketIds = marketCounter ? Array.from({ length: Number(marketCounter) }, (_, i) => i + 1) : [];

  const { data: marketsData, isLoading, error } = useReadContracts({
    contracts: marketIds.map(id => ({
      address: CONTRACTS.PREDICTION_MARKET_CORE as `0x${string}`,
      abi: PredictionMarketCoreABI,
      functionName: 'getMarket',
      args: [BigInt(id)],
    })),
  });

  const markets = marketsData?.map((result, index) => {
    if (result.status === 'success' && result.result) {
      const market = result.result as any;
      return {
        id: marketIds[index],
        marketType: Number(market.marketType),
        creator: market.creator,
        createdAt: Number(market.createdAt),
        resolutionTime: Number(market.resolutionTime),
        status: Number(market.status),
        metadata: market.metadata,
      };
    }
    return null;
  }).filter(Boolean);

  return { markets: markets || [], isLoading, error };
}

export function useMarketDetails(marketId: number) {
  const { data: marketInfo } = useReadContract({
    address: CONTRACTS.PREDICTION_MARKET_CORE as `0x${string}`,
    abi: PredictionMarketCoreABI,
    functionName: 'getMarket',
    args: [BigInt(marketId)],
  });

  const { data: marketContract } = useReadContract({
    address: CONTRACTS.PREDICTION_MARKET_CORE as `0x${string}`,
    abi: PredictionMarketCoreABI,
    functionName: 'getMarketContract',
    args: [BigInt(marketId)],
  });

  const { data: marketData } = useReadContract({
    address: marketContract as `0x${string}`,
    abi: BinaryMarketABI,
    functionName: 'getMarket',
    args: [BigInt(marketId)],
    query: { enabled: !!marketContract },
  });

  const { data: odds } = useReadContract({
    address: marketContract as `0x${string}`,
    abi: BinaryMarketABI,
    functionName: 'getCurrentOdds',
    args: [BigInt(marketId)],
    query: { enabled: !!marketContract },
  });

  return {
    marketInfo: marketInfo as any,
    marketData: marketData as any,
    odds: odds as any,
    isLoading: !marketInfo || !marketData,
  };
}

