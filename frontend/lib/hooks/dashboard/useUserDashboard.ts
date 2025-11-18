'use client';

import { useState, useEffect, useMemo } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { readContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { getContract } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import PREDICTION_MARKET_CORE_ABI from '@/lib/contracts/abi/PredictionMarketCore.json';
import BINARY_MARKET_ABI from '@/lib/contracts/abi/BinaryMarket.json';
import { client } from '@/lib/config/thirdweb';
import { Market } from '@/lib/hooks/useMarkets';

// ABI extendido para PredictionMarketCore que incluye getUserMarkets
const PredictionMarketCoreExtendedABI = [
  ...PREDICTION_MARKET_CORE_ABI,
  {
    name: 'getUserMarkets',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_user', type: 'address' },
    ],
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
  },
] as const;

// ABI extendido para BinaryMarket que incluye getPosition
const BinaryMarketExtendedABI = [
  ...BINARY_MARKET_ABI,
  {
    name: 'getPosition',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_marketId', type: 'uint256' },
      { name: '_user', type: 'address' },
    ],
    outputs: [
      {
        components: [
          { name: 'yesShares', type: 'uint256' },
          { name: 'noShares', type: 'uint256' },
          { name: 'avgYesPrice', type: 'uint256' },
          { name: 'avgNoPrice', type: 'uint256' },
          { name: 'claimed', type: 'bool' },
        ],
        internalType: 'struct BinaryMarket.Position',
        name: '',
        type: 'tuple',
      },
    ],
  },
] as const;

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

export interface UserPosition {
  marketId: number;
  market: Market | null;
  yesShares: bigint;
  noShares: bigint;
  avgYesPrice: bigint;
  avgNoPrice: bigint;
  claimed: boolean;
  totalInvested: bigint; // yesShares * avgYesPrice + noShares * avgNoPrice
  potentialPayout: bigint; // Calculado basado en el outcome del mercado
}

export interface DashboardStats {
  totalMarketsCreated: number;
  totalBetsPlaced: number;
  totalInvested: number;
  totalPotentialWinnings: number;
  activePositions: number;
  resolvedPositions: number;
  claimedWinnings: number;
}

