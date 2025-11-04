import { useState, useEffect } from 'react';
import { useContract, useContractRead } from 'thirdweb/react';
import { readContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { PREDICTION_MARKET_ADDRESS } from '@/lib/contracts/addresses';
import { PREDICTION_MARKET_ABI } from '@/lib/contracts/abi/PredictionMarket.json';
import { client } from '@/lib/config/thirdweb';

// ✅ FIX #7: Configurar opBNB testnet para Thirdweb
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

export interface Market {
  id: number;
  question: string;
  description: string;
  creator: string;
  createdAt: number;
  resolutionTime: number;
  totalYesShares: bigint;
  totalNoShares: bigint;
  yesPool: bigint;
  noPool: bigint;
  insuranceReserve: bigint;
  status: number; // 0=Active, 1=Resolving, 2=Resolved, 3=Disputed, 4=Cancelled
  outcome: number; // 0=Pending, 1=Yes, 2=No, 3=Invalid
  metadata: string;
  pythPriceId: bigint;
}

// ✅ FIX #7: Usar Thirdweb useContract en lugar de wagmi directo
export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  const { contract } = useContract({
    client,
    chain: opBNBTestnet,
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
  });

  const { data: marketCounter, isLoading: counterLoading } = useContractRead({
    contract,
    method: 'marketCounter',
    params: [],
  });

  useEffect(() => {
    if (marketCounter && !counterLoading && contract) {
      const fetchMarkets = async () => {
        setLoading(true);
        const marketPromises = [];
        const count = Number(marketCounter);
        
        for (let i = 1; i <= count; i++) {
          // ✅ FIX #7: Usar readContract directamente en lugar de hooks
          marketPromises.push(
            readContract({
              contract,
              method: 'getMarket',
              params: [BigInt(i)],
            }).then((result: any) => {
              if (result) {
                return result;
              }
              return null;
            }).catch(() => null)
          );
        }
        
        const results = await Promise.all(marketPromises);
        setMarkets(results.filter((m: any) => m !== null));
        setLoading(false);
      };
      
      fetchMarkets();
    }
  }, [marketCounter, counterLoading, contract]);

  return { markets, loading };
}

export function useMarket(marketId: number) {
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);

  const { contract } = useContract({
    client,
    chain: opBNBTestnet,
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
  });

  const { data: marketData, isLoading } = useContractRead({
    contract,
    method: 'getMarket',
    params: [BigInt(marketId)],
  });

  useEffect(() => {
    if (marketData) {
      setMarket(marketData as Market);
      setLoading(false);
    }
  }, [marketData, isLoading]);

  return { market, loading };
}
