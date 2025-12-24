'use client';

import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReputation, useStakeReputation, useUnstakeReputation, useUserVotesHistory } from '@/lib/hooks/reputation/useReputation';
import { useLeaderboard } from '@/lib/hooks/reputation/useReputation';
import { ReputationDAOPanel } from '@/components/reputation/ReputationDAOPanel';
import { ReputationStatsPanel } from '@/components/reputation/ReputationStatsPanel';
import { ReputationLeaderboard } from '@/components/reputation/ReputationLeaderboard';
import { Trophy, Shield, TrendingUp, Award, Users, Star, Brain, Loader2, Sparkles, AlertTriangle, Zap, Gift, ArrowDownCircle, Vote } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeReputation } from '@/lib/services/ai/gemini';
import { toast } from 'sonner';
import { formatModelName } from '@/lib/utils/model-formatter';

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

const tierIcons = {
  0: '○',
  1: '🥉',
  2: '🥈',
  3: '🥇',
  4: '💎',
  5: '👑',
};

// Tier requirements in BNB (matching contract)
const tierRequirements = [
  0,        // None
  0.1,      // Bronze: 0.1 BNB
  1,        // Silver: 1 BNB
  10,       // Gold: 10 BNB (NFT unlocked)
  50,       // Platinum: 50 BNB
  100,      // Diamond: 100 BNB
];

