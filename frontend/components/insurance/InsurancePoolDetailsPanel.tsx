'use client';

import { useState } from 'react';
import { TrendingUp, DollarSign, PieChart, Sparkles, Info, ExternalLink, History, ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { useInsurancePoolDetails } from '@/lib/hooks/insurance/useInsurancePool';
import { useInsurancePool } from '@/lib/hooks/insurance/useInsurancePool';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';

export function InsurancePoolDetailsPanel() {
  const { totalShares, totalAssets, sharePrice } = useInsurancePoolDetails();
  const { apy, stats } = useInsurancePool();
  const [showYieldInfo, setShowYieldInfo] = useState(false);

  return (
    <GlassCard className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
        <h3 className="text-base sm:text-lg font-semibold">Pool Details (ERC-4626 Compatible)</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            <span className="text-xs text-gray-400">Total Assets</span>
          </div>
          <div className="text-base sm:text-lg font-semibold text-white">
            {totalAssets > 0 ? `${totalAssets.toFixed(4)} BNB` : <Skeleton className="h-5 w-20" />}
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Total Shares</span>
          </div>
          <div className="text-base sm:text-lg font-semibold text-white">
            {totalShares > 0 ? `${totalShares.toFixed(4)}` : <Skeleton className="h-5 w-20" />}
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Estimated APY</span>
          </div>
          <div className="text-base sm:text-lg font-semibold text-yellow-400">
            {apy !== null && apy > 0 ? (
              `${apy.toFixed(2)}%`
            ) : (
              <Skeleton className="h-5 w-16" />
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Via Venus Protocol
          </div>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Share Price</span>
          <span className="text-lg font-semibold text-white font-mono">
            {sharePrice > 0 ? `${sharePrice.toFixed(6)} BNB` : <Skeleton className="h-5 w-20" />}
          </span>
        </div>
        <p className="text-xs text-purple-300 mt-2">
          <strong>ERC-4626 Compatible:</strong> Your shares represent your proportional ownership of the pool. 
          Share price = Total Assets / Total Shares. As the pool generates yield, share price increases.
        </p>
      </div>

      {/* Yield Information Section */}
      <div className="mt-3 sm:mt-4">
        <button
          onClick={() => setShowYieldInfo(!showYieldInfo)}
          className="w-full flex items-center justify-between p-3 sm:p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:bg-green-500/15 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            <span className="text-sm sm:text-base font-semibold text-white">How Yield Farming Works</span>
          </div>
          {showYieldInfo ? (
            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          )}
        </button>

        {showYieldInfo && (
          <div className="mt-2 p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
            <div className="space-y-2 text-xs sm:text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white">Venus Protocol Integration:</strong> The Insurance Pool automatically deposits funds into Venus Protocol lending markets to generate yield. Your shares accrue value as the pool earns interest.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white">Automatic Yield:</strong> Yield is generated continuously and distributed proportionally to all shareholders. You can claim your accumulated yield at any time from the Withdraw tab.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white">Share-Based System:</strong> When you deposit, you receive shares. When you withdraw, you receive BNB proportional to your share ownership. Share price increases as yield accumulates.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <a
          href={`https://testnet.opbnbscan.com/address/${CONTRACT_ADDRESSES.INSURANCE_POOL}#readContract`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs sm:text-sm bg-white/5 hover:bg-white/10 border-white/20"
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            View Contract
          </Button>
        </a>
        <a
          href={`https://testnet.opbnbscan.com/address/${CONTRACT_ADDRESSES.INSURANCE_POOL}#internaltx`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs sm:text-sm bg-white/5 hover:bg-white/10 border-white/20"
          >
            <History className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            View Transactions
          </Button>
        </a>
      </div>
    </GlassCard>
  );
}

