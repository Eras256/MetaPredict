import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { AIOracleABI } from '@/lib/contracts/abi/AIOracle.json';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';

export interface OracleResult {
  resolved: boolean;
  yesVotes: number;
  noVotes: number;
  invalidVotes: number;
  confidence: number;
  timestamp: bigint;
}

export function useOracle(marketId: number) {
  const [result, setResult] = useState<OracleResult | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: oracleResult } = useReadContract({
    address: CONTRACT_ADDRESSES.AI_ORACLE,
    abi: AIOracleABI,
    functionName: 'getResult',
    args: [BigInt(marketId)],
  });

  useEffect(() => {
    if (oracleResult) {
      setResult({
        resolved: oracleResult[0],
        yesVotes: Number(oracleResult[1]),
        noVotes: Number(oracleResult[2]),
        invalidVotes: Number(oracleResult[3]),
        confidence: Number(oracleResult[4]),
        timestamp: oracleResult[5],
      });
      setLoading(false);
    }
  }, [oracleResult]);

  return { result, loading };
}

