'use client';

import { useParams } from 'next/navigation';
import { GlassCard } from '@/components/effects/GlassCard';
import { BettingPanel } from '@/components/markets/BettingPanel';
import { useMarketDetails } from '@/lib/hooks/markets/useMarkets';
import { useReadContract } from 'wagmi';
import { useActiveAccount } from 'thirdweb/react';
import { CONTRACTS } from '@/lib/config/constants';
import { formatUnits } from 'viem';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, TrendingDown, Shield, Users, DollarSign } from 'lucide-react';
import { MARKET_STATUS, MARKET_TYPES } from '@/lib/config/constants';

// USDC ABI placeholder
const USDCABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = Number(params.id);
  const account = useActiveAccount();
  
  const { marketInfo, marketData, odds, isLoading } = useMarketDetails(marketId);
  
  const { data: balance } = useReadContract({
    address: CONTRACTS.USDC as `0x${string}`,
    abi: USDCABI,
    functionName: 'balanceOf',
    args: [account?.address as `0x${string}`],
    query: { enabled: !!account },
  });

  const userBalance = balance ? Number(formatUnits(balance, 6)) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!marketInfo || !marketData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pt-32 pb-20 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <p className="text-gray-400 text-lg">Market not found</p>
        </GlassCard>
      </div>
    );
  }

  const yesOdds = odds ? Number(odds[0]) / 100 : 50;
  const noOdds = odds ? Number(odds[1]) / 100 : 50;
  const totalPool = marketData.yesPool && marketData.noPool
    ? Number(marketData.yesPool) + Number(marketData.noPool)
    : 0;

  const marketTypeLabels = {
    [MARKET_TYPES.BINARY]: 'Binary',
    [MARKET_TYPES.CONDITIONAL]: 'Conditional',
    [MARKET_TYPES.SUBJECTIVE]: 'Subjective',
  };

  const statusLabels = {
    [MARKET_STATUS.ACTIVE]: { label: 'Active', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
    [MARKET_STATUS.RESOLVING]: { label: 'Resolving', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    [MARKET_STATUS.RESOLVED]: { label: 'Resolved', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    [MARKET_STATUS.DISPUTED]: { label: 'Disputed', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    [MARKET_STATUS.CANCELLED]: { label: 'Cancelled', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  };

  const status = marketInfo.status as keyof typeof statusLabels;
  const type = marketInfo.marketType as keyof typeof marketTypeLabels;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <GlassCard className="p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="border-purple-500/30">
                  {marketTypeLabels[type]}
                </Badge>
                <Badge className={statusLabels[status]?.color}>
                  {statusLabels[status]?.label}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {marketData.question || `Market #${marketId}`}
              </h1>
              <p className="text-gray-400 text-lg mb-6">{marketData.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-5 w-5" />
              <span>Resolution: {new Date(Number(marketInfo.resolutionTime) * 1000).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <DollarSign className="h-5 w-5" />
              <span>Total Pool: ${(totalPool / 1e6).toFixed(2)}M</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Shield className="h-5 w-5" />
              <span>Insurance Protected</span>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Odds Display */}
          <GlassCard className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Current Odds</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    <span className="text-lg font-semibold text-green-400">YES</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{yesOdds.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${yesOdds}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Pool: ${marketData.yesPool ? (Number(marketData.yesPool) / 1e6).toFixed(2) : '0.00'}M
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                    <span className="text-lg font-semibold text-red-400">NO</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{noOdds.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-rose-500"
                    style={{ width: `${noOdds}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Pool: ${marketData.noPool ? (Number(marketData.noPool) / 1e6).toFixed(2) : '0.00'}M
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Betting Panel */}
          <BettingPanel
            marketId={marketId}
            yesOdds={yesOdds}
            noOdds={noOdds}
            userBalance={userBalance}
          />
        </div>
      </div>
    </div>
  );
}
