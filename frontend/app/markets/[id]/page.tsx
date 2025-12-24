'use client';

import { use } from 'react';
import { useMarket } from '@/lib/hooks/useMarkets';
import { BettingPanel } from '@/components/markets/BettingPanel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/effects/GlassCard';
import { ArrowLeft, Clock, Users, TrendingUp, TrendingDown, Shield, Brain, ExternalLink, Loader2, Zap, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { MARKET_STATUS, MARKET_TYPES } from '@/lib/config/constants';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import { Skeleton } from '@/components/ui/skeleton';
import { useActiveAccount } from 'thirdweb/react';
import { analyzeMarket } from '@/lib/services/ai/gemini';
import { toast } from 'sonner';
import { useState, useEffect, useMemo } from 'react';
import { useBNBBalance } from '@/lib/hooks/useBNBBalance';
import { formatModelName } from '@/lib/utils/model-formatter';
import { useInitiateResolution } from '@/lib/hooks/markets/useCreateMarket';
import { useMarketActivity } from '@/lib/hooks/useMarketActivity';


export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const marketId = parseInt(id);
  const { market, loading: isLoading, refetch: refetchMarket } = useMarket(marketId);
  const account = useActiveAccount();
  const { balance: userBalance } = useBNBBalance();
  const [analyzingMarket, setAnalyzingMarket] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState<any>(null);
  const { initiateResolution, isPending: isInitiatingResolution } = useInitiateResolution();
  const { activities, loading: activitiesLoading } = useMarketActivity(marketId);
  
  // Calculate unique participants count using ONLY real activity data from contract
  // No estimations - only count actual participants from activities
  const participantsCount = useMemo(() => {
    if (!activities || activities.length === 0) {
      // If no activities loaded yet, return 0 (not an estimation)
      return 0;
    }
    
    // Count unique participants from actual activities
    const uniqueParticipants = new Set<string>();
    activities.forEach((activity) => {
      if (activity.user && (activity.type === 'bet' || activity.type === 'claim')) {
        uniqueParticipants.add(activity.user.toLowerCase());
      }
    });
    
    // Return actual count from contract activities - no estimations
    return uniqueParticipants.size;
  }, [activities]);

  // Refetch actividad cuando se actualiza el mercado
  useEffect(() => {
    if (market) {
      // El hook useMarketActivity ya se actualiza automáticamente cada 10 segundos
      // pero también podemos forzar un refresh cuando el mercado cambia
    }
  }, [market]);

  // Listen when resolution is completed manually
  useEffect(() => {
    const handleMarketResolved = (event: CustomEvent) => {
      const eventMarketId = event.detail?.marketId;
      if (eventMarketId === marketId) {
        console.log(`✅ Market #${marketId} resolved! Refetching...`);
        refetchMarket();
        toast.success(`Market #${marketId} has been resolved!`, {
          duration: 5000,
        });
      }
    };

    window.addEventListener('marketResolved' as any, handleMarketResolved);
    return () => {
      window.removeEventListener('marketResolved' as any, handleMarketResolved);
    };
  }, [marketId, refetchMarket]);

  const handleAnalyzeMarket = async () => {
    if (!market?.question) {
      toast.error('No market information to analyze');
      return;
    }

    setAnalyzingMarket(true);
    try {
      const result = await analyzeMarket(market.question, market.description || '');
      if (result.success && result.data) {
        setMarketAnalysis(result.data);
        toast.success(`Analysis completed with ${formatModelName(result.modelUsed)}`);
      } else {
        toast.error(result.error || 'Error analyzing market');
      }
    } catch (error: any) {
      toast.error('Error analyzing market');
      console.error(error);
    } finally {
      setAnalyzingMarket(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Calcular odds desde los pools del mercado
  const totalPool = market ? Number(market.yesPool) + Number(market.noPool) : 0;
  const yesOdds = market && totalPool > 0 ? (Number(market.yesPool) / totalPool) * 100 : 50;
  const noOdds = market && totalPool > 0 ? (Number(market.noPool) / totalPool) * 100 : 50;
  
  // Verificar si el mercado venció
  const currentTime = Math.floor(Date.now() / 1000);
  const hasExpired = market && market.resolutionTime <= currentTime;
  const isResolved = market?.status === MARKET_STATUS.RESOLVED;
  const isResolving = market?.status === MARKET_STATUS.RESOLVING;
  const isActive = market?.status === MARKET_STATUS.ACTIVE;
  
  const timeRemaining = market 
    ? (hasExpired 
        ? 'Expired' 
        : formatDistanceToNow(new Date(Number(market.resolutionTime) * 1000), { addSuffix: true }))
    : '';
  const resolutionDate = market ? format(new Date(Number(market.resolutionTime) * 1000), 'PPP p') : '';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/markets">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Markets
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Market Header */}
            <GlassCard className="p-6 sm:p-8 md:p-10 relative overflow-hidden">
              {/* Background gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 pointer-events-none" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className="text-xs sm:text-sm px-3 py-1.5 border-purple-400/30 text-purple-300 bg-purple-500/10 backdrop-blur-sm">
                      Binary Market
                    </Badge>
                    {(() => {
                      // Si venció pero aún está marcado como Active en el contrato
                      if (hasExpired && isActive && !isResolved) {
                        return (
                          <Badge className="text-xs sm:text-sm px-3 py-1.5 bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-200 border-orange-500/40 backdrop-blur-sm shadow-lg shadow-orange-500/20 animate-pulse">
                            ⏰ Expired - Pending Resolution
                          </Badge>
                        );
                      }
                      
                      // Estado normal del contrato
                      return (
                        <Badge className={`text-xs sm:text-sm px-3 py-1.5 backdrop-blur-sm shadow-lg ${
                          isResolved
                            ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-200 border-blue-500/40 shadow-blue-500/20'
                            : isResolving
                            ? 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-200 border-yellow-500/40 shadow-yellow-500/20 animate-pulse'
                            : isActive && !hasExpired
                            ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-200 border-green-500/40 shadow-green-500/20'
                            : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                        }`}>
                          {isResolved
                            ? 'Resolved'
                            : isResolving
                            ? 'Resolving'
                            : isActive && !hasExpired
                            ? 'Active'
                            : hasExpired
                            ? 'Expired'
                            : 'Pending'}
                        </Badge>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
                    <span className="text-xs sm:text-sm font-semibold text-purple-200">Insured</span>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 sm:mb-8 break-words leading-tight bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                  {market?.question || `Market #${marketId}`}
                </h1>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
                <div className={`group p-4 sm:p-5 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  hasExpired && !isResolved
                    ? 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30 hover:border-orange-500/50 hover:shadow-orange-500/20'
                    : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50 hover:shadow-purple-500/20'
                }`}>
                  <div className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm mb-2 font-medium">
                    <Clock className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110 ${hasExpired && !isResolved ? 'text-orange-400' : 'text-purple-400'}`} />
                    <span className="truncate">{hasExpired && !isResolved ? 'Expired' : 'Closes'}</span>
                  </div>
                  <div className={`font-bold text-base sm:text-lg md:text-xl truncate ${
                    hasExpired && !isResolved ? 'text-orange-300' : 'text-white'
                  }`}>
                    {hasExpired && !isResolved 
                      ? `${formatDistanceToNow(new Date(Number(market?.resolutionTime) * 1000), { addSuffix: true })}`
                      : timeRemaining}
                  </div>
                </div>

                <div className="group p-4 sm:p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20">
                  <div className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm mb-2 font-medium">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 transition-transform group-hover:scale-110" />
                    <span className="truncate">Participants</span>
                  </div>
                  <div className="text-white font-bold text-base sm:text-lg md:text-xl">{participantsCount}</div>
                </div>

                <div className="group p-4 sm:p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20">
                  <div className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm mb-2 font-medium">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 transition-transform group-hover:scale-110" />
                    <span className="truncate">Volume</span>
                  </div>
                  <div className="text-white font-bold text-base sm:text-lg md:text-xl">
                    {market ? `$${((Number(market.yesPool || 0) + Number(market.noPool || 0)) / 1e18).toFixed(2)}` : '$0.00'}
                  </div>
                </div>

                <div className="group p-4 sm:p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
                  <div className="flex items-center gap-2 text-gray-300 text-xs sm:text-sm mb-2 font-medium">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 transition-transform group-hover:scale-110" />
                    <span className="truncate">Oracle</span>
                  </div>
                  <div className="text-white font-bold text-base sm:text-lg md:text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI 5x</div>
                </div>
              </div>

              {market?.description && (
                <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-white/5 to-purple-500/5 border border-white/10 backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
                    Description
                  </h3>
                  <p className="text-gray-200 leading-relaxed text-xs sm:text-sm">{market.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                {/* Show Initiate Resolution button if market expired but not resolved */}
                {hasExpired && isActive && !isResolved && account && (
                  <Button
                    onClick={async () => {
                      try {
                        await initiateResolution(marketId);
                        // Refetch inmediatamente después de iniciar la resolución
                        setTimeout(() => {
                          refetchMarket();
                        }, 2000);
                      } catch (error: any) {
                        // Error already handled by hook
                      }
                    }}
                    disabled={isInitiatingResolution}
                    className="w-full h-12 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 hover:from-orange-700 hover:via-red-700 hover:to-orange-700 text-white font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02]"
                  >
                    {isInitiatingResolution ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Initiating Resolution...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Initiate Resolution
                      </>
                    )}
                  </Button>
                )}

                {/* Show Resolving status with auto-refresh indicator */}
                {isResolving && (
                  <div className="w-full p-5 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
                        <span className="text-yellow-300 font-bold text-base">Resolving...</span>
                      </div>
                      <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">Auto-refreshing every 30s</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      The AI Oracle is processing the resolution. This page will update automatically when complete.
                    </p>
                  </div>
                )}
                
                {/* AI Analysis Button */}
                <Button
                  onClick={handleAnalyzeMarket}
                  disabled={analyzingMarket || !market?.question}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] bg-[length:200%_auto] hover:bg-[position:100%_center]"
                >
                  {analyzingMarket ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-5 w-5" />
                      Analyze Market with AI
                    </>
                  )}
                </Button>
              </div>

              {/* AI Analysis Results */}
              {marketAnalysis && (
                <div className="mt-6 p-5 sm:p-6 rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/30 backdrop-blur-sm shadow-lg shadow-purple-500/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold flex items-center gap-2 text-purple-300">
                      <Brain className="h-5 w-5 text-purple-400" />
                      AI Analysis
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm shadow-lg ${
                        marketAnalysis.answer === 'YES' ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-200 border border-green-500/40 shadow-green-500/20' :
                        marketAnalysis.answer === 'NO' ? 'bg-gradient-to-r from-red-500/30 to-rose-500/30 text-red-200 border border-red-500/40 shadow-red-500/20' :
                        'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-200 border border-yellow-500/40 shadow-yellow-500/20'
                      }`}>
                        {marketAnalysis.answer}
                      </span>
                      <span className="text-xs text-gray-300 bg-white/5 px-2 py-1 rounded font-medium">
                        {marketAnalysis.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{marketAnalysis.reasoning}</p>
                </div>
              )}
              </div>
            </GlassCard>

            {/* Tabs */}
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="w-full bg-white/5 backdrop-blur-sm border border-white/10">
                <TabsTrigger value="activity" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-400 transition-all">Activity</TabsTrigger>
                <TabsTrigger value="resolution" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-400 transition-all">Resolution</TabsTrigger>
                <TabsTrigger value="info" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-400 transition-all">Info</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-6">
                <GlassCard className="p-6 sm:p-8 relative overflow-hidden">
                  {/* Background gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 pointer-events-none" />
                  
                  <div className="relative z-10">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {activitiesLoading ? (
                        <div className="text-center py-16 text-gray-400">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-400" />
                          <p className="text-sm">Loading activity...</p>
                        </div>
                      ) : !activities || activities.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                          <TrendingUp className="w-8 h-8 text-purple-400" />
                        </div>
                        <p className="text-gray-300 font-medium mb-1">No activity yet</p>
                        <p className="text-sm text-gray-500">Be the first to bet!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="group p-5 sm:p-6 rounded-xl bg-gradient-to-br from-white/5 via-purple-500/5 to-pink-500/5 border border-white/10 hover:border-purple-500/40 hover:bg-gradient-to-br hover:from-white/10 hover:via-purple-500/10 hover:to-pink-500/10 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.01] backdrop-blur-sm"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {activity.type === 'bet' && (
                                  <div className={`p-3 rounded-xl backdrop-blur-sm shadow-lg transition-transform group-hover:scale-110 ${
                                    activity.isYes 
                                      ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 text-green-300 border border-green-500/40 shadow-green-500/20' 
                                      : 'bg-gradient-to-br from-red-500/30 to-rose-500/30 text-red-300 border border-red-500/40 shadow-red-500/20'
                                  }`}>
                                    {activity.isYes ? (
                                      <TrendingUp className="w-5 h-5" />
                                    ) : (
                                      <TrendingDown className="w-5 h-5" />
                                    )}
                                  </div>
                                )}
                                {activity.type === 'resolution' && (
                                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                                    <CheckCircle2 className="w-5 h-5" />
                                  </div>
                                )}
                                {activity.type === 'claim' && (
                                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                                    <DollarSign className="w-5 h-5" />
                                  </div>
                                )}
                                {activity.type === 'resolution_initiated' && (
                                  <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/30 to-amber-500/30 text-yellow-300 border border-yellow-500/40 shadow-lg shadow-yellow-500/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                                    <Clock className="w-5 h-5" />
                                  </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-base font-bold text-white">
                                      {activity.type === 'bet' && (
                                        <>
                                          <span className={activity.isYes ? 'text-green-400' : 'text-red-400'}>
                                            {activity.isYes ? 'YES' : 'NO'}
                                          </span> Bet Placed
                                        </>
                                      )}
                                      {activity.type === 'resolution' && (
                                        <>
                                          Market Resolved: <span className="text-blue-400">{
                                            activity.outcome === 1 ? 'YES' :
                                            activity.outcome === 2 ? 'NO' :
                                            'INVALID'
                                          }</span>
                                        </>
                                      )}
                                      {activity.type === 'claim' && (
                                        <span className="text-purple-400">Winnings Claimed</span>
                                      )}
                                      {activity.type === 'resolution_initiated' && (
                                        <span className="text-yellow-400">Resolution Initiated</span>
                                      )}
                                    </span>
                                  </div>
                                  
                                  {activity.user && (
                                    <div className="text-xs text-gray-400 mb-2 font-mono bg-white/5 px-2 py-1 rounded inline-block">
                                      {activity.user.slice(0, 6)}...{activity.user.slice(-4)}
                                    </div>
                                  )}
                                  
                                  {activity.amount && (
                                    <div className="text-sm text-gray-200 mb-2">
                                      <span className="font-semibold text-white">Amount:</span> <span className="text-green-400 font-bold">{(Number(activity.amount) / 1e18).toFixed(4)} BNB</span>
                                      {activity.shares && (
                                        <span className="text-gray-400 ml-2 text-xs">
                                          ({Number(activity.shares) / 1e18} shares)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                                    <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                                      {formatDistanceToNow(new Date(activity.timestamp * 1000), { addSuffix: true })}
                                    </span>
                                    {activity.transactionHash && (
                                      <a
                                        href={`https://testnet.opbnbscan.com/tx/${activity.transactionHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-1 rounded transition-colors border border-purple-500/20 hover:border-purple-500/40"
                                      >
                                        View TX
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    </div>
                  </div>
                </GlassCard>
              </TabsContent>

              <TabsContent value="resolution" className="mt-6">
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Resolution Details</h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
                      <div className="text-sm text-gray-400 mb-1">Resolution Date</div>
                      <div className="text-white font-semibold">{resolutionDate}</div>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Oracle Method</div>
                          <div className="text-white font-semibold mb-2">Multi-AI Consensus (Gemini, Llama, Mistral)</div>
                        </div>
                        <Brain className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="text-sm text-gray-300 space-y-2">
                        <p>
                          This market will be resolved using our multi-AI consensus system, querying 5 AI models (Gemini, Llama, Mistral) in priority order:
                        </p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          <li>Gemini (Priority 1)</li>
                          <li>Llama 3.1 (Priority 2)</li>
                          <li>Mistral 7B (Priority 3)</li>
                          <li>Llama 3.2 3B (Priority 4)</li>
                          <li>Gemini Flash (Priority 5)</li>
                        </ul>
                        <p className="mt-2">
                          Sequential query with automatic fallback if a model fails. 80%+ consensus required for resolution. If consensus fails, the insurance pool activates automatically.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                      <div className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Insurance Protection</div>
                          <div className="text-sm text-gray-300">
                            If oracle consensus fails (&lt;80%), all bettors receive 100% refund from insurance pool.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </TabsContent>

              <TabsContent value="info" className="mt-6">
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Market Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-3 border-b border-white/10">
                      <span className="text-gray-400">Market ID</span>
                      <span className="text-white font-mono">#{marketId}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/10">
                      <span className="text-gray-400">Creator</span>
                      <span className="text-white font-mono text-sm">
                        {market?.creator ? `${market.creator.slice(0, 6)}...${market.creator.slice(-4)}` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/10">
                      <span className="text-gray-400">Created</span>
                      <span className="text-white">
                        {market ? format(new Date(Number(market.createdAt) * 1000), 'PPP') : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/10">
                      <span className="text-gray-400">Trading Fee</span>
                      <span className="text-white">0.5%</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-gray-400">Insurance Premium</span>
                      <span className="text-white">0.1%</span>
                    </div>
                  </div>

                  <a
                    href={`https://testnet.opbnbscan.com/address/${CONTRACT_ADDRESSES.PREDICTION_MARKET}#code`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full mt-6 gap-2">
                      View on opBNBScan
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </GlassCard>
              </TabsContent>
            </Tabs>
          </div>

          {/* Betting Panel */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="sticky top-20 lg:top-24">
              <BettingPanel
                marketId={marketId}
                yesOdds={yesOdds}
                noOdds={noOdds}
                userBalance={userBalance}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
