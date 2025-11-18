import { useState, useEffect, useMemo } from 'react';
import { useReadContract } from 'thirdweb/react';
import { defineChain } from 'thirdweb/chains';
import { getContract } from 'thirdweb';
import AIOracleABI from '@/lib/contracts/abi/AIOracle.json';
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

export interface OracleResult {
  resolved: boolean;
  yesVotes: number;
  noVotes: number;
  invalidVotes: number;
  confidence: number;
  timestamp: bigint;
}

export function useOracle(marketId: number) {
  const contract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.AI_ORACLE,
      abi: AIOracleABI as any,
    });
  }, []);

  const { data: oracleResult, isLoading } = useReadContract({
    contract,
    method: 'getResult',
    params: [BigInt(marketId)],
    queryOptions: { enabled: marketId > 0 },
  });

  const [result, setResult] = useState<OracleResult | null>(null);

  useEffect(() => {
    if (oracleResult && Array.isArray(oracleResult)) {
      setResult({
        resolved: oracleResult[0] as boolean,
        yesVotes: Number(oracleResult[1]),
        noVotes: Number(oracleResult[2]),
        invalidVotes: Number(oracleResult[3]),
        confidence: Number(oracleResult[4]),
        timestamp: oracleResult[5] as bigint,
      });
    } else {
      setResult(null);
    }
  }, [oracleResult]);

  return { result, loading: isLoading };
}
