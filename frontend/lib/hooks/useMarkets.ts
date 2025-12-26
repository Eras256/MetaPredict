import { useState, useEffect, useMemo, useCallback } from 'react';
import { readContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { getContract } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import PREDICTION_MARKET_CORE_ABI from '@/lib/contracts/abi/PredictionMarketCore.json';
import BINARY_MARKET_ABI from '@/lib/contracts/abi/BinaryMarket.json';
import { client } from '@/lib/config/thirdweb';
import { MARKET_STATUS } from '@/lib/config/constants';

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
  marketType: number; // 0=Binary, 1=Conditional, 2=Subjective
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
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
      abi: PREDICTION_MARKET_CORE_ABI as any,
    });
  }, []);

  const fetchCounter = async () => {
    if (!contract) return;
    try {
      const counter = await readContract({
        contract,
        method: 'marketCounter',
        params: [],
      });
      console.log('📊 Market counter:', Number(counter));
      setMarketCounter(counter as bigint);
      return counter as bigint;
    } catch (error) {
      console.error('❌ Error fetching market counter:', error);
      setLoading(false);
      return null;
    }
  };

  const fetchMarkets = async (counter?: bigint) => {
    if (!contract) return;
    const count = counter !== undefined ? Number(counter) : (marketCounter !== null ? Number(marketCounter) : 0);
    
    if (count === 0) {
      setMarkets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const marketPromises = [];
    
    for (let i = 1; i <= count; i++) {
      // ✅ FIX #7: Usar readContract directamente
      marketPromises.push(
        readContract({
          contract,
          method: 'getMarket',
          params: [BigInt(i)],
        }).then(async (result: any) => {
          if (result && result.marketType !== undefined) {
            // MarketInfo del Core contract
            const marketInfo = {
              id: i,
              marketType: Number(result.marketType),
              creator: result.creator,
              createdAt: Number(result.createdAt),
              resolutionTime: Number(result.resolutionTime),
              status: Number(result.status),
              metadata: result.metadata,
            };
            
            console.log(`📋 Market ${i} info from Core:`, marketInfo);
            
            // Obtener el contrato del mercado específico y sus datos
            try {
              const marketContractAddress = await readContract({
                contract,
                method: 'getMarketContract',
                params: [BigInt(i)],
              });
              
              console.log(`🔗 Market ${i} contract address:`, marketContractAddress);
              
              // Obtener datos del contrato específico del mercado
              const marketContract = getContract({
                client,
                chain: opBNBTestnet,
                address: marketContractAddress as `0x${string}`,
                abi: BINARY_MARKET_ABI as any,
              });
              
              try {
                const marketData = await readContract({
                  contract: marketContract,
                  method: 'getMarket',
                  params: [BigInt(i)],
                });
                
                console.log(`✅ Market ${i} data from contract:`, marketData);
                
                const fullMarket = {
                  ...marketInfo,
                  question: marketData.question || result.metadata || `Market ${i}`,
                  description: marketData.description || '',
                  totalYesShares: marketData.totalYesShares || BigInt(0),
                  totalNoShares: marketData.totalNoShares || BigInt(0),
                  yesPool: marketData.yesPool || BigInt(0),
                  noPool: marketData.noPool || BigInt(0),
                  insuranceReserve: BigInt(0),
                  outcome: marketData.outcome || 0,
                  pythPriceId: BigInt(0),
                };
                
                console.log(`✅ Market ${i} completo:`, fullMarket);
                return fullMarket;
              } catch (error) {
                console.warn(`⚠️ Error obteniendo datos del contrato para market ${i}:`, error);
                // Si no se puede obtener datos del contrato, usar metadata
                return {
                  ...marketInfo,
                  question: result.metadata || `Market ${i}`,
                  description: '',
                  totalYesShares: BigInt(0),
                  totalNoShares: BigInt(0),
                  yesPool: BigInt(0),
                  noPool: BigInt(0),
                  insuranceReserve: BigInt(0),
                  outcome: 0,
                  pythPriceId: BigInt(0),
                };
              }
            } catch (error) {
              console.warn(`⚠️ Error obteniendo contrato para market ${i}:`, error);
              // Si no se puede obtener el contrato, retornar info básica
              return {
                ...marketInfo,
                question: result.metadata || `Market ${i}`,
                description: '',
                totalYesShares: BigInt(0),
                totalNoShares: BigInt(0),
                yesPool: BigInt(0),
                noPool: BigInt(0),
                insuranceReserve: BigInt(0),
                outcome: 0,
                pythPriceId: BigInt(0),
              };
            }
          }
          console.warn(`⚠️ Market ${i} no tiene marketType`);
          return null;
        }).catch((error) => {
          console.error(`❌ Error obteniendo market ${i}:`, error);
          return null;
        })
      );
    }
    
    try {
      const results = await Promise.all(marketPromises);
      console.log('📦 Todos los resultados:', results);
      const validMarkets = results.filter((m: any) => m !== null && m.question) as Market[];
      console.log('✅ Mercados válidos:', validMarkets.length, validMarkets);
      setMarkets(validMarkets);
    } catch (error) {
      console.error('❌ Error fetching markets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchCounter();
    }
  }, [contract]);

  useEffect(() => {
    if (marketCounter !== null && contract) {
      fetchMarkets();
    }
  }, [marketCounter, contract]);

  // Escuchar eventos de creación de mercados y apuestas
  useEffect(() => {
    if (!contract) return;
    
    const handleMarketCreated = async () => {
      // Esperar un poco para que la transacción se confirme en la blockchain
      setTimeout(async () => {
        const counter = await fetchCounter();
        if (counter !== null) {
          await fetchMarkets(counter);
        }
      }, 2000); // Esperar 2 segundos para que el bloque se confirme
    };

    const handleBetPlaced = async (event: CustomEvent) => {
      // Actualizar mercados cuando se coloca una apuesta para reflejar nuevo volumen
      const eventMarketId = event.detail?.marketId;
      if (eventMarketId) {
        console.log(`📢 Bet placed on market #${eventMarketId}, refreshing markets...`);
        setTimeout(async () => {
          await fetchMarkets();
        }, 2000); // Esperar confirmación del bloque
      }
    };

    const handleWinningsClaimed = async (event: CustomEvent) => {
      // Actualizar cuando se reclaman ganancias
      const eventMarketId = event.detail?.marketId;
      if (eventMarketId) {
        console.log(`📢 Winnings claimed on market #${eventMarketId}, refreshing markets...`);
        setTimeout(async () => {
          await fetchMarkets();
        }, 2000);
      }
    };

    window.addEventListener('marketCreated', handleMarketCreated);
    window.addEventListener('betPlaced' as any, handleBetPlaced);
    window.addEventListener('winningsClaimed' as any, handleWinningsClaimed);
    
    return () => {
      window.removeEventListener('marketCreated', handleMarketCreated);
      window.removeEventListener('betPlaced' as any, handleBetPlaced);
      window.removeEventListener('winningsClaimed' as any, handleWinningsClaimed);
    };
  }, [contract, marketCounter]);
  
  // Note: Auto-refresh is now controlled by AutoRefreshBanner component in pages
  // This ensures refresh only happens at the specified intervals (e.g., 30s for markets)

  // Función para refrescar manualmente
  const refresh = async () => {
    const counter = await fetchCounter();
    if (counter !== null) {
      await fetchMarkets(counter);
    }
  };

  return { markets, loading, refresh };
}

