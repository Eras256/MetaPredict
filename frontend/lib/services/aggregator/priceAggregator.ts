/**
 * Price aggregator service for cross-chain price comparison
 */

export interface PriceComparison {
  chainId: number;
  yesPrice: number;
  noPrice: number;
  liquidity: number;
  gasCost: number;
  totalCost: number;
}

export interface BestPrice {
  bestChainId: number;
  bestPrice: number;
  estimatedShares: number;
  gasCost: number;
  savings: number;
}

export async function getPriceComparison(
  marketQuestion: string,
  isYes: boolean,
  amount: string
): Promise<BestPrice | null> {
  const response = await fetch('/api/aggregator/prices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      marketQuestion,
      isYes,
      amount,
    }),
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getAllPrices(marketQuestion: string): Promise<PriceComparison[]> {
  const response = await fetch(`/api/aggregator/prices?marketQuestion=${encodeURIComponent(marketQuestion)}`);

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function findBestRoute(
  marketQuestion: string,
  isYes: boolean,
  amount: string
): Promise<BestPrice | null> {
  const response = await fetch('/api/aggregator/route', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      marketQuestion,
      isYes,
      amount,
    }),
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

