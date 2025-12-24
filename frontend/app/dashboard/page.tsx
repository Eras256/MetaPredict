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
  Brain,
  Loader2,
  TrendingDown,
  CheckCircle,
  Shield,
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
import { useInsuranceClaims } from '@/lib/hooks/insurance/useInsuranceClaims';
import { analyzePortfolioRebalance } from '@/lib/services/ai/gemini';
import { formatModelName } from '@/lib/utils/model-formatter';
import Link from 'next/link';
import { formatAddress } from '@/lib/utils/blockchain';
import { MARKET_STATUS } from '@/lib/config/constants';
import { toast } from 'sonner';
import { PortfolioView } from '@/components/aggregation/PortfolioView';
import { UserProfile } from '@/components/users/UserProfile';
import { PendingCrossChainBets } from '@/components/markets/PendingCrossChainBets';

export default function DashboardPage() {
  const account = useActiveAccount();
  const { balance } = useBNBBalance();
  const { stakedAmount, reputationScore, tier } = useReputation();
  const { userMarkets, userPositions, stats, loading, refresh } = useUserDashboard();
  const { claims } = useInsuranceClaims();
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Filter active vs resolved positions
  const activePositions = userPositions.filter((pos) => {
    return pos.market?.status === MARKET_STATUS.ACTIVE || pos.market?.status === MARKET_STATUS.RESOLVING;
  });

  const resolvedPositions = userPositions.filter((pos) => {
    return pos.market?.status === MARKET_STATUS.RESOLVED;
  });

  // Pending winnings claims (resolved markets with unclaimed payout)
  const pendingWinningsClaims = resolvedPositions.filter((pos) => {
    return pos.potentialPayout > 0 && !pos.claimed;
  });

  const handleAnalyzePortfolio = async () => {
    if (activePositions.length === 0) {
      toast.error('No active positions to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      const positionsData = activePositions.map(p => ({
        marketId: p.marketId,
        question: p.market?.question || `Market #${p.marketId}`,
        yesShares: Number(p.yesShares) / 1e18,
        noShares: Number(p.noShares) / 1e18,
        totalValue: Number(p.totalInvested) / 1e18,
      }));

      const result = await analyzePortfolioRebalance(positionsData);
      if (result.success && result.data) {
        setAnalysisResult(result.data);
        toast.success(`Analysis completed with ${formatModelName(result.modelUsed)}`);
      } else {
        toast.error(result.error || 'Error analyzing portfolio');
      }
    } catch (error: any) {
      toast.error('Error analyzing portfolio');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const ClaimButton = ({ marketId, marketType }: { marketId: number; marketType?: number }) => {
    // Determinar el tipo de mercado (0=Binary, 1=Conditional, 2=Subjective)
    const marketTypeStr: 'binary' | 'conditional' | 'subjective' = 
      marketType === 1 ? 'conditional' : 
      marketType === 2 ? 'subjective' : 
      'binary';
    const { claim, isPending } = useClaimWinnings(marketId, marketTypeStr);
    
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
    <div className="min-h-screen py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                My Dashboard
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Manage your markets, bets, and statistics
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              variant="outline"
              className="gap-2 w-full sm:w-auto"
              size="sm"
            >
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-xs sm:text-sm">Refresh</span>
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
              {stats.expiredPendingResolution > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-yellow-400">Pending Resolution</span>
                  <span className="text-base sm:text-lg font-semibold text-yellow-400">
                    {loading ? <Skeleton className="h-5 sm:h-6 w-10 sm:w-12" /> : stats.expiredPendingResolution}
                  </span>
                </div>
              )}
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
            </div>
          </GlassCard>
        </div>

        {/* AI Analysis Button */}
        {activePositions.length > 0 && (
          <div className="mb-6">
            <Button
              onClick={handleAnalyzePortfolio}
              disabled={analyzing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Analyze Portfolio with AI
                </>
              )}
            </Button>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <GlassCard className="p-6 mb-6 border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                Portfolio Analysis
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                analysisResult.riskScore < 30 ? 'bg-green-500/20 text-green-400' :
                analysisResult.riskScore < 70 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                Risk: {analysisResult.riskScore}/100
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-4">{analysisResult.overallRecommendation}</p>
            {analysisResult.allocations && analysisResult.allocations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Recommendations:</h4>
                {analysisResult.allocations.map((allocation: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Market #{allocation.marketId}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        allocation.recommendedAction === 'increase' ? 'bg-green-500/20 text-green-400' :
                        allocation.recommendedAction === 'decrease' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {allocation.recommendedAction === 'increase' ? 'Increase' :
                         allocation.recommendedAction === 'decrease' ? 'Decrease' : 'Maintain'}
                        {allocation.recommendedAction === 'increase' && <TrendingUp className="inline ml-1 h-3 w-3" />}
                        {allocation.recommendedAction === 'decrease' && <TrendingDown className="inline ml-1 h-3 w-3" />}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{allocation.reasoning}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* Tabs for Markets, Positions, Portfolio, History, and Claims */}
        <Tabs defaultValue="markets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="markets" className="gap-2 text-xs">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Markets</span>
              <span className="sm:hidden">Mkts</span>
              ({userMarkets.length})
            </TabsTrigger>
            <TabsTrigger value="positions" className="gap-2 text-xs">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Bets</span>
              <span className="sm:hidden">Bets</span>
              ({userPositions.length})
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-2 text-xs">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio</span>
              <span className="sm:hidden">Port</span>
              ({activePositions.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 text-xs">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">Hist</span>
              ({resolvedPositions.length})
            </TabsTrigger>
            <TabsTrigger value="claims" className="gap-2 text-xs">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Claims</span>
              <span className="sm:hidden">Claims</span>
              ({pendingWinningsClaims.length + claims.length})
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
                        {(() => {
                          const currentTime = Math.floor(Date.now() / 1000);
                          const hasExpired = market.resolutionTime <= currentTime;
                          const isResolved = market.status === MARKET_STATUS.RESOLVED;
                          const isResolving = market.status === MARKET_STATUS.RESOLVING;
                          const isActive = market.status === MARKET_STATUS.ACTIVE;
                          
                          // Si venció pero aún está marcado como Active en el contrato
                          if (hasExpired && isActive && !isResolved) {
                            return (
                              <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">
                                ⏰ Expired
                              </Badge>
                            );
                          }
                          
                          return (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                isResolved
                                  ? 'border-blue-500/30 text-blue-400'
                                  : isResolving
                                  ? 'border-yellow-500/30 text-yellow-400'
                                  : isActive && !hasExpired
                                  ? 'border-green-500/30 text-green-400'
                                  : 'border-gray-500/30 text-gray-400'
                              }`}
                            >
                              {isResolved
                                ? 'Resolved'
                                : isResolving
                                ? 'Resolving'
                                : isActive && !hasExpired
                                ? 'Active'
                                : hasExpired
                                ? 'Expired'
                                : 'Unknown'}
                            </Badge>
                          );
                        })()}
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
                          {(() => {
                            const currentTime = Math.floor(Date.now() / 1000);
                            const hasExpired = position.market?.resolutionTime && position.market.resolutionTime <= currentTime;
                            const isResolved = position.market?.status === MARKET_STATUS.RESOLVED;
                            const isResolving = position.market?.status === MARKET_STATUS.RESOLVING;
                            const isActive = position.market?.status === MARKET_STATUS.ACTIVE;
                            
                            // Si venció pero aún está marcado como Active en el contrato, mostrar como "Expired"
                            if (hasExpired && isActive && !isResolved) {
                              return (
                                <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                                  ⏰ Expired - Pending Resolution
                                </Badge>
                              );
                            }
                            
                            // Estado normal del contrato
                            return (
                              <Badge
                                variant="outline"
                                className={
                                  isResolved
                                    ? 'border-blue-500/30 text-blue-400'
                                    : isResolving
                                    ? 'border-yellow-500/30 text-yellow-400'
                                    : isActive && !hasExpired
                                    ? 'border-green-500/30 text-green-400'
                                    : 'border-gray-500/30 text-gray-400'
                                }
                              >
                                {isResolved
                                  ? 'Resolved'
                                  : isResolving
                                  ? 'Resolving'
                                  : isActive && !hasExpired
                                  ? 'Active'
                                  : hasExpired
                                  ? 'Expired'
                                  : 'Unknown'}
                              </Badge>
                            );
                          })()}
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
                      {(() => {
                        // Only show winnings for markets that are actually resolved in the contract
                        // No estimations - only real resolved outcomes
                        const isResolved = position.market?.status === MARKET_STATUS.RESOLVED;
                        const showWinnings = isResolved && position.potentialPayout > 0;
                        
                        if (showWinnings) {
                          return (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Winnings</p>
                              <p className="text-xs sm:text-sm font-semibold truncate text-green-400">
                                {!position.claimed
                                  ? `${(Number(position.potentialPayout) / 1e18).toFixed(4)} BNB`
                                  : 'Claimed'}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
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
                            <ClaimButton marketId={position.marketId} marketType={position.market?.marketType} />
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

          {/* Portfolio Tab - Active Positions */}
          <TabsContent value="portfolio">
            <div className="space-y-6">
              {/* Cross-Chain Portfolio View */}
              <PortfolioView />
              
              {/* Active Positions */}
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : activePositions.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Active Positions</h3>
                  <div className="space-y-3">
                    {activePositions.map((position) => (
                <GlassCard key={position.marketId} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{position.market?.question || `Market #${position.marketId}`}</h3>
                        <Badge
                          variant="outline"
                          className={
                            position.market?.status === MARKET_STATUS.ACTIVE
                              ? 'border-green-500/30 text-green-400'
                              : position.market?.status === MARKET_STATUS.RESOLVING
                              ? 'border-yellow-500/30 text-yellow-400'
                              : 'border-gray-500/30 text-gray-400'
                          }
                        >
                          {position.market?.status === MARKET_STATUS.ACTIVE
                            ? 'Active'
                            : position.market?.status === MARKET_STATUS.RESOLVING
                            ? 'Resolving'
                            : 'Unknown'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                        <div>
                          <span className="text-gray-400">YES Shares:</span>
                          <span className="ml-2 text-white font-semibold">
                            {(Number(position.yesShares) / 1e18).toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">NO Shares:</span>
                          <span className="ml-2 text-white font-semibold">
                            {(Number(position.noShares) / 1e18).toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Total Invested:</span>
                          <span className="ml-2 text-white font-semibold">
                            {(Number(position.totalInvested) / 1e18).toFixed(4)} BNB
                          </span>
                        </div>
                        {position.market?.status === MARKET_STATUS.RESOLVED && position.potentialPayout > 0 && (
                          <div>
                            <span className="text-gray-400">Potential Payout:</span>
                            <span className="ml-2 text-green-400 font-semibold">
                              {position.claimed ? 'Claimed' : `${(Number(position.potentialPayout) / 1e18).toFixed(4)} BNB`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/markets/${position.marketId}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          View Market
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      {position.market?.status === MARKET_STATUS.RESOLVED &&
                        position.potentialPayout > 0 &&
                        !position.claimed && (
                          <ClaimButton marketId={position.marketId} marketType={position.market?.marketType} />
                        )}
                    </div>
                  </div>
                </GlassCard>
                    ))}
                  </div>
                </div>
              ) : (
                <GlassCard className="p-12 text-center">
                  <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No active positions</p>
                  <p className="text-gray-500 text-sm mt-2">Explore markets and place your first bet</p>
                  <Link href="/markets" className="mt-4 inline-block">
                    <Button>Explore Markets</Button>
                  </Link>
                </GlassCard>
              )}
            </div>
          </TabsContent>

          {/* History Tab - Resolved Positions */}
          <TabsContent value="history">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : resolvedPositions.length > 0 ? (
              resolvedPositions.map((position) => (
                <GlassCard key={position.marketId} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{position.market?.question || `Market #${position.marketId}`}</h3>
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                          Resolved
                        </Badge>
                        {position.claimed && (
                          <Badge variant="outline" className="border-green-500/30 text-green-400">
                            Claimed
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                        <div>
                          <span className="text-gray-400">Total Invested:</span>
                          <span className="ml-2 text-white font-semibold">
                            {(Number(position.totalInvested) / 1e18).toFixed(4)} BNB
                          </span>
                        </div>
                        {position.potentialPayout > 0 && (
                          <div>
                            <span className="text-gray-400">Payout:</span>
                            <span className="ml-2 text-green-400 font-semibold">
                              {position.claimed ? 'Claimed' : `${(Number(position.potentialPayout) / 1e18).toFixed(4)} BNB`}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-400">Outcome:</span>
                          <span className="ml-2 text-white font-semibold">
                            {position.market?.outcome === 1 ? 'YES' : position.market?.outcome === 2 ? 'NO' : 'Invalid'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                    <Link href={`/markets/${position.marketId}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        View Market
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                      {position.market?.status === MARKET_STATUS.RESOLVED &&
                        position.potentialPayout > 0 &&
                        !position.claimed && (
                          <ClaimButton marketId={position.marketId} marketType={position.market?.marketType} />
                        )}
                    </div>
                  </div>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="p-12 text-center">
                <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No resolved positions yet</p>
              </GlassCard>
            )}
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : pendingWinningsClaims.length > 0 || claims.length > 0 ? (
              <div className="space-y-4">
                {/* Winnings Claims (mercados resueltos con payout pendiente) */}
                {pendingWinningsClaims.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      Winnings to Claim ({pendingWinningsClaims.length})
                    </h3>
                    <div className="space-y-3">
                      {pendingWinningsClaims.map((position) => (
                        <GlassCard key={`winnings-${position.marketId}`} className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-2">{position.market?.question || `Market #${position.marketId}`}</h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-400">Market ID:</span>
                                  <span className="ml-2 text-white font-semibold">#{position.marketId}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Payout:</span>
                                  <span className="ml-2 text-green-400 font-semibold">
                                    {(Number(position.potentialPayout) / 1e18).toFixed(4)} BNB
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Outcome:</span>
                                  <span className="ml-2 text-white font-semibold">
                                    {position.market?.outcome === 1 ? 'YES' : position.market?.outcome === 2 ? 'NO' : 'Invalid'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <ClaimButton marketId={position.marketId} marketType={position.market?.marketType} />
                              <Link href={`/markets/${position.marketId}`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                  View Market
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insurance Claims */}
                {claims.length > 0 && (
                  <div className={pendingWinningsClaims.length > 0 ? 'mt-6' : ''}>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-yellow-400" />
                      Insurance Claims ({claims.length})
                    </h3>
                    <div className="space-y-3">
                      {claims.map((claim) => (
                <GlassCard key={claim.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{claim.question}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Market ID:</span>
                          <span className="ml-2 text-white font-semibold">#{claim.marketId}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Amount:</span>
                          <span className="ml-2 text-white font-semibold">
                            {(Number(claim.invested) / 1e18).toFixed(4)} BNB
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <Badge className="ml-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            {claim.status}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-400">Reason:</span>
                          <span className="ml-2 text-gray-300">{claim.reason}</span>
                        </div>
                      </div>
                    </div>
                    <Link href="/insurance">
                      <Button variant="outline" size="sm">
                        Claim Insurance
                      </Button>
                    </Link>
                  </div>
                </GlassCard>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <GlassCard className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No pending claims</p>
                <p className="text-gray-500 text-sm mt-2">All your positions are protected and winnings are claimed</p>
              </GlassCard>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