export function useMarket(marketId: number) {
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);

  const contract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
      abi: PREDICTION_MARKET_CORE_ABI as any,
    });
  }, []);

  const fetchMarket = useCallback(async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      // Obtener MarketInfo del Core contract
      const marketInfo = await readContract({
        contract,
        method: 'getMarket',
        params: [BigInt(marketId)],
      });
      
      // Obtener el contrato del mercado específico para datos completos
      try {
        const marketContractAddress = await readContract({
          contract,
          method: 'getMarketContract',
          params: [BigInt(marketId)],
        });
        
        if (marketContractAddress && marketContractAddress !== '0x0000000000000000000000000000000000000000') {
          const marketContract = getContract({
            client,
            chain: opBNBTestnet,
            address: marketContractAddress as `0x${string}`,
            abi: BINARY_MARKET_ABI as any,
          });
          
          // Obtener datos completos del mercado (incluyendo pools)
          const marketData = await readContract({
            contract: marketContract,
            method: 'getMarket',
            params: [BigInt(marketId)],
          });
          
          // Combinar MarketInfo del Core con datos del contrato específico
          const fullMarket: Market = {
            id: marketId,
            marketType: Number(marketInfo.marketType),
            creator: marketInfo.creator,
            createdAt: Number(marketInfo.createdAt),
            resolutionTime: Number(marketInfo.resolutionTime),
            status: Number(marketInfo.status),
            metadata: marketInfo.metadata,
            question: marketData.question || marketInfo.metadata || `Market ${marketId}`,
            description: marketData.description || '',
            totalYesShares: marketData.totalYesShares || BigInt(0),
            totalNoShares: marketData.totalNoShares || BigInt(0),
            yesPool: marketData.yesPool || BigInt(0),
            noPool: marketData.noPool || BigInt(0),
            insuranceReserve: BigInt(0),
            outcome: marketData.outcome || 0,
            pythPriceId: BigInt(0),
          };
          
          setMarket(fullMarket);
        } else {
          // Si no hay contrato específico, usar solo MarketInfo
          setMarket({
            id: marketId,
            marketType: Number(marketInfo.marketType),
            creator: marketInfo.creator,
            createdAt: Number(marketInfo.createdAt),
            resolutionTime: Number(marketInfo.resolutionTime),
            status: Number(marketInfo.status),
            metadata: marketInfo.metadata,
            question: marketInfo.metadata || `Market ${marketId}`,
            description: '',
            totalYesShares: BigInt(0),
            totalNoShares: BigInt(0),
            yesPool: BigInt(0),
            noPool: BigInt(0),
            insuranceReserve: BigInt(0),
            outcome: 0,
            pythPriceId: BigInt(0),
          } as Market);
        }
      } catch (error) {
        console.warn('Error fetching market contract data:', error);
        // Fallback a solo MarketInfo
        setMarket({
          id: marketId,
          marketType: Number(marketInfo.marketType),
          creator: marketInfo.creator,
          createdAt: Number(marketInfo.createdAt),
          resolutionTime: Number(marketInfo.resolutionTime),
          status: Number(marketInfo.status),
          metadata: marketInfo.metadata,
          question: marketInfo.metadata || `Market ${marketId}`,
          description: '',
          totalYesShares: BigInt(0),
          totalNoShares: BigInt(0),
          yesPool: BigInt(0),
          noPool: BigInt(0),
          insuranceReserve: BigInt(0),
          outcome: 0,
          pythPriceId: BigInt(0),
        } as Market);
      }
    } catch (error) {
      console.error('Error fetching market:', error);
      setMarket(null);
    } finally {
      setLoading(false);
    }
  }, [contract, marketId]);

  // Fetch inicial
  useEffect(() => {
    if (contract) {
      fetchMarket();
    }
  }, [contract, marketId, fetchMarket]);

  // Polling automático cuando el mercado está activo o resolviendo
  useEffect(() => {
    if (!market) return;
    
    // Poll automáticamente si el mercado está activo o resolviendo
    const shouldPoll = market.status === MARKET_STATUS.ACTIVE || market.status === MARKET_STATUS.RESOLVING;
    
    if (!shouldPoll) return;

    console.log(`🔄 Market #${marketId} is ${market.status === MARKET_STATUS.ACTIVE ? 'active' : 'resolving'}, starting polling...`);
    
    // Poll cada 30 segundos para actualizar volumen y participantes en tiempo real
    const pollInterval = setInterval(() => {
      console.log(`🔄 Polling market #${marketId} for real-time updates...`);
      fetchMarket();
    }, 30000); // 30 segundos para actualizaciones en tiempo real

    return () => {
      console.log(`⏹️ Stopping polling for market #${marketId}`);
      clearInterval(pollInterval);
    };
  }, [market?.status, marketId, fetchMarket]);

  // Escuchar eventos personalizados de window para actualizaciones en tiempo real
  useEffect(() => {
    const handleBetPlaced = (event: CustomEvent) => {
      const eventMarketId = event.detail?.marketId;
      if (eventMarketId === marketId) {
        console.log(`📢 Market #${marketId} bet placed event received, refetching...`);
        // Refetch inmediatamente para actualizar volumen y participantes
        fetchMarket();
        setTimeout(() => fetchMarket(), 2000); // Refetch después de confirmación
      }
    };

    const handleWinningsClaimed = (event: CustomEvent) => {
      const eventMarketId = event.detail?.marketId;
      if (eventMarketId === marketId) {
        console.log(`📢 Market #${marketId} winnings claimed event received, refetching...`);
        fetchMarket();
        setTimeout(() => fetchMarket(), 2000);
      }
    };

    const handleResolutionInitiated = (event: CustomEvent) => {
      const eventMarketId = event.detail?.marketId;
      if (eventMarketId === marketId) {
        console.log(`📢 Market #${marketId} resolution initiated event received, refetching...`);
        fetchMarket();
        setTimeout(() => fetchMarket(), 2000);
      }
    };

    const handleMarketResolved = (event: CustomEvent) => {
      const eventMarketId = event.detail?.marketId;
      if (eventMarketId === marketId) {
        console.log(`📢 Market #${marketId} resolved event received, refetching...`);
        fetchMarket();
        setTimeout(() => fetchMarket(), 2000);
      }
    };

    window.addEventListener('betPlaced' as any, handleBetPlaced);
    window.addEventListener('winningsClaimed' as any, handleWinningsClaimed);
    window.addEventListener('marketResolutionInitiated' as any, handleResolutionInitiated);
    window.addEventListener('marketResolved' as any, handleMarketResolved);

    return () => {
      window.removeEventListener('betPlaced' as any, handleBetPlaced);
      window.removeEventListener('winningsClaimed' as any, handleWinningsClaimed);
      window.removeEventListener('marketResolutionInitiated' as any, handleResolutionInitiated);
      window.removeEventListener('marketResolved' as any, handleMarketResolved);
    };
  }, [marketId, fetchMarket]);

  return { market, loading, refetch: fetchMarket };
}
