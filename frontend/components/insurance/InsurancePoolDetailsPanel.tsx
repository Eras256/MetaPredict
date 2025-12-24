'use client';

import { TrendingUp, DollarSign, PieChart } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { useInsurancePoolDetails } from '@/lib/hooks/insurance/useInsurancePool';
import { Skeleton } from '@/components/ui/skeleton';

export function InsurancePoolDetailsPanel() {
  const { totalShares, totalAssets, sharePrice } = useInsurancePoolDetails();

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold">Pool Details (ERC-4626 Style)</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Total Assets</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {totalAssets > 0 ? `${totalAssets.toFixed(4)} BNB` : <Skeleton className="h-5 w-20" />}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Total Shares</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {totalShares > 0 ? `${totalShares.toFixed(4)}` : <Skeleton className="h-5 w-20" />}
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Share Price</span>
          <span className="text-lg font-semibold text-white font-mono">
            {sharePrice > 0 ? `${sharePrice.toFixed(6)} BNB` : <Skeleton className="h-5 w-20" />}
          </span>
        </div>
        <p className="text-xs text-purple-300 mt-2">
          <strong>ERC-4626 Style:</strong> Your shares represent your proportional ownership of the pool. 
          Share price = Total Assets / Total Shares. As the pool generates yield, share price increases.
        </p>
      </div>
    </GlassCard>
  );
}

