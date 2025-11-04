'use client';

import { use } from 'react';
import { useMarketDetails } from '@/lib/hooks/markets/useMarkets';
import { BettingPanel } from '@/components/markets/BettingPanel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/effects/GlassCard';
import { ArrowLeft, Clock, Users, TrendingUp, Shield, Brain, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { MARKET_STATUS, MARKET_TYPES } from '@/lib/config/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { useReadContract } from 'wagmi';
import { useActiveAccount } from 'thirdweb/react';
import { CONTRACTS } from '@/lib/config/constants';
import { formatUnits } from 'viem';

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
                      <div className="text-sm text-gray-400 mb-2">Oracle Method</div>
                      <div className="text-white font-semibold mb-2">Multi-AI Consensus (5 LLMs)</div>
                      <div className="text-sm text-gray-300">
                        This market will be resolved by querying 5 different AI models: GPT-4, Claude, Gemini, Llama, and Mistral. 
                        80%+ consensus required for resolution.
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
