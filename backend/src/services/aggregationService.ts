import axios from "axios";
import { supabase } from '../lib/supabase';

export const aggregationService = {
  async getPriceComparison(marketDescription: string) {
    // TODO: Implementar llamadas reales a APIs de:
    // - Polymarket API
    // - Kalshi API
    // - Azuro API
    // Por ahora retornamos datos mock pero estructurados
    
    // En producción, aquí harías:
    // const polymarketOdds = await fetchPolymarketOdds(marketDescription);
    // const kalshiOdds = await fetchKalshiOdds(marketDescription);
    // const azuroOdds = await fetchAzuroOdds(marketDescription);
    
    const comparisons = [
      { platform: "polymarket", odds: 0.65, cost: 0.0005 },
      { platform: "kalshi", odds: 0.62, cost: 0.001 },
      { platform: "azuro", odds: 0.63, cost: 0.0008 },
    ];
    
    // Encontrar mejor odds
    const best = comparisons.reduce((best, current) => 
      current.odds > best.odds ? current : best
    );
    
    return {
      bestOdds: best.odds,
      bestPlatform: best.platform,
      savings: best.odds - comparisons[0].odds, // Ahorro estimado
      routeCost: best.cost,
      comparisons,
    };
  },

  async executeBestRoute(
    userId: string,
    marketDescription: string,
    betAmount: number,
    isYes: boolean
  ) {
    // TODO: Llamar contrato OmniRouter.executeBestRoute
    // Por ahora retornamos mock data
    
    // Guardar en base de datos para tracking
    // (esto se haría después de ejecutar en el contrato)
    
    return {
      positionId: `position-${userId}-${Date.now()}`,
      platform: "polymarket", // Mejor plataforma encontrada
      amount: betAmount,
      odds: 0.65,
      executedAt: new Date(),
    };
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
      console.error('Error fetching portfolio:', error);
      throw error;
    }
    
    // TODO: También obtener posiciones desde contrato OmniRouter
    
    return bets || [];
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
        // TODO: Calcular valor real basado en shares y precio de mercado
        totalValue += parseFloat(bet.amount.toString()) * 1.5; // Mock: 50% ganancia
      } else {
        // Mercado activo, usar valor de shares
        totalValue += parseFloat(bet.shares.toString());
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

