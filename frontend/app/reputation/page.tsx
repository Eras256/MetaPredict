'use client';

import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReputation, useStakeReputation } from '@/lib/hooks/reputation/useReputation';
import { useLeaderboard } from '@/lib/hooks/reputation/useReputation';
import { Trophy, Shield, TrendingUp, Award, Users, Star, Brain, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeReputation } from '@/lib/services/ai/gemini';
import { toast } from 'sonner';

const tierLabels = {
  0: 'None',
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
  5: 'Diamond',
};

const tierColors = {
  0: 'text-gray-400',
  1: 'text-orange-400',
  2: 'text-gray-300',
  3: 'text-yellow-400',
  4: 'text-purple-400',
  5: 'text-blue-400',
};

export default function ReputationPage() {
  const [stakeAmount, setStakeAmount] = useState('');
  const { stakedAmount, reputationScore, tier, correctVotes, totalVotes, isLoading } = useReputation();
  const { leaderboard, isLoading: leaderboardLoading } = useLeaderboard();
  const { stake, loading: isStaking } = useStakeReputation();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    const amountBigInt = BigInt(Math.floor(parseFloat(stakeAmount) * 1e18));
    await stake(amountBigInt);
    setStakeAmount('');
  };

  const handleAnalyzeReputation = async () => {
    if (totalVotes === 0) {
      toast.error('Insufficient data to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      const userData = {
        accuracy: reputationScore,
        totalVotes,
        correctVotes,
        slashes: 0, // TODO: obtener del contrato
        stakes: stakedAmount,
      };

      const result = await analyzeReputation(userData);
      if (result.success && result.data) {
        setAnalysisResult(result.data);
        toast.success(`Analysis completed with ${result.modelUsed}`);
      } else {
        toast.error(result.error || 'Error analyzing reputation');
      }
    } catch (error: any) {
      toast.error('Error analyzing reputation');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const winRate = totalVotes > 0 ? (correctVotes / totalVotes) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Reputation System
          </h1>
          <p className="text-gray-400 text-lg">
            Stake tokens, vote on disputes, and earn reputation rewards
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reputation Stats */}
          <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-400" />
                Your Reputation
              </h2>
              {totalVotes > 0 && (
                <Button
                  onClick={handleAnalyzeReputation}
                  disabled={analyzing}
                  size="sm"
                  variant="outline"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Tier</span>
                    <Badge className={`${tierColors[tier as keyof typeof tierColors]}`}>
                      {tierLabels[tier as keyof typeof tierLabels]}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Reputation Score</span>
                    <span className="text-2xl font-bold text-white">{reputationScore}%</span>
                  </div>
                  <Progress value={reputationScore} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-sm text-gray-400">Staked Amount</p>
                    <p className="text-xl font-semibold">${stakedAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Win Rate</p>
                    <p className="text-xl font-semibold">{winRate.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-sm text-gray-400">Correct Votes</p>
                    <p className="text-lg font-semibold">{correctVotes}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Votes</p>
                    <p className="text-lg font-semibold">{totalVotes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Analysis Results */}
            {analysisResult && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-purple-400">
                    <Brain className="h-4 w-4" />
                    AI Analysis
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    analysisResult.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                    analysisResult.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {analysisResult.riskLevel}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  AI Reputation Score: <span className="text-white font-semibold">{analysisResult.reputationScore}/100</span>
                </p>
                {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Recommendations:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-300">
                      {analysisResult.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </GlassCard>

          {/* Staking Panel */}
          <GlassCard className="p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-400" />
              Stake Reputation
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Amount (BNB)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  min="0.1"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: 0.1 BNB</p>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300">
                  Staking increases your voting weight in disputes. Higher stakes = more influence.
                </p>
              </div>

              <Button
                onClick={handleStake}
                disabled={!stakeAmount || isStaking || parseFloat(stakeAmount) < 0.1}
                className="w-full"
                size="lg"
              >
                {isStaking ? 'Staking...' : 'Stake Reputation'}
              </Button>
            </div>
          </GlassCard>

          {/* Leaderboard */}
          <GlassCard className="p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Leaderboard
            </h2>
            
            {leaderboardLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((user: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <span className="text-sm">{user.address?.slice(0, 6)}...{user.address?.slice(-4)}</span>
                    </div>
                    <Badge>{user.score}%</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No leaderboard data yet</p>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