export default function ReputationPage() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const { stakedAmount, reputationScore, tier, correctVotes, totalVotes, slashedAmount, hasNFT, nftCount, isLoading } = useReputation();
  const { leaderboard, isLoading: leaderboardLoading } = useLeaderboard();
  const { stake, loading: isStaking } = useStakeReputation();
  const { unstake, loading: isUnstaking } = useUnstakeReputation();
  const { votes: userVotes, isLoading: votesLoading } = useUserVotesHistory();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    const amountBigInt = BigInt(Math.floor(parseFloat(stakeAmount) * 1e18));
    await stake(amountBigInt);
    setStakeAmount('');
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (parseFloat(unstakeAmount) > stakedAmount) {
      toast.error('Cannot unstake more than your staked amount');
      return;
    }
    const amountBigInt = BigInt(Math.floor(parseFloat(unstakeAmount) * 1e18));
    await unstake(amountBigInt);
    setUnstakeAmount('');
  };

  const handleAnalyzeReputation = async () => {
    if (totalVotes === 0 && stakedAmount === 0) {
      toast.error('Stake tokens or vote on disputes to enable AI analysis');
      return;
    }

    setAnalyzing(true);
    try {
      const userData = {
        accuracy: reputationScore,
        totalVotes,
        correctVotes,
        slashes: slashedAmount || 0,
        stakes: stakedAmount,
      };

      const result = await analyzeReputation(userData);
      if (result.success && result.data) {
        setAnalysisResult(result.data);
        toast.success(`Analysis completed with ${formatModelName(result.modelUsed)}`);
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
  const currentTierRequirement = tierRequirements[tier as keyof typeof tierRequirements] || 0;
  const nextTierRequirement = tier < 5 ? tierRequirements[(tier as number) + 1] : tierRequirements[5];
  const progressToNextTier = tier < 5 
    ? Math.min(100, (stakedAmount / nextTierRequirement) * 100)
    : 100;
  const remainingForNextTier = tier < 5 
    ? Math.max(0, nextTierRequirement - stakedAmount)
    : 0;

  // Check if user will get NFT on next tier upgrade
  const willGetNFT = tier < 3 && (tier + 1) >= 3;

  return (
    <div className="min-h-screen text-white pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Reputation System
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg">
            Stake BNB, vote on disputes, earn reputation, and unlock NFT badges
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Reputation Stats */}
          <GlassCard className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                Your Reputation
              </h2>
              <Button
                onClick={handleAnalyzeReputation}
                disabled={analyzing || (totalVotes === 0 && stakedAmount === 0)}
                size="sm"
                variant="outline"
                title={totalVotes === 0 && stakedAmount === 0 ? "Stake tokens or vote to enable AI analysis" : "Analyze your reputation with AI"}
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
            </div>
            
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-6">
                {/* Current Tier */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Current Tier</span>
                    <Badge className={`${tierColors[tier as keyof typeof tierColors]} text-lg px-3 py-1`}>
                      <span className="mr-2">{tierIcons[tier as keyof typeof tierIcons]}</span>
                      {tierLabels[tier as keyof typeof tierLabels]}
                    </Badge>
                  </div>
                  
                  {/* NFT Badge Indicator */}
                  {hasNFT && (
                    <div className="mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-yellow-300">
                        NFT Badge Unlocked! You own {nftCount} reputation NFT{nftCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Progress to Next Tier */}
                  {tier < 5 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Progress to {tierLabels[(tier + 1) as keyof typeof tierLabels]}</span>
                        <span className="text-xs text-gray-400">
                          {stakedAmount.toFixed(4)} / {nextTierRequirement} BNB
                        </span>
                      </div>
                      <Progress value={progressToNextTier} className="h-2" />
                      {remainingForNextTier > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {remainingForNextTier.toFixed(4)} BNB needed for next tier
                        </p>
                      )}
                      {willGetNFT && (
                        <div className="mt-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
                          <Gift className="w-4 h-4 text-purple-400" />
                          <span className="text-xs text-purple-300">
                            Reach Gold tier to unlock your NFT badge automatically!
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Reputation Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Reputation Score</span>
                    <span className="text-2xl font-bold text-white">{reputationScore}%</span>
                  </div>
                  <Progress value={reputationScore} className="h-2" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-sm text-gray-400">Staked Amount</p>
                    <p className="text-xl font-semibold">{stakedAmount.toFixed(4)} BNB</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Win Rate</p>
                    <p className="text-xl font-semibold">{winRate.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Voting Stats */}
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

                {/* Slashing Info */}
                {slashedAmount > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <div className="flex-1">
                        <p className="text-xs text-red-300 font-semibold">Slashed Amount</p>
                        <p className="text-sm text-red-400">{slashedAmount.toFixed(4)} BNB</p>
                        <p className="text-xs text-gray-500 mt-1">
                          This amount was slashed due to incorrect votes (20% penalty)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                <p className="text-xs text-blue-300 mb-2">
                  <strong>Staking Benefits:</strong>
                </p>
                <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
                  <li>Increases your voting weight in disputes</li>
                  <li>Higher stakes = more influence</li>
                  <li>Unlock tier upgrades and NFT badges</li>
                  <li>Earn rewards for correct votes</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-yellow-300 font-semibold mb-1">Slashing Warning</p>
                    <p className="text-xs text-yellow-200">
                      Incorrect votes result in a 20% slashing penalty. Vote carefully!
                    </p>
                  </div>
                </div>
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

          {/* Unstaking Panel */}
          <GlassCard className="p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <ArrowDownCircle className="w-6 h-6 text-orange-400" />
              Unstake Reputation
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Amount (BNB)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  min="0.0001"
                  step="0.01"
                  max={stakedAmount}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">Available: {stakedAmount.toFixed(4)} BNB</p>
                  <button
                    onClick={() => setUnstakeAmount(stakedAmount.toString())}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    Use Max
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-orange-300 font-semibold mb-1">Cooldown Period</p>
                    <p className="text-xs text-orange-200">
                      You must wait 7 days from your last stake before you can unstake. This is a security period to protect the reputation system.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300 mb-2">
                  <strong>Unstaking Effects:</strong>
                </p>
                <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
                  <li>Reduces your voting weight in disputes</li>
                  <li>May downgrade your tier if below threshold</li>
                  <li>You keep your reputation score and NFT badges</li>
                  <li>Cooldown period: 7 days from last stake</li>
                </ul>
              </div>

              <Button
                onClick={handleUnstake}
                disabled={!unstakeAmount || isUnstaking || parseFloat(unstakeAmount) <= 0 || parseFloat(unstakeAmount) > stakedAmount || stakedAmount === 0}
                className="w-full"
                size="lg"
                variant="outline"
              >
                {isUnstaking ? 'Unstaking...' : 'Unstake Reputation'}
              </Button>

              {stakedAmount === 0 && (
                <p className="text-xs text-gray-500 text-center">
                  You have no staked amount to withdraw
                </p>
              )}
            </div>
          </GlassCard>

          {/* Tier System & Leaderboard */}
          <GlassCard className="p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Tier System
            </h2>
            
            <div className="space-y-4 mb-6">
              {tierRequirements.map((requirement, index) => {
                const isCurrentTier = tier === index;
                const isUnlocked = tier >= index;
                const isNFTTier = index >= 3; // Gold and above
                
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      isCurrentTier
                        ? 'bg-purple-500/20 border-purple-500/50'
                        : isUnlocked
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-gray-500/10 border-gray-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tierIcons[index as keyof typeof tierIcons]}</span>
                        <span className={`font-semibold ${tierColors[index as keyof typeof tierColors]}`}>
                          {tierLabels[index as keyof typeof tierLabels]}
                        </span>
                        {isNFTTier && (
                          <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">
                            NFT
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Requirement</p>
                        <p className="text-sm font-semibold">{requirement} BNB</p>
                      </div>
                    </div>
                    {isCurrentTier && (
                      <p className="text-xs text-purple-300 mt-2">← Your current tier</p>
                    )}
                    {index === 3 && (
                      <p className="text-xs text-yellow-300 mt-2 flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        NFT badge automatically minted at Gold tier
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Leaderboard
              </h3>
              
              {leaderboardLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((user: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                        <span className="text-xs">{user.address?.slice(0, 6)}...{user.address?.slice(-4)}</span>
                      </div>
                      <Badge>{user.score}%</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Trophy className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs mb-1">No leaderboard data yet</p>
                  <p className="text-gray-500 text-xs">Leaderboard will appear once users start staking and voting</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Voting History */}
          <GlassCard className="p-8 mt-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Vote className="w-6 h-6 text-purple-400" />
              Your Voting History
            </h2>
            
            {votesLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : userVotes.length > 0 ? (
              <div className="space-y-3">
                {userVotes.map((vote) => {
                  const voteLabels = { 1: 'Yes', 2: 'No', 3: 'Invalid' };
                  const voteColors = {
                    1: 'bg-green-500/20 text-green-400 border-green-500/30',
                    2: 'bg-red-500/20 text-red-400 border-red-500/30',
                    3: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
                  };
                  
                  return (
                    <div key={vote.marketId} className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">Market #{vote.marketId}</span>
                        <Badge className={voteColors[vote.vote as keyof typeof voteColors]}>
                          {voteLabels[vote.vote as keyof typeof voteLabels]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">Weight:</span>
                          <span className="ml-1 text-white">{vote.stakeWeight.toFixed(4)}</span>
                        </div>
                        <div>
                          {vote.rewarded ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Rewarded
                            </Badge>
                          ) : vote.slashed ? (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              Slashed
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Vote className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-2">No votes yet</p>
                <p className="text-gray-500 text-xs">Your voting history will appear here once you vote on disputes</p>
              </div>
            )}
          </GlassCard>

          {/* Reputation Stats Panel */}
          <ReputationStatsPanel />

          {/* Reputation Leaderboard */}
          <ReputationLeaderboard />

          {/* Reputation DAO Panel */}
          <ReputationDAOPanel />
        </div>
      </div>
    </div>
  );
}
