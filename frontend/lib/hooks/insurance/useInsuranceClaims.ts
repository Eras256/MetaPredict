'use client';

import { useState, useEffect, useMemo } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { readContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { getContract } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import InsurancePoolABI from '@/lib/contracts/abi/InsurancePool.json';
import PREDICTION_MARKET_CORE_ABI from '@/lib/contracts/abi/PredictionMarketCore.json';
import BINARY_MARKET_ABI from '@/lib/contracts/abi/BinaryMarket.json';
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

export interface InsuranceClaim {
  id: number;
  marketId: number;
  question: string;
  amount: bigint; // BNB invertido
  status: 'pending' | 'claimed';
  reason: string;
  invested: bigint; // BNB invertido (mismo que amount)
  policyActivated: boolean;
  policyReserve: bigint;
  policyClaimed: bigint;
  expiresAt: bigint;
  expired: boolean;
}

export function useInsuranceClaims() {
  const account = useActiveAccount();
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const coreContract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
      abi: PREDICTION_MARKET_CORE_ABI as any,
    });
  }, []);

  const insurancePoolContract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.INSURANCE_POOL,
      abi: InsurancePoolABI as any,
    });
  }, []);

  const fetchClaims = async () => {
    if (!account || !coreContract || !insurancePoolContract) {
      setClaims([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Obtener el contador de mercados
      const marketCounter = await readContract({
        contract: coreContract,
        method: 'marketCounter',
        params: [],
      }) as bigint;

      const count = Number(marketCounter);
      if (count === 0) {
        setClaims([]);
        setLoading(false);
        return;
      }

      const claimPromises = [];

      // Iterar sobre todos los mercados
      for (let i = 1; i <= count; i++) {
        claimPromises.push(
          (async () => {
            try {
              // Obtener información del mercado desde el Core
              const marketInfo = await readContract({
                contract: coreContract,
                method: 'getMarket',
                params: [BigInt(i)],
              }) as any;

              // Solo procesar mercados en estado Disputed (status = 3)
              const status = Number(marketInfo.status || 0);
              if (status !== 3) {
                return null; // No es un mercado disputado
              }

              // Obtener el contrato del mercado específico
              const marketContractAddress = await readContract({
                contract: coreContract,
                method: 'getMarketContract',
                params: [BigInt(i)],
              }) as `0x${string}`;

              const marketContract = getContract({
                client,
                chain: opBNBTestnet,
                address: marketContractAddress,
                abi: BINARY_MARKET_ABI as any,
              });

              // Obtener posición del usuario en este mercado
              const position = await readContract({
                contract: marketContract,
                method: 'getPosition',
                params: [BigInt(i), account.address],
              }) as any;

              // Si el usuario no tiene posición o ya reclamó, saltar
              if (!position || position.claimed) {
                return null;
              }

              // Calcular inversión total
              const yesShares = BigInt(position.yesShares || 0);
              const noShares = BigInt(position.noShares || 0);
              const avgYesPrice = BigInt(position.avgYesPrice || 0);
              const avgNoPrice = BigInt(position.avgNoPrice || 0);
              const divisor = BigInt(1000000000000000000); // 1e18

              const yesInvested = (yesShares * avgYesPrice) / divisor;
              const noInvested = (noShares * avgNoPrice) / divisor;
              const totalInvested = yesInvested + noInvested;

              // Si no hay inversión, saltar
              if (totalInvested === BigInt(0)) {
                return null;
              }

              // Obtener datos del mercado
              const marketData = await readContract({
                contract: marketContract,
                method: 'getMarket',
                params: [BigInt(i)],
              }) as any;

              // Verificar si el usuario ya reclamó el seguro
              const hasClaimedInsurance = await readContract({
                contract: insurancePoolContract,
                method: 'hasClaimed',
                params: [BigInt(i), account.address],
              }) as boolean;

              // Obtener estado de la póliza de seguro
              let policyStatus = null;
              try {
                policyStatus = await readContract({
                  contract: insurancePoolContract,
                  method: 'getPolicyStatus',
                  params: [BigInt(i)],
                }) as any;
              } catch (error) {
                console.warn(`Error obteniendo policy status para market ${i}:`, error);
              }

              const question = marketData?.question || marketInfo.metadata || `Market ${i}`;

              return {
                id: i,
                marketId: i,
                question,
                amount: totalInvested,
                status: hasClaimedInsurance ? ('claimed' as const) : ('pending' as const),
                reason: 'Oracle confidence below threshold or dispute filed',
                invested: totalInvested,
                policyActivated: policyStatus ? policyStatus[0] : false,
                policyReserve: policyStatus ? BigInt(policyStatus[1] || 0) : BigInt(0),
                policyClaimed: policyStatus ? BigInt(policyStatus[2] || 0) : BigInt(0),
                expiresAt: policyStatus ? BigInt(policyStatus[3] || 0) : BigInt(0),
                expired: policyStatus ? policyStatus[4] : false,
              } as InsuranceClaim;
            } catch (error) {
              console.error(`Error procesando market ${i} para claims:`, error);
              return null;
            }
          })()
        );
      }

      const results = await Promise.all(claimPromises);
      const validClaims = results.filter((c): c is InsuranceClaim => c !== null);

      // Filter only pending claims (not yet claimed)
      const pendingClaims = validClaims.filter(c => c.status === 'pending');

      setClaims(pendingClaims);
    } catch (error) {
      console.error('Error fetching insurance claims:', error);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account && coreContract && insurancePoolContract) {
      fetchClaims();
      
      // Note: Auto-refresh is now controlled by AutoRefreshBanner component in pages
      // This ensures refresh only happens at the specified intervals
    } else {
      setClaims([]);
      setLoading(false);
    }
  }, [account, coreContract, insurancePoolContract]);

  return {
    claims,
    loading,
    refresh: fetchClaims,
  };
}

