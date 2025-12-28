import { apiService } from '@/services/apiService';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const marketService = {
  async getAllMarkets() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/markets`);
      if (!response.ok) {
        throw new Error(`Failed to fetch markets: ${response.statusText}`);
      }
      const data = await response.json();
      return data.markets || [];
    } catch (error) {
      console.error('[MarketService] Error fetching markets:', error);
      return [];
    }
  },

  async getMarketById(id: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/markets/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch market: ${response.statusText}`);
      }
      const data = await response.json();
      return data.market || null;
    } catch (error) {
      console.error('[MarketService] Error fetching market:', error);
      return null;
    }
  },

  async createMarket(data: any) {
    // Market creation is handled by smart contracts and synced via supabaseSync
    // This service is mainly for reading
    return {
      id: "market-id",
      ...data,
      createdAt: new Date(),
    };
  },

  async placeBet(marketId: string, userId: string, amount: number, outcome: boolean) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/markets/${marketId}/bet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount,
          outcome,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to place bet: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.bet || {
        id: "bet-id",
        marketId,
        userId,
        amount,
        outcome,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('[MarketService] Error placing bet:', error);
      throw error;
    }
  },

  async resolveMarket(marketId: string, outcome: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/markets/${marketId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outcome }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to resolve market: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.market || {
        id: marketId,
        status: "resolved",
        outcome,
      };
    } catch (error) {
      console.error('[MarketService] Error resolving market:', error);
      throw error;
    }
  },
};

