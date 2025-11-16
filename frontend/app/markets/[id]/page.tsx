'use client';

import { use } from 'react';
import { useMarketDetails } from '@/lib/hooks/markets/useMarkets';
import { BettingPanel } from '@/components/markets/BettingPanel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/effects/GlassCard';
import { ArrowLeft, Clock, Users, TrendingUp, Shield, Brain, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { MARKET_STATUS, MARKET_TYPES } from '@/lib/config/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { useReadContract } from 'wagmi';
import { useActiveAccount } from 'thirdweb/react';
import { CONTRACTS } from '@/lib/config/constants';
import { formatUnits } from 'viem';
import { analyzeMarket } from '@/lib/services/ai/gemini';
import { toast } from 'sonner';
import { useState } from 'react';

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

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const marketId = parseInt(id);
  const { marketInfo, marketData, odds, isLoading } = useMarketDetails(marketId);
  const account = useActiveAccount();
  const [analyzingMarket, setAnalyzingMarket] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState<any>(null);
  
  const { data: balance } = useReadContract({
    address: CONTRACTS.USDC as `0x${string}`,
    abi: USDCABI,
    functionName: 'balanceOf',
    args: [account?.address as `0x${string}`],
    query: { enabled: !!account },
  });

  const userBalance = balance ? Number(formatUnits(balance, 6)) : 0;

  const handleAnalyzeMarket = async () => {
    if (!marketData?.question) {
      toast.error('No hay información del mercado para analizar');
      return;
    }

    setAnalyzingMarket(true);
    try {
      const result = await analyzeMarket(marketData.question, marketData.description);
      if (result.success && result.data) {
        setMarketAnalysis(result.data);
        toast.success(`Análisis completado con ${result.modelUsed}`);
      } else {
        toast.error(result.error || 'Error al analizar mercado');
      }
    } catch (error: any) {
      toast.error('Error al analizar mercado');
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

  const yesOdds = odds ? Number(odds[0]) / 100 : 50;
  const noOdds = odds ? Number(odds[1]) / 100 : 50;
  const timeRemaining = marketInfo ? formatDistanceToNow(new Date(Number(marketInfo.resolutionTime) * 1000), { addSuffix: true }) : '';
  const resolutionDate = marketInfo ? format(new Date(Number(marketInfo.resolutionTime) * 1000), 'PPP p') : '';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/markets">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Markets
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Market Header */}
            <GlassCard className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {MARKET_TYPES[marketInfo?.marketType as keyof typeof MARKET_TYPES]}
                  </Badge>
                  <Badge className="text-xs bg-green-500/20 text-green-300">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-purple-300">Insured</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-white mb-6">
                {marketData?.question || `Market #${marketId}`}
              </h1>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    Closes
                  </div>
                  <div className="text-white font-semibold">{timeRemaining}</div>
                </div>

                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    Participants
                  </div>
                  <div className="text-white font-semibold">0</div>
                </div>

                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Volume
                  </div>
                  <div className="text-white font-semibold">$0</div>
                </div>

                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Brain className="w-4 h-4" />
                    Oracle
                  </div>
                  <div className="text-white font-semibold">AI 5x</div>
                </div>
              </div>

              {marketData?.description && (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Description</h3>
                  <p className="text-gray-300">{marketData.description}</p>
                </div>
              )}

              {/* AI Analysis Button */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <Button
                  onClick={handleAnalyzeMarket}
                  disabled={analyzingMarket || !marketData?.question}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {analyzingMarket ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analizando con AI...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analizar Mercado con AI
                    </>
                  )}
                </Button>
              </div>

              {/* AI Analysis Results */}
              {marketAnalysis && (
                <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-purple-400">
                      <Brain className="h-4 w-4" />
                      Análisis AI
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        marketAnalysis.answer === 'YES' ? 'bg-green-500/20 text-green-400' :
                        marketAnalysis.answer === 'NO' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {marketAnalysis.answer}
                      </span>
                      <span className="text-xs text-gray-400">
                        {marketAnalysis.confidence}% confianza
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{marketAnalysis.reasoning}</p>
                </div>
              )}
            </GlassCard>

            {/* Tabs */}
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                <TabsTrigger value="resolution" className="flex-1">Resolution</TabsTrigger>
                <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-6">
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="text-center py-12 text-gray-400">
                      No activity yet. Be the first to bet!
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
                          <div className="text-white font-semibold mb-2">Multi-AI Consensus (Gemini 2.5 Flash + Fallbacks)</div>
                        </div>
                        <Brain className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="text-sm text-gray-300 space-y-2">
                        <p>
                          Este mercado será resuelto usando Gemini 2.5 Flash como modelo principal, con fallback automático a:
                        </p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          <li>gemini-2.5-pro (fallback 1)</li>
                          <li>gemini-2.0-flash (fallback 2)</li>
                          <li>gemini-1.5-flash (fallback 3)</li>
                          <li>gemini-1.5-pro (fallback 4)</li>
                        </ul>
                        <p className="mt-2">
                          Se requiere 80%+ de consenso para la resolución. Si el consenso falla, el pool de insurance activa automáticamente.
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
                        {marketInfo?.creator ? `${marketInfo.creator.slice(0, 6)}...${marketInfo.creator.slice(-4)}` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/10">
                      <span className="text-gray-400">Created</span>
                      <span className="text-white">
                        {marketInfo ? format(new Date(Number(marketInfo.createdAt) * 1000), 'PPP') : '-'}
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

                  <Button variant="outline" className="w-full mt-6 gap-2">
                    View on Explorer
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </GlassCard>
              </TabsContent>
            </Tabs>
          </div>

          {/* Betting Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
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
