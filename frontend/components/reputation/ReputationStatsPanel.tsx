'use client';

import { TrendingUp, TrendingDown, Shield, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { useReputationStats } from '@/lib/hooks/reputation/useReputation';
import { Skeleton } from '@/components/ui/skeleton';

export function ReputationStatsPanel() {
  const { totalStaked, totalSlashed, minStake, slashingPenalty } = useReputationStats();

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold">Reputation System Stats</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Total Staked</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {totalStaked > 0 ? `${totalStaked.toFixed(2)} BNB` : <Skeleton className="h-5 w-20" />}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-400">Total Slashed</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {totalSlashed > 0 ? `${totalSlashed.toFixed(2)} BNB` : <Skeleton className="h-5 w-20" />}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Minimum Stake</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {minStake > 0 ? `${minStake.toFixed(4)} BNB` : <Skeleton className="h-5 w-20" />}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Slashing Penalty</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {slashingPenalty > 0 ? `${slashingPenalty.toFixed(1)}%` : <Skeleton className="h-5 w-20" />}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
        <p className="text-xs text-purple-300">
          <strong>Note:</strong> Incorrect votes in disputes result in a {slashingPenalty > 0 ? `${slashingPenalty.toFixed(1)}%` : '20%'} slashing penalty. 
          Correct votes earn rewards from slashed amounts.
        </p>
      </div>
    </GlassCard>
  );
}

