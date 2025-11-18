'use client';

import { use } from 'react';
import { useMarket } from '@/lib/hooks/useMarkets';
import { BettingPanel } from '@/components/markets/BettingPanel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/effects/GlassCard';
import { ArrowLeft, Clock, Users, TrendingUp, Shield, Brain, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { MARKET_STATUS, MARKET_TYPES } from '@/lib/config/constants';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import { Skeleton } from '@/components/ui/skeleton';
import { useActiveAccount } from 'thirdweb/react';
import { analyzeMarket } from '@/lib/services/ai/gemini';
import { toast } from 'sonner';
import { useState } from 'react';
import { useBNBBalance } from '@/lib/hooks/useBNBBalance';


export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const marketId = parseInt(id);
  const { market, loading: isLoading } = useMarket(marketId);
  const account = useActiveAccount();
  const { balance: userBalance } = useBNBBalance();
  const [analyzingMarket, setAnalyzingMarket] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState<any>(null);

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
        toast.success(`Analysis completed with ${result.modelUsed}`);
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
  const timeRemaining = market ? formatDistanceToNow(new Date(Number(market.resolutionTime) * 1000), { addSuffix: true }) : '';
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

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Market Header */}
            <GlassCard className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    Binary Market
                  </Badge>
                  <Badge className="text-xs bg-green-500/20 text-green-300">
                    {market?.status === 0 ? 'Active' : market?.status === 2 ? 'Resolved' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-purple-300">Insured</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-white mb-6">
                {market?.question || `Market #${marketId}`}
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

              {market?.description && (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Description</h3>
                  <p className="text-gray-300">{market.description}</p>
                </div>
              )}

              {/* AI Analysis Button */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <Button
                  onClick={handleAnalyzeMarket}
                  disabled={analyzingMarket || !market?.question}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {analyzingMarket ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analyze Market with AI
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
                      AI Analysis
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
                        {marketAnalysis.confidence}% confidence
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
                          <div className="text-white font-semibold mb-2">Multi-AI Consensus (5 Models from 3 Providers)</div>
                        </div>
                        <Brain className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="text-sm text-gray-300 space-y-2">
                        <p>
                          This market will be resolved using our multi-AI consensus system, querying 5 AI models from 3 providers in priority order:
                        </p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          <li>Google Gemini 2.5 Flash (Priority 1)</li>
                          <li>Groq Llama 3.1 Standard (Priority 2)</li>
                          <li>OpenRouter Mistral 7B (Priority 3)</li>
                          <li>OpenRouter Llama 3.2 3B (Priority 4)</li>
                          <li>OpenRouter Gemini (Priority 5)</li>
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
