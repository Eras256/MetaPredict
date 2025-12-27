'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, DollarSign, AlertCircle, Brain, Loader2, RefreshCw, ArrowDownCircle } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { InsuranceStats } from '@/components/insurance/InsuranceStats';
import { DepositPanel } from '@/components/insurance/DepositPanel';
import { WithdrawPanel } from '@/components/insurance/WithdrawPanel';
import { ClaimPanel } from '@/components/insurance/ClaimPanel';
import { InsurancePoolDetailsPanel } from '@/components/insurance/InsurancePoolDetailsPanel';
import { VenusMarketsPanel } from '@/components/venus/VenusMarketsPanel';
import { YieldHistoryPanel } from '@/components/insurance/YieldHistoryPanel';
import { analyzeInsuranceRisk } from '@/lib/services/ai/gemini';
import { toast } from 'sonner';
import { formatModelName } from '@/lib/utils/model-formatter';
import { useMarkets } from '@/lib/hooks/useMarkets';
import { MARKET_STATUS } from '@/lib/config/constants';
import { AutoRefreshBanner } from '@/components/common/AutoRefreshBanner';

export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'deposit' | 'withdraw' | 'claims'>('stats');
  const [analyzingRisk, setAnalyzingRisk] = useState(false);
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const { markets, loading, refresh } = useMarkets();
  
  // Filter only active markets (status === ACTIVE)
  const activeMarkets = useMemo(() => {
    if (!markets || markets.length === 0) return [];
    return markets.filter((market: any) => {
      // Only show ACTIVE markets (status === 0)
      const isActive = market.status === MARKET_STATUS.ACTIVE;
      // Also check if market has a valid question
      const hasQuestion = market.question && market.question.trim().length > 0;
      // Check if market has some volume (optional, but good for relevance)
      const hasVolume = market.yesPool > 0 || market.noPool > 0;
      return isActive && hasQuestion && hasVolume;
    });
  }, [markets]);
  
  // Note: Auto-refresh is now controlled by AutoRefreshBanner component
  // This ensures refresh only happens at the specified interval (30s for insurance)

  const handleAnalyzeMarketRisk = async (market: any) => {
    setAnalyzingRisk(true);
    try {
      // Convert BigInt values to numbers for JSON serialization
      const totalVolume = market.totalVolume ? Number(market.totalVolume) / 1e18 : 0;
      const yesPool = market.yesPool ? Number(market.yesPool) / 1e18 : 0;
      const noPool = market.noPool ? Number(market.noPool) / 1e18 : 0;
      const resolutionTime = market.resolutionTime ? Number(market.resolutionTime) * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
      
      const marketData = {
        question: market.question,
        totalVolume,
        yesPool,
        noPool,
        resolutionTime,
      };

      const result = await analyzeInsuranceRisk(marketData);
      if (result.success && result.data) {
        setRiskAnalysis({ ...result.data, marketId: market.id, marketQuestion: market.question });
        toast.success(`Analysis completed with ${formatModelName(result.modelUsed)}`);
      } else {
        toast.error(result.error || 'Error analyzing risk');
      }
    } catch (error: any) {
      toast.error('Error analyzing risk');
      console.error(error);
    } finally {
      setAnalyzingRisk(false);
    }
  };

  return (
    <div className="min-h-screen text-white pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Insurance Pool
              </h1>
              <p className="text-gray-400 text-sm sm:text-base md:text-lg">
                Protect your investments with insurance coverage
              </p>
            </div>
          </div>
        </motion.div>

        {/* Auto-refresh Banner */}
        <AutoRefreshBanner
          refreshInterval={30}
          onRefresh={refresh}
          description="Insurance pool data is automatically refreshed to show the latest pool balance, APY, active markets, and your deposit/withdrawal status."
          sectionName="Insurance Pool"
          pauseRefresh={activeTab === 'deposit' || activeTab === 'withdraw'}
          className="mb-4 sm:mb-6"
        />

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
          {[
            { id: 'stats', label: 'Pool Stats', icon: Shield, shortLabel: 'Stats' },
            { id: 'deposit', label: 'Deposit', icon: DollarSign, shortLabel: 'Deposit' },
            { id: 'withdraw', label: 'Withdraw', icon: ArrowDownCircle, shortLabel: 'Withdraw' },
            { id: 'claims', label: 'Claims', icon: AlertCircle, shortLabel: 'Claims' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Risk Analysis Results */}
        {riskAnalysis && (
          <GlassCard className="p-6 mb-6 border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Risk Analysis
                </h3>
                <p className="text-sm text-gray-400 mt-1">{riskAnalysis.marketQuestion}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                riskAnalysis.riskScore < 30 ? 'bg-green-500/20 text-green-400' :
                riskAnalysis.riskScore < 70 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                Risk: {riskAnalysis.riskScore}/100
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-3">{riskAnalysis.reasoning}</p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-sm text-gray-400">Recommended Coverage:</span>
              <span className="text-lg font-semibold text-white">{riskAnalysis.recommendedCoverage}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Confidence: {riskAnalysis.confidence}%</p>
          </GlassCard>
        )}

        {/* Content */}
        <div>
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <InsuranceStats />
              <InsurancePoolDetailsPanel />
              <YieldHistoryPanel />
              <VenusMarketsPanel />
              {loading ? (
                <GlassCard className="p-6 mt-6">
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                    <span className="ml-2 text-gray-400">Loading markets...</span>
                  </div>
                </GlassCard>
              ) : activeMarkets && activeMarkets.length > 0 ? (
                <GlassCard className="p-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-400" />
                      View ({activeMarkets.length} active markets)
                    </h3>
                    <Button
                      onClick={refresh}
                      disabled={loading}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activeMarkets.slice(0, 10).map((market: any) => (
                      <div key={market.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="text-sm text-gray-300 truncate">{market.question}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Volume: {((Number(market.yesPool || 0) + Number(market.noPool || 0)) / 1e18).toFixed(4)} BNB
                          </p>
                        </div>
                        <Link href={`/markets/${market.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                  {activeMarkets.length > 10 && (
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Showing top 10 of {activeMarkets.length} active markets
                    </p>
                  )}
                </GlassCard>
              ) : (
                <GlassCard className="p-6 mt-6">
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-2">No active markets available</p>
                    <p className="text-gray-500 text-xs">Active markets will appear here for risk analysis</p>
                    <Button
                      onClick={refresh}
                      disabled={loading}
                      size="sm"
                      variant="outline"
                      className="mt-4"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </GlassCard>
              )}
            </div>
          )}
          {activeTab === 'deposit' && <DepositPanel />}
          {activeTab === 'withdraw' && <WithdrawPanel />}
          {activeTab === 'claims' && <ClaimPanel />}
        </div>
      </div>
    </div>
  );
}

