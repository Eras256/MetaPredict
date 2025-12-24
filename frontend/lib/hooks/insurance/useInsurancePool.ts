'use client';

import { useState, useEffect, useMemo } from 'react';
import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { readContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { getContract } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import InsurancePoolABI from '@/lib/contracts/abi/InsurancePool.json';
import { client } from '@/lib/config/thirdweb';

// Extended ABI for additional view functions
const InsurancePoolExtendedABI = [
  ...InsurancePoolABI,
  {
    name: 'totalShares',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as any;

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

export interface InsurancePoolStats {
  totalAssets: bigint;
  totalInsured: bigint;
  totalClaimed: bigint;
  available: bigint;
  utilizationRate: bigint; // basis points (0-10000)
  yieldAPY: bigint; // basis points (0-10000)
}

export interface UserDeposit {
  amount: bigint;
  shares: bigint;
  depositedAt: bigint;
  lastYieldClaim: bigint;
}

export function useInsurancePool() {
  const account = useActiveAccount();
  const [stats, setStats] = useState<InsurancePoolStats | null>(null);
  const [userDeposit, setUserDeposit] = useState<UserDeposit | null>(null);
  const [pendingYield, setPendingYield] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(true);
  const [apy, setApy] = useState<number | null>(null);

  const contract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.INSURANCE_POOL,
      abi: InsurancePoolABI as any,
    });
  }, []);

  // Obtener estadísticas del pool
  const fetchPoolStats = async () => {
    if (!contract) return;

    try {
      const result = await readContract({
        contract,
        method: 'getPoolHealth',
        params: [],
      }) as any;

      if (result && result.length >= 6) {
        setStats({
          totalAssets: BigInt(result[0] || 0),
          totalInsured: BigInt(result[1] || 0),
          totalClaimed: BigInt(result[2] || 0),
          available: BigInt(result[3] || 0),
          utilizationRate: BigInt(result[4] || 0),
          yieldAPY: BigInt(result[5] || 0),
        });
      }
    } catch (error) {
      console.error('Error fetching pool stats:', error);
    }
  };

  // Obtener depósito del usuario
  const fetchUserDeposit = async () => {
    if (!contract || !account) {
      setUserDeposit(null);
      return;
    }

    try {
      const result = await readContract({
        contract,
        method: 'getUserDeposit',
        params: [account.address],
      }) as any;

      if (result) {
        setUserDeposit({
          amount: BigInt(result.amount || 0),
          shares: BigInt(result.shares || 0),
          depositedAt: BigInt(result.depositedAt || 0),
          lastYieldClaim: BigInt(result.lastYieldClaim || 0),
        });
      }
    } catch (error) {
      console.error('Error fetching user deposit:', error);
      setUserDeposit(null);
    }
  };

  // Obtener yield pendiente del usuario
  const fetchPendingYield = async () => {
    if (!contract || !account) {
      setPendingYield(BigInt(0));
      return;
    }

    try {
      const result = await readContract({
        contract,
        method: 'getPendingYield',
        params: [account.address],
      }) as any;

      setPendingYield(BigInt(result || 0));
    } catch (error) {
      console.error('Error fetching pending yield:', error);
      setPendingYield(BigInt(0));
    }
  };

  // Obtener APY del servicio Venus (fallback si el contrato no tiene yield)
  const fetchAPY = async () => {
    try {
      const response = await fetch('/api/venus/insurance-pool/apy');
      if (response.ok) {
        const data = await response.json();
        if (data.currentAPY !== undefined) {
          setApy(data.currentAPY);
        }
      }
    } catch (error) {
      console.error('Error fetching APY from Venus:', error);
    }
  };

  useEffect(() => {
    if (contract) {
      setLoading(true);
      Promise.all([
        fetchPoolStats(),
        fetchAPY(),
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [contract]);

  useEffect(() => {
    if (contract && account) {
      fetchUserDeposit();
      fetchPendingYield();
    } else {
      setUserDeposit(null);
      setPendingYield(BigInt(0));
    }
  }, [contract, account]);

  // Función para refrescar todos los datos
  const refresh = async () => {
    setLoading(true);
    await Promise.all([
      fetchPoolStats(),
      fetchUserDeposit(),
      fetchPendingYield(),
      fetchAPY(),
    ]);
    setLoading(false);
  };

  // Calcular APY final (prioridad: contrato > Venus)
  const finalAPY = useMemo(() => {
    if (stats && stats.yieldAPY > BigInt(0)) {
      return Number(stats.yieldAPY) / 100; // Convertir de basis points a porcentaje
    }
    return apy || 0;
  }, [stats, apy]);

  return {
    stats,
    userDeposit,
    pendingYield,
    apy: finalAPY,
    loading,
    refresh,
  };
}

export function useInsurancePoolDetails() {
  const contract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.INSURANCE_POOL,
      abi: InsurancePoolExtendedABI,
    });
  }, []);

  const { data: totalShares } = useReadContract({
    contract: contract!,
    method: 'totalShares',
    params: [],
    queryOptions: { enabled: !!contract },
  });

  const { data: totalAssets } = useReadContract({
    contract: contract!,
    method: 'totalAssets',
    params: [],
    queryOptions: { enabled: !!contract },
  });

  return {
    totalShares: totalShares ? Number(totalShares) / 1e18 : 0,
    totalAssets: totalAssets ? Number(totalAssets) / 1e18 : 0,
    sharePrice: totalShares && totalAssets && Number(totalShares) > 0
      ? Number(totalAssets) / Number(totalShares)
      : 1,
  };
}