export function useUserDashboard() {
  const account = useActiveAccount();
  const [userMarkets, setUserMarkets] = useState<Market[]>([]);
  const [userPositions, setUserPositions] = useState<UserPosition[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalMarketsCreated: 0,
    totalBetsPlaced: 0,
    totalInvested: 0,
    totalPotentialWinnings: 0,
    activePositions: 0,
    resolvedPositions: 0,
    claimedWinnings: 0,
  });
  const [loading, setLoading] = useState(true);

  const coreContract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
      abi: PredictionMarketCoreExtendedABI as any,
    });
  }, []);

  // Obtener mercados creados por el usuario
  const fetchUserMarkets = async () => {
    if (!account || !coreContract) {
      setUserMarkets([]);
      return;
    }

    try {
      // Intentar obtener IDs de mercados del usuario
      let marketIds: bigint[] = [];
      try {
        const result = await readContract({
          contract: coreContract,
          method: 'getUserMarkets',
          params: [account.address],
        });
        
        if (Array.isArray(result)) {
          marketIds = result.filter((id: any) => {
            const num = typeof id === 'bigint' ? Number(id) : Number(id);
            return !isNaN(num) && num > 0 && num <= Number.MAX_SAFE_INTEGER;
          }) as bigint[];
        }
      } catch (error) {
        console.warn('getUserMarkets not available, will iterate all markets:', error);
        // Fallback: iterar sobre todos los mercados y filtrar por creator
        const marketCounter = await readContract({
          contract: coreContract,
          method: 'marketCounter',
          params: [],
        }) as bigint;
        
        const count = Number(marketCounter);
        if (count > 0) {
          // Iterar sobre todos los mercados y filtrar por creator
          const allMarketPromises = [];
          for (let i = 1; i <= count; i++) {
            allMarketPromises.push(
              readContract({
                contract: coreContract,
                method: 'getMarket',
                params: [BigInt(i)],
              }).then((marketInfo: any) => {
                if (marketInfo && marketInfo.creator?.toLowerCase() === account.address.toLowerCase()) {
                  return BigInt(i);
                }
                return null;
              }).catch(() => null)
            );
          }
          const results = await Promise.all(allMarketPromises);
          marketIds = results.filter((id): id is bigint => id !== null);
        }
      }

      if (!marketIds || marketIds.length === 0) {
        setUserMarkets([]);
        return;
      }

      // Obtener información de cada mercado
      const marketPromises = marketIds.map(async (marketId) => {
        try {
          // Convertir marketId a número y luego a BigInt de forma segura
          const marketIdNum = typeof marketId === 'bigint' ? Number(marketId) : Number(marketId);
          
          // Validar que sea un número válido
          if (isNaN(marketIdNum) || marketIdNum <= 0 || marketIdNum > Number.MAX_SAFE_INTEGER) {
            console.warn(`Invalid marketId: ${marketId}`);
            return null;
          }
          
          const marketIdBigInt = BigInt(marketIdNum);
          
          // Obtener info del Core
          const marketInfo = await readContract({
            contract: coreContract,
            method: 'getMarket',
            params: [marketIdBigInt],
          }) as any;

          if (!marketInfo || Number(marketInfo.id) === 0) {
            return null;
          }

          // Obtener contrato del mercado
          const marketContractAddress = await readContract({
            contract: coreContract,
            method: 'getMarketContract',
            params: [marketIdBigInt],
          });

              // Obtener datos del mercado específico
              const marketContract = getContract({
                client,
                chain: opBNBTestnet,
                address: marketContractAddress as `0x${string}`,
                abi: BinaryMarketExtendedABI as any,
              });

          const marketData = await readContract({
            contract: marketContract,
            method: 'getMarket',
            params: [marketIdBigInt],
          }) as any;

          return {
            id: marketIdNum,
            creator: marketInfo.creator,
            createdAt: Number(marketInfo.createdAt),
            resolutionTime: Number(marketInfo.resolutionTime),
            status: Number(marketInfo.status),
            metadata: marketInfo.metadata,
            question: marketData?.question || marketInfo.metadata || `Market ${marketId}`,
            description: marketData?.description || '',
            totalYesShares: marketData?.totalYesShares || BigInt(0),
            totalNoShares: marketData?.totalNoShares || BigInt(0),
            yesPool: marketData?.yesPool || BigInt(0),
            noPool: marketData?.noPool || BigInt(0),
            insuranceReserve: BigInt(0),
            outcome: marketData?.outcome || 0,
            pythPriceId: BigInt(0),
          } as Market;
        } catch (error) {
          console.error(`Error fetching market ${marketId}:`, error);
          return null;
        }
      });

      const markets = (await Promise.all(marketPromises)).filter((m) => m !== null) as Market[];
      setUserMarkets(markets);
    } catch (error) {
      console.error('Error fetching user markets:', error);
      setUserMarkets([]);
    }
  };

  // Obtener posiciones/apuestas del usuario
  const fetchUserPositions = async () => {
    if (!account || !coreContract) {
      setUserPositions([]);
      return;
    }

    try {
      // Obtener el marketCounter para iterar sobre todos los mercados
      const marketCounter = await readContract({
        contract: coreContract,
        method: 'marketCounter',
        params: [],
      }) as bigint;

      const count = Number(marketCounter);
      if (count === 0) {
        setUserPositions([]);
        return;
      }

      const positionPromises = [];
      
      for (let i = 1; i <= count; i++) {
        positionPromises.push(
          (async () => {
            try {
              // Obtener info del mercado del Core
              const marketInfo = await readContract({
                contract: coreContract,
                method: 'getMarket',
                params: [BigInt(i)],
              }) as any;

              if (!marketInfo || Number(marketInfo.id) === 0) {
                return null;
              }

              // Obtener contrato del mercado
              const marketContractAddress = await readContract({
                contract: coreContract,
                method: 'getMarketContract',
                params: [BigInt(i)],
              });

              // Obtener posición del usuario
              const marketContract = getContract({
                client,
                chain: opBNBTestnet,
                address: marketContractAddress as `0x${string}`,
                abi: BinaryMarketExtendedABI as any,
              });

              const position = await readContract({
                contract: marketContract,
                method: 'getPosition',
                params: [BigInt(i), account.address],
              }) as any;

              // Si no tiene posición, saltar
              if (!position || (position.yesShares === BigInt(0) && position.noShares === BigInt(0))) {
                return null;
              }

              // Obtener datos del mercado (BinaryMarket.getMarket requiere marketId)
              const marketData = await readContract({
                contract: marketContract,
                method: 'getMarket',
                params: [BigInt(i)],
              }) as any;

              const market: Market = {
                id: i,
                creator: marketInfo.creator,
                createdAt: Number(marketInfo.createdAt),
                resolutionTime: Number(marketInfo.resolutionTime),
                status: Number(marketInfo.status),
                metadata: marketInfo.metadata,
                question: marketData?.question || marketInfo.metadata || `Market ${i}`,
                description: marketData?.description || '',
                totalYesShares: marketData?.totalYesShares || BigInt(0),
                totalNoShares: marketData?.totalNoShares || BigInt(0),
                yesPool: marketData?.yesPool || BigInt(0),
                noPool: marketData?.noPool || BigInt(0),
                insuranceReserve: BigInt(0),
                outcome: marketData?.outcome || 0,
                pythPriceId: BigInt(0),
              };

              // Calcular total invertido
              const yesShares = BigInt(position.yesShares || 0);
              const noShares = BigInt(position.noShares || 0);
              const avgYesPrice = BigInt(position.avgYesPrice || 0);
              const avgNoPrice = BigInt(position.avgNoPrice || 0);
              const divisor = BigInt(1000000000000000000); // 1e18
              
              const yesInvested = (yesShares * avgYesPrice) / divisor;
              const noInvested = (noShares * avgNoPrice) / divisor;
              const totalInvested = yesInvested + noInvested;

              // Calcular potential payout si el mercado está resuelto
              let potentialPayout = BigInt(0);
              if (marketData?.resolved && marketData?.outcome) {
                const yesPool = BigInt(marketData.yesPool || 0);
                const noPool = BigInt(marketData.noPool || 0);
                const totalYesShares = BigInt(marketData.totalYesShares || 0);
                const totalNoShares = BigInt(marketData.totalNoShares || 0);
                
                if (Number(marketData.outcome) === 1 && position.yesShares > 0 && totalYesShares > 0) {
                  // YES ganó
                  potentialPayout = (position.yesShares * (yesPool + noPool)) / totalYesShares;
                } else if (Number(marketData.outcome) === 2 && position.noShares > 0 && totalNoShares > 0) {
                  // NO ganó
                  potentialPayout = (position.noShares * (yesPool + noPool)) / totalNoShares;
                } else if (Number(marketData.outcome) === 3) {
                  // Invalid - refund
                  potentialPayout = totalInvested;
                }
              }

              return {
                marketId: i,
                market,
                yesShares: position.yesShares || BigInt(0),
                noShares: position.noShares || BigInt(0),
                avgYesPrice: position.avgYesPrice || BigInt(0),
                avgNoPrice: position.avgNoPrice || BigInt(0),
                claimed: position.claimed || false,
                totalInvested,
                potentialPayout,
              } as UserPosition;
            } catch (error) {
              console.error(`Error fetching position for market ${i}:`, error);
              return null;
            }
          })()
        );
      }

      const positions = (await Promise.all(positionPromises)).filter((p) => p !== null) as UserPosition[];
      setUserPositions(positions);
    } catch (error) {
      console.error('Error fetching user positions:', error);
      setUserPositions([]);
    }
  };

  // Calcular estadísticas
  const calculateStats = () => {
    const totalMarketsCreated = userMarkets.length;
    const totalBetsPlaced = userPositions.length;
    
    const totalInvested = userPositions.reduce((sum, pos) => {
      return sum + Number(pos.totalInvested) / 1e18;
    }, 0);

    const totalPotentialWinnings = userPositions.reduce((sum, pos) => {
      if (pos.market?.status === 2 && pos.potentialPayout > 0 && !pos.claimed) {
        return sum + Number(pos.potentialPayout) / 1e18;
      }
      return sum;
    }, 0);

    const activePositions = userPositions.filter((pos) => {
      return pos.market?.status === 0 || pos.market?.status === 1; // Active o Resolving
    }).length;

    const resolvedPositions = userPositions.filter((pos) => {
      return pos.market?.status === 2; // Resolved
    }).length;

    const claimedWinnings = userPositions.filter((pos) => pos.claimed).length;

    setStats({
      totalMarketsCreated,
      totalBetsPlaced,
      totalInvested,
      totalPotentialWinnings,
      activePositions,
      resolvedPositions,
      claimedWinnings,
    });
  };

  useEffect(() => {
    if (account && coreContract) {
      setLoading(true);
      Promise.all([fetchUserMarkets(), fetchUserPositions()]).finally(() => {
        setLoading(false);
      });
    } else {
      setUserMarkets([]);
      setUserPositions([]);
      setLoading(false);
    }
  }, [account?.address, coreContract]);

  useEffect(() => {
    calculateStats();
  }, [userMarkets, userPositions]);

  const refresh = async () => {
    if (account && coreContract) {
      setLoading(true);
      await Promise.all([fetchUserMarkets(), fetchUserPositions()]);
      setLoading(false);
    }
  };

  return {
    userMarkets,
    userPositions,
    stats,
    loading,
    refresh,
  };
}

