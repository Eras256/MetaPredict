'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, DollarSign, AlertCircle, Brain, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InsuranceStats } from '@/components/insurance/InsuranceStats';
import { DepositPanel } from '@/components/insurance/DepositPanel';
import { ClaimPanel } from '@/components/insurance/ClaimPanel';
import { analyzeInsuranceRisk } from '@/lib/services/ai/gemini';
import { toast } from 'sonner';
import { useMarkets } from '@/lib/hooks/useMarkets';

export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'deposit' | 'claims'>('stats');
  const [analyzingRisk, setAnalyzingRisk] = useState(false);
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const { markets } = useMarkets();

  const handleAnalyzeMarketRisk = async (market: any) => {
    setAnalyzingRisk(true);
    try {
      const marketData = {
        question: market.question,
        totalVolume: market.totalVolume || 0,
        yesPool: market.yesPool || 0,
        noPool: market.noPool || 0,
        resolutionTime: market.resolutionTime || Date.now() + 7 * 24 * 60 * 60 * 1000,
      };

      const result = await analyzeInsuranceRisk(marketData);
      if (result.success && result.data) {
        setRiskAnalysis({ ...result.data, marketId: market.id, marketQuestion: market.question });
        toast.success(`Analysis completed with ${result.modelUsed}`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Insurance Pool
          </h1>
          <p className="text-gray-400 text-lg">
            Protect your investments with insurance coverage
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'stats', label: 'Pool Stats', icon: Shield },
            { id: 'deposit', label: 'Deposit', icon: DollarSign },
            { id: 'claims', label: 'Claims', icon: AlertCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
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
            <div>
              <InsuranceStats />
              {markets && markets.length > 0 && (
                <GlassCard className="p-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-400" />
                    Analyze Market Risk
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {markets.slice(0, 5).map((market: any) => (
                      <div key={market.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <p className="text-sm text-gray-300 flex-1 truncate mr-2">{market.question}</p>
                        <Button
                          onClick={() => handleAnalyzeMarketRisk(market)}
                          disabled={analyzingRisk}
                          size="sm"
                          variant="outline"
                        >
                          {analyzingRisk ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Analyze'
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          )}
          {activeTab === 'deposit' && <DepositPanel />}
          {activeTab === 'claims' && <ClaimPanel />}
        </div>
      </div>
    </div>
  );
}

