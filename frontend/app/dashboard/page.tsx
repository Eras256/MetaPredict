'use client';

import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  Target,
  CheckCircle2,
  Clock,
  DollarSign,
  BarChart3,
  RefreshCw,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/effects/GlassCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserDashboard } from '@/lib/hooks/dashboard/useUserDashboard';
import { useBNBBalance } from '@/lib/hooks/useBNBBalance';
import { useReputation } from '@/lib/hooks/reputation/useReputation';
import { useClaimWinnings } from '@/lib/hooks/betting/usePlaceBet';
import Link from 'next/link';
import { formatAddress } from '@/lib/utils/blockchain';
import { MARKET_STATUS } from '@/lib/config/constants';
import { toast } from 'sonner';

export default function DashboardPage() {
  const account = useActiveAccount();
  const { balance } = useBNBBalance();
  const { stakedAmount, reputationScore, tier } = useReputation();
  const { userMarkets, userPositions, stats, loading, refresh } = useUserDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const ClaimButton = ({ marketId }: { marketId: number }) => {
    const { claim, isPending } = useClaimWinnings(marketId);
    
    const handleClaim = async () => {
      if (!account) {
        toast.error('Please connect your wallet first');
        return;
      }
      
      try {
        await claim();
        // Refresh data after claiming
        setTimeout(() => {
          refresh();
        }, 2000);
      } catch (error) {
        // Error already handled by hook
      }
    };
    
    return (
      <Button
        onClick={handleClaim}
        disabled={isPending}
        className="w-full sm:w-auto flex-1 gap-1.5 sm:gap-2 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
        size="sm"
      >
        {isPending ? (
          <>
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            <span className="hidden sm:inline">Claiming...</span>
            <span className="sm:hidden">Claiming</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
            Claim
          </>
        )}
      </Button>
    );
  };

  const tierNames = ['Novice', 'Expert', 'Oracle', 'Legend'];
  const tierColors = ['gray', 'blue', 'purple', 'gold'];

  if (!account) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <GlassCard className="p-12 text-center">
            <LayoutDashboard className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400">
              Please connect your wallet to view your personal dashboard
            </p>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                My Dashboard
              </h1>
              <p className="text-gray-400">
                Manage your markets, bets, and statistics
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Wallet className="w-4 h-4" />
            <span>{formatAddress(account.address)}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <GlassCard className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Balance BNB</p>
                <div className="text-xl sm:text-2xl font-bold text-white truncate">
                  {loading ? <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" /> : `${balance.toFixed(4)} BNB`}
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 ml-2">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Markets Created</p>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {loading ? <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" /> : stats.totalMarketsCreated}
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 ml-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Total Bets</p>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {loading ? <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" /> : stats.totalBetsPlaced}
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 ml-2">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Total Invested</p>
                <div className="text-xl sm:text-2xl font-bold text-white truncate">
                  {loading ? (
                    <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
                  ) : (
                    `${stats.totalInvested.toFixed(4)} BNB`
                  )}
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0 ml-2">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <GlassCard className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                Statistics
              </h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-400">Active Positions</span>
                <span className="text-base sm:text-lg font-semibold text-white">
                  {loading ? <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" /> : stats.activePositions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-400">Resolved Positions</span>
                <span className="text-base sm:text-lg font-semibold text-white">
                  {loading ? <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" /> : stats.resolvedPositions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-400">Potential Winnings</span>
                <span className="text-base sm:text-lg font-semibold text-green-400 truncate ml-2">
                  {loading ? (
                    <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
                  ) : (
                    `${stats.totalPotentialWinnings.toFixed(4)} BNB`
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-400">Claimed Winnings</span>
                <span className="text-base sm:text-lg font-semibold text-green-400">
                  {loading ? <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" /> : stats.claimedWinnings}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                Reputation
              </h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-400">Tier</span>
                <Badge variant="outline" className="text-purple-300 text-xs">
                  {tierNames[tier] || 'N/A'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-400">Score</span>
                <span className="text-base sm:text-lg font-semibold text-white">{reputationScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-400">Staked</span>
                <span className="text-xs sm:text-sm text-white truncate ml-2">{stakedAmount.toFixed(4)} BNB</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                Quick Actions
              </h3>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Link href="/create">
                <Button variant="outline" className="w-full justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  Create Market
                </Button>
              </Link>
              <Link href="/markets">
                <Button variant="outline" className="w-full justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  Explore Markets
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="outline" className="w-full justify-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
                  View Portfolio
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* Tabs for Markets and Positions */}
        <Tabs defaultValue="markets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="markets" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              My Markets ({userMarkets.length})
            </TabsTrigger>
            <TabsTrigger value="positions" className="gap-2">
              <Target className="w-4 h-4" />
              My Bets ({userPositions.length})
            </TabsTrigger>
          </TabsList>

          {/* My Markets Tab */}
          <TabsContent value="markets">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : userMarkets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {userMarkets.map((market) => (
                  <GlassCard key={market.id} className="p-4 sm:p-5 md:p-6 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                          {market.question}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                          {market.description}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-400">Status</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            market.status === MARKET_STATUS.ACTIVE
                              ? 'border-green-500/30 text-green-400'
                              : market.status === MARKET_STATUS.RESOLVED
                              ? 'border-blue-500/30 text-blue-400'
                              : 'border-gray-500/30 text-gray-400'
                          }`}
                        >
                          {market.status === MARKET_STATUS.ACTIVE
                            ? 'Active'
                            : market.status === MARKET_STATUS.RESOLVING
                            ? 'Resolving'
                            : market.status === MARKET_STATUS.RESOLVED
                            ? 'Resolved'
                            : 'Unknown'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-400">Volume</span>
                        <span className="text-white truncate ml-2">
                          {((Number(market.yesPool) + Number(market.noPool)) / 1e18).toFixed(4)} BNB
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-400">Resolution</span>
                        <span className="text-white text-xs truncate ml-2">
                          {new Date(market.resolutionTime * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link href={`/markets/${market.id}`}>
                      <Button variant="outline" className="w-full gap-1.5 sm:gap-2 text-xs sm:text-sm" size="sm">
                        View Details
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </Link>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="p-12 text-center">
                <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">You haven't created any markets yet</h3>
                <p className="text-gray-400 mb-6">
                  Create your first prediction market to get started
                </p>
                <Link href="/create">
                  <Button className="gap-2">
                    Create Market
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </GlassCard>
            )}
          </TabsContent>

          {/* My Positions Tab */}
          <TabsContent value="positions">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : userPositions.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {userPositions.map((position) => (
                  <GlassCard key={position.marketId} className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-white break-words">
                            {position.market?.question || `Market #${position.marketId}`}
                          </h3>
                          <Badge
                            variant="outline"
                            className={
                              position.market?.status === MARKET_STATUS.ACTIVE
                                ? 'border-green-500/30 text-green-400'
                                : position.market?.status === MARKET_STATUS.RESOLVED
                                ? 'border-blue-500/30 text-blue-400'
                                : 'border-gray-500/30 text-gray-400'
                            }
                          >
                            {position.market?.status === MARKET_STATUS.ACTIVE
                              ? 'Active'
                              : position.market?.status === MARKET_STATUS.RESOLVED
                              ? 'Resolved'
                              : 'Unknown'}
                          </Badge>
                          {position.claimed && (
                            <Badge variant="outline" className="border-green-500/30 text-green-400">
                              Claimed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          {position.market?.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">YES Shares</p>
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">
                          {(Number(position.yesShares) / 1e18).toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">NO Shares</p>
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">
                          {(Number(position.noShares) / 1e18).toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total Invested</p>
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">
                          {(Number(position.totalInvested) / 1e18).toFixed(4)} BNB
                        </p>
                      </div>
                      {position.market?.status === MARKET_STATUS.RESOLVED && position.potentialPayout > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Winnings</p>
                          <p className="text-xs sm:text-sm font-semibold text-green-400 truncate">
                            {!position.claimed
                              ? `${(Number(position.potentialPayout) / 1e18).toFixed(4)} BNB`
                              : 'Claimed'}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Link href={`/markets/${position.marketId}`} className="flex-1 sm:flex-initial">
                        <Button variant="outline" className="w-full sm:w-auto gap-1.5 sm:gap-2 text-xs sm:text-sm" size="sm">
                          View Market
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </Link>
                      {position.market?.status === MARKET_STATUS.RESOLVED &&
                        position.potentialPayout > 0 &&
                        !position.claimed && (
                          <div className="flex-1 sm:flex-initial">
                            <ClaimButton marketId={position.marketId} />
                          </div>
                        )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="p-12 text-center">
                <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">You don't have any bets yet</h3>
                <p className="text-gray-400 mb-6">
                  Explore markets and place your first bet
                </p>
                <Link href="/markets">
                  <Button className="gap-2">
                    Explore Markets
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </GlassCard>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

