'use client';

import { Clock, Users, Award } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { useDAOParameters } from '@/lib/hooks/dao/useDAO';
import { Skeleton } from '@/components/ui/skeleton';

export function DAOParametersPanel() {
  const { votingPeriod, minQuorum, expertiseWeight } = useDAOParameters();

  const votingPeriodDays = votingPeriod > 0 ? votingPeriod / (24 * 60 * 60) : 0;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold">DAO Parameters</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">Voting Period</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {votingPeriodDays > 0 ? `${votingPeriodDays.toFixed(1)} days` : <Skeleton className="h-5 w-20" />}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {votingPeriod > 0 ? `(${votingPeriod} seconds)` : ''}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Minimum Quorum</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {minQuorum > 0 ? `${minQuorum.toFixed(4)} BNB` : <Skeleton className="h-5 w-20" />}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Minimum voting power required for proposal to pass
          </p>
        </div>

        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">Expertise Weight Multiplier</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {expertiseWeight > 0 ? `${expertiseWeight}x` : <Skeleton className="h-5 w-20" />}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Verified experts receive {expertiseWeight > 0 ? `${expertiseWeight}x` : '2x'} voting power boost
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <p className="text-xs text-blue-300">
          <strong>How it works:</strong> Proposals require {minQuorum > 0 ? `${minQuorum.toFixed(4)} BNB` : 'minimum'} quorum to pass. 
          Voting lasts {votingPeriodDays > 0 ? `${votingPeriodDays.toFixed(1)} days` : '3 days'}. 
          Verified experts get {expertiseWeight > 0 ? `${expertiseWeight}x` : '2x'} voting power.
        </p>
      </div>
    </GlassCard>
  );
}

