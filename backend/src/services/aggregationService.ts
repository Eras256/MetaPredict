import axios from "axios";
import { ethers } from "ethers";
import { supabase } from '../lib/supabase';
import { getContract, CONTRACT_ADDRESSES, OMNI_ROUTER_ABI } from '../lib/contracts';
import { logger } from '../utils/logger';

export const aggregationService = {
  async getPriceComparison(marketDescription: string) {
    try {
      // Intentar obtener precios desde el contrato OmniRouter
      const omniRouter = getContract(CONTRACT_ADDRESSES.OMNI_ROUTER, OMNI_ROUTER_ABI);
      
      // Obtener precios de mercado desde el contrato
      const marketPrices = await omniRouter.getMarketPrices(marketDescription);
      
      // Si hay precios en el contrato, usarlos
      if (marketPrices.chainIds.length > 0 && marketPrices.yesPrices[0] > 0) {
        const comparisons = marketPrices.chainIds.map((chainId, index) => ({
          platform: `chain-${chainId}`,
          chainId: Number(chainId),
          yesOdds: Number(ethers.formatUnits(marketPrices.yesPrices[index], 18)),
          noOdds: Number(ethers.formatUnits(marketPrices.noPrices[index], 18)),
          liquidity: Number(ethers.formatEther(marketPrices.liquidities[index])),
        }));
        
        const best = comparisons.reduce((best, current) => 
          current.yesOdds > best.yesOdds ? current : best
        );
        
        logger.info(`[AggregationService] Found ${comparisons.length} prices from OmniRouter`);
        
        return {
          bestOdds: best.yesOdds,
          bestPlatform: best.platform,
          bestChainId: best.chainId,
          savings: best.yesOdds - comparisons[0].yesOdds,
          routeCost: 0.0005, // Estimated gas cost
          comparisons,
          source: "contract"
        };
      }
    } catch (error: any) {
      logger.warn(`[AggregationService] Could not fetch prices from contract: ${error.message}`);
    }
    
    // Fallback: Intentar llamar a APIs externas
    const comparisons = await this.fetchExternalMarketPrices(marketDescription);
    
    const best = comparisons.reduce((best, current) => 
      current.odds > best.odds ? current : best
    );
    
    return {
      bestOdds: best.odds,
      bestPlatform: best.platform,
      savings: best.odds - comparisons[0].odds,
      routeCost: best.cost,
      comparisons,
      source: comparisons[0].source || "mock"
    };
  },

  /**
   * Fetch prices from external prediction market APIs
   */
  async fetchExternalMarketPrices(marketDescription: string): Promise<Array<{
    platform: string;
    odds: number;
    cost: number;
    source: string;
  }>> {
    const comparisons: Array<{
      platform: string;
      odds: number;
      cost: number;
      source: string;
    }> = [];

    // Try Polymarket API
    try {
      const polymarketPrice = await this.fetchPolymarketPrice(marketDescription);
      if (polymarketPrice) {
        comparisons.push({
          platform: "polymarket",
          odds: polymarketPrice,
          cost: 0.0005,
          source: "polymarket"
        });
      }
    } catch (error: any) {
      logger.warn(`[AggregationService] Polymarket API error: ${error.message}`);
    }

    // Try Kalshi API
    try {
      const kalshiPrice = await this.fetchKalshiPrice(marketDescription);
      if (kalshiPrice) {
        comparisons.push({
          platform: "kalshi",
          odds: kalshiPrice,
          cost: 0.001,
          source: "kalshi"
        });
      }
    } catch (error: any) {
      logger.warn(`[AggregationService] Kalshi API error: ${error.message}`);
    }

    // Try Azuro API
    try {
      const azuroPrice = await this.fetchAzuroPrice(marketDescription);
      if (azuroPrice) {
        comparisons.push({
          platform: "azuro",
          odds: azuroPrice,
          cost: 0.0008,
          source: "azuro"
        });
      }
    } catch (error: any) {
      logger.warn(`[AggregationService] Azuro API error: ${error.message}`);
    }

    // Fallback to mock data if no APIs returned results
    if (comparisons.length === 0) {
      logger.info('[AggregationService] No external APIs available, using mock data');
      return [
        { platform: "polymarket", odds: 0.65, cost: 0.0005, source: "mock" },
        { platform: "kalshi", odds: 0.62, cost: 0.001, source: "mock" },
        { platform: "azuro", odds: 0.63, cost: 0.0008, source: "mock" },
      ];
    }

    return comparisons;
  },

  /**
   * Fetch price from Polymarket API
   * Note: Requires POLYMARKET_API_KEY in environment variables
   */
  async fetchPolymarketPrice(marketDescription: string): Promise<number | null> {
    const apiKey = process.env.POLYMARKET_API_KEY;
    if (!apiKey) {
      return null;
    }

    try {
      // Polymarket API endpoint (example - adjust based on actual API)
      const response = await axios.get('https://api.polymarket.com/v1/markets', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          query: marketDescription,
          limit: 1
        },
        timeout: 5000
      });

      if (response.data && response.data.length > 0) {
        const market = response.data[0];
        // Extract yes odds from market data (adjust based on actual API structure)
        const yesOdds = market.yesPrice || market.yesOdds || null;
        return yesOdds ? Number(yesOdds) : null;
      }

      return null;
    } catch (error: any) {
      logger.warn(`[AggregationService] Polymarket API call failed: ${error.message}`);
      return null;
    }
  },

  /**
   * Fetch price from Kalshi API
   * Note: Requires KALSHI_API_KEY in environment variables
   */
  async fetchKalshiPrice(marketDescription: string): Promise<number | null> {
    const apiKey = process.env.KALSHI_API_KEY;
    if (!apiKey) {
      return null;
    }

    try {
      // Kalshi API endpoint (example - adjust based on actual API)
      const response = await axios.get('https://api.kalshi.com/trade-api/v2/events', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          search: marketDescription,
          limit: 1
        },
        timeout: 5000
      });

      if (response.data && response.data.events && response.data.events.length > 0) {
        const event = response.data.events[0];
        // Extract yes odds from event data (adjust based on actual API structure)
        const yesOdds = event.yes_bid || event.yes_price || null;
        return yesOdds ? Number(yesOdds) : null;
      }

      return null;
    } catch (error: any) {
      logger.warn(`[AggregationService] Kalshi API call failed: ${error.message}`);
      return null;
    }
  },

  /**
   * Fetch price from Azuro API
   * Note: Requires AZURO_API_KEY in environment variables
   */
  async fetchAzuroPrice(marketDescription: string): Promise<number | null> {
    const apiKey = process.env.AZURO_API_KEY;
    if (!apiKey) {
      return null;
    }

    try {
      // Azuro API endpoint (example - adjust based on actual API)
      const response = await axios.get('https://api.azuro.io/v1/markets', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          search: marketDescription,
          limit: 1
        },
        timeout: 5000
      });

      if (response.data && response.data.markets && response.data.markets.length > 0) {
        const market = response.data.markets[0];
        // Extract yes odds from market data (adjust based on actual API structure)
        const yesOdds = market.yesOdds || market.yesPrice || null;
        return yesOdds ? Number(yesOdds) : null;
      }

      return null;
    } catch (error: any) {
      logger.warn(`[AggregationService] Azuro API call failed: ${error.message}`);
      return null;
    }
  },
  },

  async executeBestRoute(
    userId: string,
    marketDescription: string,
    betAmount: number,
    isYes: boolean
  ) {
    try {
      // Obtener wallet address del usuario
      const { data: user } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('id', userId)
        .single();
      
      if (!user?.wallet_address) {
        throw new Error(`User ${userId} not found or has no wallet address`);
      }
      
      // Obtener mejor precio desde el contrato
      const omniRouter = getContract(CONTRACT_ADDRESSES.OMNI_ROUTER, OMNI_ROUTER_ABI);
      const bestPrice = await omniRouter.findBestPrice(
        marketDescription,
        isYes,
        ethers.parseEther(betAmount.toString())
      );
      
      logger.info(`[AggregationService] Best route found: chainId=${bestPrice.bestChainId}, price=${ethers.formatUnits(bestPrice.bestPrice, 18)}`);
      
      // Nota: routeBet() debe ser llamado desde PredictionMarketCore
      // El Core llama a OmniRouter.routeBet() cuando se ejecuta una apuesta cross-chain
      // Por ahora, solo retornamos la información del mejor precio encontrado
      
      return {
        positionId: `position-${userId}-${Date.now()}`,
        platform: `chain-${bestPrice.bestChainId}`,
        chainId: Number(bestPrice.bestChainId),
        amount: betAmount,
        odds: Number(ethers.formatUnits(bestPrice.bestPrice, 18)),
        estimatedShares: Number(ethers.formatEther(bestPrice.estimatedShares)),
        gasCost: Number(ethers.formatEther(bestPrice.gasCost)),
        executedAt: new Date(),
        note: "Route execution must be initiated from frontend via PredictionMarketCore"
      };
    } catch (error: any) {
      logger.error(`[AggregationService] Error executing best route: ${error.message}`);
      // Fallback a mock data si falla
      return {
        positionId: `position-${userId}-${Date.now()}`,
        platform: "polymarket",
        amount: betAmount,
        odds: 0.65,
        executedAt: new Date(),
        error: error.message
      };
    }
  },

  async getPortfolio(userId: string) {
    // Obtener todas las apuestas del usuario desde la base de datos
    const { data: bets, error } = await supabase
      .from('bets')
      .select(`
        *,
        markets:market_id (
          id,
          question,
          status,
          outcome
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      logger.error('[AggregationService] Error fetching portfolio:', error);
      throw error;
    }
    
    // Obtener posiciones pendientes desde contrato OmniRouter
    let pendingBets: any[] = [];
    try {
      const { data: user } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('id', userId)
        .single();
      
      if (user?.wallet_address) {
        const omniRouter = getContract(CONTRACT_ADDRESSES.OMNI_ROUTER, OMNI_ROUTER_ABI);
        const pendingBetIds = await omniRouter.getUserPendingBets(user.wallet_address);
        
        // Obtener detalles de cada apuesta pendiente
        for (const betId of pendingBetIds) {
          try {
            const betDetails = await omniRouter.getPendingBet(betId);
            pendingBets.push({
              betId: betId,
              user: betDetails.user,
              sourceChainId: Number(betDetails.sourceChainId),
              targetChainId: Number(betDetails.targetChainId),
              isYes: betDetails.isYes,
              amount: Number(ethers.formatEther(betDetails.amount)),
              status: betDetails.status,
              timestamp: new Date(Number(betDetails.timestamp) * 1000),
            });
          } catch (err: any) {
            logger.warn(`[AggregationService] Could not fetch bet ${betId}: ${err.message}`);
          }
        }
        
        logger.info(`[AggregationService] Found ${pendingBets.length} pending cross-chain bets`);
      }
    } catch (error: any) {
      logger.warn(`[AggregationService] Could not fetch pending bets from contract: ${error.message}`);
    }
    
    return {
      bets: bets || [],
      pendingCrossChainBets: pendingBets,
    };
  },

  async getPortfolioValue(userId: string) {
    const portfolio = await this.getPortfolio(userId);
    
    // Calcular valor total del portfolio
    let totalValue = 0;
    let totalInvested = 0;
    
    portfolio.forEach((bet: any) => {
      totalInvested += parseFloat(bet.amount.toString());
      
      // Si el mercado está resuelto y ganó, calcular ganancias
      if (bet.markets?.status === 'resolved') {
        // Calcular valor basado en shares y resultado del mercado
        const betOutcome = bet.outcome ? 'yes' : 'no';
        const marketOutcome = bet.markets.outcome;
        
        if (betOutcome === marketOutcome) {
          // Apuesta ganadora: calcular ganancias basadas en shares y odds
          const shares = parseFloat(bet.shares.toString());
          const amount = parseFloat(bet.amount.toString());
          
          // Valor estimado basado en shares (simplificado)
          // En producción, esto debería calcularse desde el contrato
          totalValue += shares > 0 ? shares : amount * 1.5;
        } else {
          // Apuesta perdedora: valor es 0
          totalValue += 0;
        }
      } else {
        // Mercado activo, usar valor de shares o amount si shares no está disponible
        const shares = parseFloat(bet.shares?.toString() || '0');
        const amount = parseFloat(bet.amount.toString());
        totalValue += shares > 0 ? shares : amount;
      }
    });
    
    return {
      totalValue,
      totalInvested,
      profit: totalValue - totalInvested,
      positions: portfolio.length
    };
  }
};

