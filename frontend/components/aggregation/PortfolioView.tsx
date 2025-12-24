'use client';

import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, DollarSign, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PortfolioPosition {
  marketId: number;
  platform: string;
  chainId: number;
  amount: number;
  shares: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
}

export function PortfolioView() {
  const account = useActiveAccount();
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!account?.address) {
      setPortfolio([]);
      setLoading(false);
      return;
    }

    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Extract user ID from address (or use address directly)
        const userId = account.address;
        
        const response = await fetch(`/api/aggregation/portfolio/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio');
        }
        
        const data = await response.json();
        setPortfolio(data.portfolio || []);
      } catch (err: any) {
        console.error('Error fetching portfolio:', err);
        setError(err.message || 'Failed to load portfolio');
        toast.error('Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [account?.address]);

  if (!account) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Connect your wallet to view your portfolio</p>
        </div>
      </GlassCard>
    );
  }

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
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </GlassCard>
    );
  }

  const totalValue = portfolio.reduce((sum, pos) => sum + pos.currentValue, 0);
  const totalPnl = portfolio.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalPnlPercentage = totalValue > 0 ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Cross-Chain Portfolio</h3>
          <p className="text-sm text-gray-400">Your positions across all chains</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            ${totalValue.toFixed(2)}
          </div>
          <div className={`text-sm flex items-center gap-1 ${
            totalPnl >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {totalPnl >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)} ({totalPnlPercentage >= 0 ? '+' : ''}{totalPnlPercentage.toFixed(2)}%)
          </div>
        </div>
      </div>

      {portfolio.length === 0 ? (
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-2">No positions found</p>
          <p className="text-gray-500 text-xs">Your cross-chain positions will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {portfolio.map((position, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      Market #{position.marketId}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {position.platform}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Chain {position.chainId}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400">
                    {position.shares.toFixed(4)} shares
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">
                    ${position.currentValue.toFixed(2)}
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${
                    position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {position.pnl >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(2)} ({position.pnlPercentage >= 0 ? '+' : ''}{position.pnlPercentage.toFixed(2)}%)
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

