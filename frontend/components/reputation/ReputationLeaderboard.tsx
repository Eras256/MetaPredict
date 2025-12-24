'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Award, Users, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatAddress } from '@/lib/utils/blockchain';

interface LeaderboardEntry {
  userId: string;
  reputationScore: number;
  tier: number;
  stakedAmount: number;
  correctVotes: number;
  totalVotes: number;
}

const tierLabels = {
  0: 'None',
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Platinum',
  5: 'Diamond',
};

const tierColors = {
  0: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  1: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  2: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
  3: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  4: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  5: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export function ReputationLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/reputation/leaderboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <Button onClick={fetchLeaderboard} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Reputation Leaderboard
          </h3>
          <p className="text-sm text-gray-400">Top users by reputation score</p>
        </div>
        <Button onClick={fetchLeaderboard} variant="ghost" size="sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-2">No leaderboard data available</p>
          <p className="text-gray-500 text-xs">Users will appear here once they start staking and voting</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            const tier = entry.tier as keyof typeof tierLabels;
            const accuracy = entry.totalVotes > 0 
              ? (entry.correctVotes / entry.totalVotes) * 100 
              : 0;

            return (
              <div
                key={entry.userId}
                className={`p-4 rounded-lg border transition-colors ${
                  rank === 1 
                    ? 'bg-yellow-500/10 border-yellow-500/30' 
                    : rank === 2
                    ? 'bg-gray-400/10 border-gray-400/30'
                    : rank === 3
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    {rank === 1 ? (
                      <Trophy className="w-6 h-6 text-yellow-400" />
                    ) : rank === 2 ? (
                      <Medal className="w-6 h-6 text-gray-300" />
                    ) : rank === 3 ? (
                      <Award className="w-6 h-6 text-orange-400" />
                    ) : (
                      <span className="text-sm font-bold text-white">#{rank}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white truncate">
                        {formatAddress(entry.userId)}
                      </span>
                      <Badge className={`text-xs ${tierColors[tier] || tierColors[0]}`}>
                        {tierLabels[tier] || 'None'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Score:</span>
                        <span className="ml-1 text-white font-semibold">{entry.reputationScore}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Staked:</span>
                        <span className="ml-1 text-white font-semibold">{entry.stakedAmount.toFixed(4)} BNB</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Accuracy:</span>
                        <span className={`ml-1 font-semibold ${
                          accuracy >= 70 ? 'text-green-400' : 
                          accuracy >= 50 ? 'text-yellow-400' : 
                          'text-red-400'
                        }`}>
                          {accuracy.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}

