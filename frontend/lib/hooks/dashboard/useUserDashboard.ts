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
  expiredPendingResolution: number; // Mercados vencidos pero no resueltos
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
    expiredPendingResolution: 0,
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
          }) as string;

          // Validar que la dirección del contrato sea válida
          const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
          if (!marketContractAddress || 
              marketContractAddress === ZERO_ADDRESS || 
              marketContractAddress.toLowerCase() === ZERO_ADDRESS.toLowerCase()) {
            console.warn(`Invalid market contract address for market ${marketIdNum}`);
            return null;
          }

          // Obtener datos del mercado específico
          const marketContract = getContract({
            client,
            chain: opBNBTestnet,
            address: marketContractAddress as `0x${string}`,
            abi: BinaryMarketExtendedABI as any,
          });

          // Validar que el marketId sea razonable antes de llamar al contrato
          // El error sugiere que el contrato tiene un límite de ~544 mercados
          if (marketIdNum > 10000) {
            console.warn(`Market ID ${marketIdNum} seems too large, skipping`);
            return null;
          }

          let marketData: any;
          try {
            marketData = await readContract({
              contract: marketContract,
              method: 'getMarket',
              params: [marketIdBigInt],
            }) as any;
          } catch (error: any) {
            // Manejar diferentes tipos de errores de decodificación
            const errorMessage = error?.message || '';
            const errorString = String(error || '');
            
            // Verificar múltiples formas del error
            if (errorMessage.includes('PositionOutOfBounds') || 
                errorMessage.includes('out of bounds') ||
                errorMessage.includes('InvalidBytesBooleanError') ||
                errorMessage.includes('not a valid boolean') ||
                errorMessage.includes('Bytes value') ||
                errorMessage.includes('decode') ||
                errorString.includes('InvalidBytesBooleanError') ||
                errorString.includes('not a valid boolean') ||
                errorString.includes('Bytes value') ||
                error?.name === 'InvalidBytesBooleanError' ||
                error?.code === 'INVALID_BYTES_BOOLEAN') {
              console.warn(`Market ${marketIdNum} not found or invalid in BinaryMarket contract, skipping`);
              return null;
            }
            // Si es otro tipo de error, también lo manejamos silenciosamente para no romper el dashboard
            console.warn(`Error fetching market ${marketIdNum} data:`, errorMessage || errorString);
            return null;
          }

          // Validar que marketData tenga la estructura esperada
          if (!marketData || typeof marketData !== 'object') {
            console.warn(`Invalid market data for market ${marketIdNum}`);
            return null;
          }

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
              }) as string;

              // Validar que la dirección del contrato sea válida
              const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
              if (!marketContractAddress || 
                  marketContractAddress === ZERO_ADDRESS || 
                  marketContractAddress.toLowerCase() === ZERO_ADDRESS.toLowerCase()) {
                return null;
              }

              // Validar que el marketId sea razonable
              if (i > 10000) {
                return null;
              }

              // Obtener posición del usuario
              const marketContract = getContract({
                client,
                chain: opBNBTestnet,
                address: marketContractAddress as `0x${string}`,
                abi: BinaryMarketExtendedABI as any,
              });

              let position: any;
              try {
                position = await readContract({
                  contract: marketContract,
                  method: 'getPosition',
                  params: [BigInt(i), account.address],
                }) as any;
              } catch (error: any) {
                // Si el error es sobre posición fuera de límites, el mercado puede no existir
                const errorMsg = String(error?.message || error || '');
                if (errorMsg.includes('PositionOutOfBounds') || 
                    errorMsg.includes('out of bounds') ||
                    errorMsg.includes('InvalidBytesBooleanError') ||
                    errorMsg.includes('not a valid boolean') ||
                    errorMsg.includes('Bytes value')) {
                  return null;
                }
                return null; // Silenciosamente ignorar otros errores también
              }

              // Si no tiene posición, saltar
              if (!position || (position.yesShares === BigInt(0) && position.noShares === BigInt(0))) {
                return null;
              }

              // Obtener datos del mercado (BinaryMarket.getMarket requiere marketId)
              // Envolver en try-catch más amplio para capturar cualquier error de decodificación
              let marketData: any;
              try {
                marketData = await readContract({
                  contract: marketContract,
                  method: 'getMarket',
                  params: [BigInt(i)],
                }) as any;
              } catch (error: any) {
                // Capturar cualquier error relacionado con decodificación
                // El error puede venir en diferentes formatos, así que verificamos todo
                const errorObj = error || {};
                const errorMessage = String(errorObj.message || '');
                const errorString = String(errorObj);
                const errorName = String(errorObj.name || '');
                const errorCode = String(errorObj.code || '');
                const errorType = String(errorObj.type || '');
                const errorConstructor = String(errorObj.constructor?.name || '');
                
                // Lista de patrones que indican errores de decodificación que debemos ignorar
                const isDecodeError = 
                  errorMessage.includes('PositionOutOfBounds') || 
                  errorMessage.includes('out of bounds') ||
                  errorMessage.includes('InvalidBytesBooleanError') ||
                  errorMessage.includes('not a valid boolean') ||
                  errorMessage.includes('Bytes value') ||
                  errorMessage.includes('decode') ||
                  errorString.includes('InvalidBytesBooleanError') ||
                  errorString.includes('not a valid boolean') ||
                  errorString.includes('Bytes value') ||
                  errorName === 'InvalidBytesBooleanError' ||
                  errorCode === 'INVALID_BYTES_BOOLEAN' ||
                  errorConstructor === 'InvalidBytesBooleanError' ||
                  errorType === 'InvalidBytesBooleanError';
                
                if (isDecodeError) {
                  return null;
                }
                
                // Para cualquier otro error, también lo ignoramos silenciosamente
                // para evitar romper el dashboard completo
                return null;
              }

              // Validar que marketData tenga la estructura esperada
              if (!marketData || typeof marketData !== 'object') {
                return null;
              }

              const market: Market = {
                id: i,
                marketType: Number(marketInfo.marketType) || 0,
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

              // Calculate potential payout using ONLY real contract data
              // No estimations or simulations - only actual resolved market outcomes
              let potentialPayout = BigInt(0);
              const yesPool = BigInt(marketData?.yesPool || 0);
              const noPool = BigInt(marketData?.noPool || 0);
              const totalYesShares = BigInt(marketData?.totalYesShares || 0);
              const totalNoShares = BigInt(marketData?.totalNoShares || 0);
              const totalPool = yesPool + noPool;
              
              // Only calculate payout if market is actually resolved in the contract
              // For unresolved markets, payout is 0 until resolution
              if (marketData?.resolved && marketData?.outcome) {
                const outcome = Number(marketData.outcome);
                if (outcome === 1 && position.yesShares > 0 && totalYesShares > 0) {
                  // YES won - calculate real payout from contract pools
                  potentialPayout = (position.yesShares * totalPool) / totalYesShares;
                } else if (outcome === 2 && position.noShares > 0 && totalNoShares > 0) {
                  // NO won - calculate real payout from contract pools
                  potentialPayout = (position.noShares * totalPool) / totalNoShares;
                } else if (outcome === 3) {
                  // Invalid outcome - refund total invested
                  potentialPayout = totalInvested;
                }
                // If outcome doesn't match user's position, payout remains 0
              }
              // For unresolved markets (even if expired), payout is 0 until actual resolution

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

    // Calculate total potential winnings using ONLY resolved markets from contract
    // No estimations - only actual resolved outcomes
    const totalPotentialWinnings = userPositions.reduce((sum, pos) => {
      // Only include winnings from markets that are actually resolved in the contract
      if (pos.market?.status === 2 && pos.potentialPayout > 0 && !pos.claimed) {
        return sum + Number(pos.potentialPayout) / 1e18;
      }
      // Do not include estimations for expired but unresolved markets
      // Wait for actual contract resolution
      return sum;
    }, 0);

    const activePositions = userPositions.filter((pos) => {
      return pos.market?.status === 0 || pos.market?.status === 1; // Active o Resolving
    }).length;

    const resolvedPositions = userPositions.filter((pos) => {
      return pos.market?.status === 2; // Resolved
    }).length;

    // Contar mercados vencidos pero no resueltos
    const currentTime = Math.floor(Date.now() / 1000);
    const expiredPendingResolution = userPositions.filter((pos) => {
      if (!pos.market) return false;
      const hasExpired = pos.market.resolutionTime <= currentTime;
      const isNotResolved = pos.market.status !== 2; // No está resuelto
      return hasExpired && isNotResolved;
    }).length;

    const claimedWinnings = userPositions.filter((pos) => pos.claimed).length;

    setStats({
      totalMarketsCreated,
      totalBetsPlaced,
      totalInvested,
      totalPotentialWinnings,
      activePositions,
      resolvedPositions,
      expiredPendingResolution,
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

  // Auto-refresh data every 30 seconds to keep values up-to-date
  useEffect(() => {
    if (!account || !coreContract) return;

    const interval = setInterval(() => {
      fetchUserMarkets();
      fetchUserPositions();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
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

