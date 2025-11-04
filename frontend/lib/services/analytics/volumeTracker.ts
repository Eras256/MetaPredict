/**
 * Analytics service for tracking volume and market data
 */

export interface VolumeData {
  totalVolume: number;
  dailyVolume: number;
  weeklyVolume: number;
  monthlyVolume: number;
  totalMarkets: number;
  activeMarkets: number;
  resolvedMarkets: number;
}

export interface MarketAnalytics {
  marketId: number;
  totalVolume: number;
  uniqueBettors: number;
  averageBetSize: number;
  yesPool: number;
  noPool: number;
  liquidity: number;
}

export async function getVolumeData(): Promise<VolumeData> {
  const response = await fetch('/api/analytics/volume');

  if (!response.ok) {
    return {
      totalVolume: 0,
      dailyVolume: 0,
      weeklyVolume: 0,
      monthlyVolume: 0,
      totalMarkets: 0,
      activeMarkets: 0,
      resolvedMarkets: 0,
    };
  }

  return response.json();
}

export async function getMarketAnalytics(marketId: number): Promise<MarketAnalytics | null> {
  const response = await fetch(`/api/analytics/markets/${marketId}`);

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getUserAnalytics(userAddress: string): Promise<any> {
  const response = await fetch(`/api/analytics/users/${userAddress}`);

  if (!response.ok) {
    return null;
  }

  return response.json();
}

