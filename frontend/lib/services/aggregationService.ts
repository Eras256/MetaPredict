const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const aggregationService = {
  async getPriceComparison(marketDescription: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/aggregation/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ marketDescription }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get price comparison: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.comparison || {
        bestOdds: 0.65,
        bestPlatform: "polymarket",
        savings: 0.03,
        routeCost: 0.0005,
        comparisons: [
          { platform: "polymarket", odds: 0.65, cost: 0.0005 },
          { platform: "kalshi", odds: 0.62, cost: 0.001 },
          { platform: "azuro", odds: 0.63, cost: 0.0008 },
        ],
      };
    } catch (error) {
      console.error('[AggregationService] Error getting price comparison:', error);
      // Return mock data on error
      return {
        bestOdds: 0.65,
        bestPlatform: "polymarket",
        savings: 0.03,
        routeCost: 0.0005,
        comparisons: [
          { platform: "polymarket", odds: 0.65, cost: 0.0005 },
          { platform: "kalshi", odds: 0.62, cost: 0.001 },
          { platform: "azuro", odds: 0.63, cost: 0.0008 },
        ],
      };
    }
  },

  async executeBestRoute(
    userId: string,
    marketDescription: string,
    betAmount: number,
    isYes: boolean
  ) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/aggregation/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          marketDescription,
          betAmount,
          isYes,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to execute best route: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.result || {
        positionId: "position-id",
        platform: "polymarket",
        amount: betAmount,
        odds: 0.65,
        executedAt: new Date(),
      };
    } catch (error) {
      console.error('[AggregationService] Error executing best route:', error);
      throw error;
    }
  },

  async getPortfolio(userId: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/aggregation/portfolio/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to get portfolio: ${response.statusText}`);
      }
      const data = await response.json();
      return data.portfolio || { bets: [], pendingCrossChainBets: [] };
    } catch (error) {
      console.error('[AggregationService] Error fetching portfolio:', error);
      return { bets: [], pendingCrossChainBets: [] };
    }
  },
};

