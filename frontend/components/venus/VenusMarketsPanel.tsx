'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, DollarSign, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VenusMarket {
  address: string;
  symbol: string;
  name: string;
  underlyingSymbol: string;
  underlyingAddress: string;
  supplyApy: number;
  borrowApy: number;
  totalSupply: string;
  totalBorrows: string;
  liquidity: string;
  collateralFactor: string;
  exchangeRate: string;
  underlyingPrice: string;
}

export function VenusMarketsPanel() {
  const [markets, setMarkets] = useState<VenusMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/venus/markets');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch Venus markets (${response.status})`);
      }
      
      const data = await response.json();
      // Service already normalizes APY values to numbers, but add safety check
      const processedMarkets = (data.markets || []).map((market: any) => ({
        ...market,
        supplyApy: typeof market.supplyApy === 'number' ? market.supplyApy : (parseFloat(market.supplyApy) || 0),
        borrowApy: typeof market.borrowApy === 'number' ? market.borrowApy : (parseFloat(market.borrowApy) || 0),
      }));
      setMarkets(processedMarkets);
    } catch (err: any) {
      // Only log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching Venus markets:', err);
      }
      const errorMessage = err.message || 'Failed to load Venus markets. The backend service may be unavailable.';
      setError(errorMessage);
      // Only show toast if it's not a network error (to avoid spamming)
      if (!err.message?.includes('fetch')) {
        toast.error('Failed to load Venus markets');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-2">Venus Protocol integration</p>
          <p className="text-gray-500 text-xs mb-4">
            {error.includes('backend') || error.includes('unavailable') 
              ? 'Backend service is currently unavailable. This feature requires the backend API to be running.'
              : error}
          </p>
          <Button onClick={fetchMarkets} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Venus Protocol Markets</h3>
          <p className="text-sm text-gray-400">Available lending markets for yield generation</p>
        </div>
        <Button onClick={fetchMarkets} variant="ghost" size="sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {markets.length === 0 ? (
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-2">No markets available</p>
          <p className="text-gray-500 text-xs">Venus Protocol markets will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {markets.map((market) => (
            <div
              key={market.address}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {market.symbol}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {market.underlyingSymbol}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400">
                    {market.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {(market.supplyApy || 0).toFixed(2)}% APY
                  </div>
                  <div className="text-xs text-gray-400">
                    Supply APY
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                <div>
                  <div className="text-xs text-gray-400">Total Supply</div>
                  <div className="text-xs text-white font-medium">
                    ${(parseFloat(market.totalSupply) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Liquidity</div>
                  <div className="text-xs text-white font-medium">
                    ${(parseFloat(market.liquidity) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

