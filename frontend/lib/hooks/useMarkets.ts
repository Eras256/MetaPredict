import { useState, useEffect, useMemo } from 'react';
import { readContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { getContract } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import PREDICTION_MARKET_ABI from '@/lib/contracts/abi/PredictionMarket.json';
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

// ✅ FIX #7: Usar Thirdweb v5 API
export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketCounter, setMarketCounter] = useState<bigint | null>(null);

  const contract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET as `0x${string}`,
      abi: PREDICTION_MARKET_ABI as any,
    });
  }, []);

  useEffect(() => {
    if (contract) {
      const fetchCounter = async () => {
        try {
          const counter = await readContract({
            contract,
            method: 'marketCounter',
            params: [],
          });
          setMarketCounter(counter as bigint);
        } catch (error) {
          console.error('Error fetching market counter:', error);
          setLoading(false);
        }
      };
      
      fetchCounter();
    }
  }, [contract]);

  useEffect(() => {
    if (marketCounter !== null && contract) {
      const fetchMarkets = async () => {
        setLoading(true);
        const marketPromises = [];
        const count = Number(marketCounter);
        
        for (let i = 1; i <= count; i++) {
          // ✅ FIX #7: Usar readContract directamente
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
  }, [marketCounter, contract]);

  return { markets, loading };
}

export function useMarket(marketId: number) {
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);

  const contract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET as `0x${string}`,
      abi: PREDICTION_MARKET_ABI as any,
    });
  }, []);

  useEffect(() => {
    if (contract) {
      const fetchMarket = async () => {
        try {
          setLoading(true);
          const marketData = await readContract({
            contract,
            method: 'getMarket',
            params: [BigInt(marketId)],
          });
          setMarket(marketData as Market);
        } catch (error) {
          console.error('Error fetching market:', error);
          setMarket(null);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMarket();
    }
  }, [contract, marketId]);

  return { market, loading };
}
