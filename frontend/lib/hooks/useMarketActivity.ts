'use client';

import { useState, useEffect, useMemo } from 'react';
import { useReadContract, useActiveAccount } from 'thirdweb/react';
import { getContract, readContract } from 'thirdweb';
import { client } from '@/lib/config/thirdweb';
import { opBNBTestnet } from '@/lib/config/thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import PREDICTION_MARKET_CORE_ABI from '@/lib/contracts/abi/PredictionMarketCore.json';
import BINARY_MARKET_ABI from '@/lib/contracts/abi/BinaryMarket.json';
import { ethers } from 'ethers';
import { formatDistanceToNow } from 'date-fns';

export interface MarketActivity {
  id: string;
  type: 'bet' | 'resolution' | 'claim' | 'resolution_initiated';
  user?: string;
  amount?: bigint;
  shares?: bigint;
  isYes?: boolean;
  outcome?: number;
  timestamp: number;
  blockNumber?: number;
  transactionHash?: string;
}

// ABI simplificado para eventos
const BINARY_MARKET_EVENTS_ABI = [
  {
    type: 'event',
    name: 'BetPlaced',
    inputs: [
      { indexed: true, name: 'marketId', type: 'uint256' },
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'isYes', type: 'bool' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'shares', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'MarketResolved',
    inputs: [
      { indexed: true, name: 'marketId', type: 'uint256' },
      { indexed: false, name: 'outcome', type: 'uint8' },
    ],
  },
  {
    type: 'event',
    name: 'WinningsClaimed',
    inputs: [
      { indexed: true, name: 'marketId', type: 'uint256' },
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
  },
] as const;

export function useMarketActivity(marketId: number) {
  const [activities, setActivities] = useState<MarketActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const account = useActiveAccount();

  // Obtener el contrato del mercado
  const coreContract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.CORE_CONTRACT,
      abi: PREDICTION_MARKET_CORE_ABI as any,
    });
  }, []);

  // Obtener la dirección del contrato del mercado específico
  const { data: marketContractAddress } = useReadContract({
    contract: coreContract,
    method: 'getMarketContract',
    params: [BigInt(marketId)],
  });

  const marketContract = useMemo(() => {
    if (!marketContractAddress || marketContractAddress === '0x0000000000000000000000000000000000000000') {
      return null;
    }
    return getContract({
      client,
      chain: opBNBTestnet,
      address: marketContractAddress as `0x${string}`,
      abi: BINARY_MARKET_ABI as any,
    });
  }, [marketContractAddress]);

  // Obtener eventos del mercado
  useEffect(() => {
    if (!marketContractAddress || !marketId || marketContractAddress === '0x0000000000000000000000000000000000000000') {
      setLoading(false);
      setActivities([]);
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);

        // Crear provider para obtener eventos
        const provider = new ethers.JsonRpcProvider('https://opbnb-testnet-rpc.bnbchain.org');
        const contractAddress = marketContractAddress as string;
        
        if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
          setActivities([]);
          setLoading(false);
          return;
        }
        
        // Crear interfaz del contrato para decodificar eventos
        const contractInterface = new ethers.Interface(BINARY_MARKET_EVENTS_ABI as any);

        const allActivities: MarketActivity[] = [];

        // Obtener eventos BetPlaced
        try {
          const betPlacedEvent = contractInterface.getEvent('BetPlaced');
          if (!betPlacedEvent) {
            console.warn('BetPlaced event not found in contract interface');
          } else {
            const betPlacedFilter = {
              address: contractAddress,
              topics: [
                betPlacedEvent.topicHash,
                ethers.zeroPadValue(ethers.toBeHex(marketId), 32), // marketId indexed
              ],
            };

            // Obtener eventos de los últimos 10000 bloques (aproximadamente 10 horas en opBNB)
            // Esto asegura que capturemos todas las apuestas históricas
            const currentBlock = await provider.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 10000);

            console.log(`🔍 Fetching BetPlaced events for market #${marketId} from block ${fromBlock} to latest`);
            const betEvents = await provider.getLogs({
              ...betPlacedFilter,
              fromBlock,
              toBlock: 'latest',
            });
            
            console.log(`📊 Found ${betEvents.length} BetPlaced events for market #${marketId}`);

            for (let i = 0; i < betEvents.length; i++) {
              const log = betEvents[i];
              try {
                const decoded = contractInterface.decodeEventLog('BetPlaced', log.data, log.topics);
                const block = await provider.getBlock(log.blockNumber);
                
                allActivities.push({
                  id: `${log.transactionHash}-${i}`,
                  type: 'bet',
                  user: decoded.user,
                  amount: BigInt(decoded.amount.toString()),
                  shares: BigInt(decoded.shares.toString()),
                  isYes: decoded.isYes,
                  timestamp: block?.timestamp || Date.now() / 1000,
                  blockNumber: log.blockNumber,
                  transactionHash: log.transactionHash,
                });
              } catch (error) {
                console.warn('Error decoding BetPlaced event:', error);
              }
            }
          }
        } catch (error) {
          console.warn('Error fetching BetPlaced events:', error);
        }

        // Obtener eventos MarketResolved
        try {
          const marketResolvedEvent = contractInterface.getEvent('MarketResolved');
          if (!marketResolvedEvent) {
            console.warn('MarketResolved event not found in contract interface');
          } else {
            const resolvedFilter = {
              address: contractAddress,
              topics: [
                marketResolvedEvent.topicHash,
                ethers.zeroPadValue(ethers.toBeHex(marketId), 32), // marketId indexed
              ],
            };

            const currentBlock = await provider.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 10000);

            const resolvedEvents = await provider.getLogs({
              ...resolvedFilter,
              fromBlock,
              toBlock: 'latest',
            });

            for (let i = 0; i < resolvedEvents.length; i++) {
              const log = resolvedEvents[i];
              try {
                const decoded = contractInterface.decodeEventLog('MarketResolved', log.data, log.topics);
                const block = await provider.getBlock(log.blockNumber);
                
                allActivities.push({
                  id: `${log.transactionHash}-${i}`,
                  type: 'resolution',
                  outcome: Number(decoded.outcome),
                  timestamp: block?.timestamp || Date.now() / 1000,
                  blockNumber: log.blockNumber,
                  transactionHash: log.transactionHash,
                });
              } catch (error) {
                console.warn('Error decoding MarketResolved event:', error);
              }
            }
          }
        } catch (error) {
          console.warn('Error fetching MarketResolved events:', error);
        }

        // Obtener eventos WinningsClaimed
        try {
          const winningsClaimedEvent = contractInterface.getEvent('WinningsClaimed');
          if (!winningsClaimedEvent) {
            console.warn('WinningsClaimed event not found in contract interface');
          } else {
            const claimFilter = {
              address: contractAddress,
              topics: [
                winningsClaimedEvent.topicHash,
                ethers.zeroPadValue(ethers.toBeHex(marketId), 32), // marketId indexed
              ],
            };

            const currentBlock = await provider.getBlockNumber();
            const fromBlock = Math.max(0, currentBlock - 10000);

            const claimEvents = await provider.getLogs({
              ...claimFilter,
              fromBlock,
              toBlock: 'latest',
            });

            for (let i = 0; i < claimEvents.length; i++) {
              const log = claimEvents[i];
              try {
                const decoded = contractInterface.decodeEventLog('WinningsClaimed', log.data, log.topics);
                const block = await provider.getBlock(log.blockNumber);
                
                allActivities.push({
                  id: `${log.transactionHash}-${i}`,
                  type: 'claim',
                  user: decoded.user,
                  amount: BigInt(decoded.amount.toString()),
                  timestamp: block?.timestamp || Date.now() / 1000,
                  blockNumber: log.blockNumber,
                  transactionHash: log.transactionHash,
                });
              } catch (error) {
                console.warn('Error decoding WinningsClaimed event:', error);
              }
            }
          }
        } catch (error) {
          console.warn('Error fetching WinningsClaimed events:', error);
        }

        // Ordenar actividades por timestamp (más reciente primero)
        allActivities.sort((a, b) => b.timestamp - a.timestamp);

        console.log(`📊 Market #${marketId} activities fetched: ${allActivities.length} total`);
        if (allActivities.length > 0) {
          console.log(`📊 Sample activity:`, allActivities[0]);
          console.log(`📊 All activities:`, allActivities);
        } else {
          console.warn(`⚠️ No activities found for market #${marketId}. Contract: ${contractAddress}`);
        }

        setActivities(allActivities);
      } catch (error) {
        console.error('Error fetching market activities:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Refrescar cada 60 segundos para obtener nuevas actividades
    const interval = setInterval(fetchActivities, 60000);

    return () => clearInterval(interval);
  }, [marketContractAddress, marketId]);

  // Escuchar eventos personalizados cuando se hace una apuesta o se reclaman ganancias
  useEffect(() => {
    const handleBetPlaced = (event: CustomEvent) => {
      const eventMarketId = event.detail?.marketId;
      if (eventMarketId === marketId && event.detail?.transactionHash) {
        // Agregar actividad temporal hasta que se confirme en el próximo refresh
        const tempActivity: MarketActivity = {
          id: `temp-${Date.now()}`,
          type: 'bet',
          user: account?.address,
          amount: BigInt(event.detail.amount || 0),
          isYes: event.detail.isYes,
          timestamp: Date.now() / 1000,
          transactionHash: event.detail.transactionHash,
        };
        setActivities((prev) => [tempActivity, ...prev]);
      }
    };

    const handleWinningsClaimed = (event: CustomEvent) => {
      const eventMarketId = event.detail?.marketId;
      if (eventMarketId === marketId && event.detail?.transactionHash) {
        const tempActivity: MarketActivity = {
          id: `temp-claim-${Date.now()}`,
          type: 'claim',
          user: account?.address,
          timestamp: Date.now() / 1000,
          transactionHash: event.detail.transactionHash,
        };
        setActivities((prev) => [tempActivity, ...prev]);
      }
    };

    const handleResolutionInitiated = (event: CustomEvent) => {
      const eventMarketId = event.detail?.marketId;
      if (eventMarketId === marketId && event.detail?.transactionHash) {
        const tempActivity: MarketActivity = {
          id: `temp-resolution-${Date.now()}`,
          type: 'resolution_initiated',
          timestamp: Date.now() / 1000,
          transactionHash: event.detail.transactionHash,
        };
        setActivities((prev) => [tempActivity, ...prev]);
      }
    };

    window.addEventListener('betPlaced' as any, handleBetPlaced);
    window.addEventListener('winningsClaimed' as any, handleWinningsClaimed);
    window.addEventListener('marketResolutionInitiated' as any, handleResolutionInitiated);
    
    return () => {
      window.removeEventListener('betPlaced' as any, handleBetPlaced);
      window.removeEventListener('winningsClaimed' as any, handleWinningsClaimed);
      window.removeEventListener('marketResolutionInitiated' as any, handleResolutionInitiated);
    };
  }, [marketId, account]);

  return { activities, loading };
}

