import { useState, useEffect, useMemo } from 'react';
import { readContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { getContract } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import PREDICTION_MARKET_CORE_ABI from '@/lib/contracts/abi/PredictionMarketCore.json';
import BINARY_MARKET_ABI from '@/lib/contracts/abi/BinaryMarket.json';
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

  // Escuchar eventos de creación de mercados
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

    window.addEventListener('marketCreated', handleMarketCreated);
    return () => {
      window.removeEventListener('marketCreated', handleMarketCreated);
    };
  }, [contract, marketCounter]);

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
