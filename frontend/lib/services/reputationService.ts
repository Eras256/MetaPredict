const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const reputationService = {
  async getReputation(userId: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/reputation/${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Return default reputation if not found
          return {
            userId,
            stakeAmount: 0,
            accuracy: 50,
            disputesWon: 0,
            slashesIncurred: 0,
            isMember: false,
          };
        }
        throw new Error(`Failed to fetch reputation: ${response.statusText}`);
      }
      const data = await response.json();
      return data.reputation || {
        userId,
        stakeAmount: 0,
        accuracy: 50,
        disputesWon: 0,
        slashesIncurred: 0,
        isMember: false,
      };
    } catch (error) {
      console.error('[ReputationService] Error fetching reputation:', error);
      // Return default on error
      return {
        userId,
        stakeAmount: 0,
        accuracy: 50,
        disputesWon: 0,
        slashesIncurred: 0,
        isMember: false,
      };
    }
  },

  async joinDAO(userId: string, stakeAmount: number) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/reputation/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          stakeAmount,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to join DAO: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.result || {
        success: true,
        userId,
        stakeAmount,
      };
    } catch (error) {
      console.error('[ReputationService] Error joining DAO:', error);
      throw error;
    }
  },

  async updateReputation(
    userId: string,
    wasCorrect: boolean,
    marketSize: number,
    confidence: number
  ) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/reputation/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          wasCorrect,
          marketSize,
          confidence,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update reputation: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.reputation || {
        userId,
        accuracy: wasCorrect ? 60 : 40,
      };
    } catch (error) {
      console.error('[ReputationService] Error updating reputation:', error);
      throw error;
    }
  },

  async getLeaderboard(limit: number = 100) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/reputation/leaderboard?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }
      const data = await response.json();
      return data.leaderboard || [];
    } catch (error) {
      console.error('[ReputationService] Error fetching leaderboard:', error);
      return [];
    }
  },
};

