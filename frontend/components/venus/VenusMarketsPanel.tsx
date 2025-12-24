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
      <GlassCard className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
          <Skeleton className="h-24 sm:h-32 w-full" />
          <Skeleton className="h-24 sm:h-32 w-full" />
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-4 sm:p-6">
        <div className="text-center py-6 sm:py-8">
          <DollarSign className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-2 sm:mb-3" />
          <p className="text-gray-400 text-xs sm:text-sm mb-2">Venus Protocol integration</p>
          <p className="text-gray-500 text-xs mb-3 sm:mb-4 px-2">
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
    <GlassCard className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold mb-1">Venus Protocol Markets</h3>
          <p className="text-xs sm:text-sm text-gray-400">Available lending markets for yield generation</p>
        </div>
        <Button onClick={fetchMarkets} variant="ghost" size="sm" className="w-full sm:w-auto">
          <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="ml-2 text-xs sm:text-sm">Refresh</span>
        </Button>
      </div>

      {markets.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <DollarSign className="w-8 h-8 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-2 sm:mb-3" />
          <p className="text-gray-400 text-xs sm:text-sm mb-2">No markets available</p>
          <p className="text-gray-500 text-xs">Venus Protocol markets will appear here</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
          {markets.map((market) => (
            <div
              key={market.address}
              className="p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2 sm:gap-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs sm:text-sm font-medium text-white">
                      {market.symbol}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {market.underlyingSymbol}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {market.name}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs sm:text-sm font-semibold text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    {(market.supplyApy || 0).toFixed(2)}% APY
                  </div>
                  <div className="text-xs text-gray-400">
                    Supply APY
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10">
                <div>
                  <div className="text-xs text-gray-400">Total Supply</div>
                  <div className="text-xs text-white font-medium">
                    {market.totalSupply && market.totalSupply !== "0" && !isNaN(parseFloat(market.totalSupply))
                      ? `$${(parseFloat(market.totalSupply) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                      : "$0.00"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Liquidity</div>
                  <div className="text-xs text-white font-medium">
                    {market.liquidity && market.liquidity !== "0" && !isNaN(parseFloat(market.liquidity))
                      ? `$${(parseFloat(market.liquidity) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                      : "$0.00"}
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <a
                  href={`https://testnet.opbnbscan.com/address/${market.address}#code`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs sm:text-sm bg-white/5 hover:bg-white/10 border-white/20"
                  >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    View on opBNBScan
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

