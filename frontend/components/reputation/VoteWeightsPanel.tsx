'use client';

import { Vote, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useVoteWeights } from '@/lib/hooks/reputation/useReputation';
import { Skeleton } from '@/components/ui/skeleton';

interface VoteWeightsPanelProps {
  marketId: number;
}

export function VoteWeightsPanel({ marketId }: VoteWeightsPanelProps) {
  const { yesWeight, noWeight, invalidWeight, totalWeight, isLoading } = useVoteWeights(marketId);

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <Skeleton className="h-32 w-full" />
      </GlassCard>
    );
  }

  if (totalWeight === 0) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <Vote className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No votes cast yet</p>
        </div>
      </GlassCard>
    );
  }

  const yesPercentage = totalWeight > 0 ? (yesWeight / totalWeight) * 100 : 0;
  const noPercentage = totalWeight > 0 ? (noWeight / totalWeight) * 100 : 0;
  const invalidPercentage = totalWeight > 0 ? (invalidWeight / totalWeight) * 100 : 0;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Vote className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold">Dispute Vote Weights</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">YES</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{yesWeight.toFixed(4)} BNB</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {yesPercentage.toFixed(1)}%
              </Badge>
            </div>
          </div>
          <Progress value={yesPercentage} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-white">NO</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{noWeight.toFixed(4)} BNB</span>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                {noPercentage.toFixed(1)}%
              </Badge>
            </div>
          </div>
          <Progress value={noPercentage} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">INVALID</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{invalidWeight.toFixed(4)} BNB</span>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                {invalidPercentage.toFixed(1)}%
              </Badge>
            </div>
          </div>
          <Progress value={invalidPercentage} className="h-2" />
        </div>

        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Total Voting Weight</span>
            <span className="text-sm font-semibold text-white">{totalWeight.toFixed(4)} BNB</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <p className="text-xs text-blue-300">
          <strong>Quadratic Voting:</strong> Vote weight = √(staked BNB). This prevents whale dominance and ensures fair representation.
        </p>
      </div>
    </GlassCard>
  );
}

