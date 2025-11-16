'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Clock, CheckCircle, Brain, Loader2, TrendingDown } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';
import { analyzePortfolioRebalance } from '@/lib/services/ai/gemini';
import { toast } from 'sonner';

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<'positions' | 'history' | 'claims'>('positions');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Mock data - replace with real data from contract
  const positions = [
    {
      id: 1,
      marketId: 1,
      question: 'Will Bitcoin reach $100K by end of 2025?',
      yesShares: 100,
      noShares: 0,
      totalValue: 150,
      status: 'active'
    },
    // Add more positions...
  ];

  const handleAnalyzePortfolio = async () => {
    if (positions.length === 0) {
      toast.error('No hay posiciones para analizar');
      return;
    }

    setAnalyzing(true);
    try {
      const positionsData = positions.map(p => ({
        marketId: p.marketId || p.id,
        question: p.question,
        yesShares: p.yesShares,
        noShares: p.noShares,
        totalValue: p.totalValue,
      }));

      const result = await analyzePortfolioRebalance(positionsData);
      if (result.success && result.data) {
        setAnalysisResult(result.data);
        toast.success(`Análisis completado con ${result.modelUsed}`);
      } else {
        toast.error(result.error || 'Error al analizar portfolio');
      }
    } catch (error: any) {
      toast.error('Error al analizar portfolio');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const stats = {
    totalValue: 150,
    activePositions: 1,
    totalWinnings: 0,
    pendingClaims: 0
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
            Portfolio
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your positions and claims
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Value', value: `$${stats.totalValue}`, icon: Wallet },
            { label: 'Active Positions', value: stats.activePositions.toString(), icon: TrendingUp },
            { label: 'Total Winnings', value: `$${stats.totalWinnings}`, icon: CheckCircle },
            { label: 'Pending Claims', value: stats.pendingClaims.toString(), icon: Clock },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-5 w-5 text-purple-400" />
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* AI Analysis Button */}
        {positions.length > 0 && (
          <div className="mb-6">
            <Button
              onClick={handleAnalyzePortfolio}
              disabled={analyzing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Analizar Portfolio con AI
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
                Análisis de Portfolio
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                analysisResult.riskScore < 30 ? 'bg-green-500/20 text-green-400' :
                analysisResult.riskScore < 70 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                Riesgo: {analysisResult.riskScore}/100
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-4">{analysisResult.overallRecommendation}</p>
            {analysisResult.allocations && analysisResult.allocations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Recomendaciones:</h4>
                {analysisResult.allocations.map((allocation: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Mercado #{allocation.marketId}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        allocation.recommendedAction === 'increase' ? 'bg-green-500/20 text-green-400' :
                        allocation.recommendedAction === 'decrease' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {allocation.recommendedAction === 'increase' ? 'Aumentar' :
                         allocation.recommendedAction === 'decrease' ? 'Reducir' : 'Mantener'}
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'positions', label: 'Active Positions' },
            { id: 'history', label: 'History' },
            { id: 'claims', label: 'Claims' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'positions' && (
            positions.length > 0 ? (
              positions.map((position) => (
                <GlassCard key={position.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{position.question}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">YES Shares:</span>
                          <span className="ml-2 text-white font-semibold">{position.yesShares}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">NO Shares:</span>
                          <span className="ml-2 text-white font-semibold">{position.noShares}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Total Value:</span>
                          <span className="ml-2 text-white font-semibold">${position.totalValue}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <span className="ml-2 text-green-400 font-semibold capitalize">{position.status}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline">View Market</Button>
                  </div>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="p-12 text-center">
                <p className="text-gray-400 text-lg">No active positions</p>
              </GlassCard>
            )
          )}

          {activeTab === 'history' && (
            <GlassCard className="p-12 text-center">
              <p className="text-gray-400 text-lg">No history yet</p>
            </GlassCard>
          )}

          {activeTab === 'claims' && (
            <GlassCard className="p-12 text-center">
              <p className="text-gray-400 text-lg">No pending claims</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

