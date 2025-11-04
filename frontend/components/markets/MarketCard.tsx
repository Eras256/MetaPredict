'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Clock, Users, Shield } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { formatDistanceToNow } from 'date-fns';
import { MARKET_STATUS, MARKET_TYPES } from '@/lib/config/constants';

interface MarketCardProps {
  market: {
    id: number;
    marketType: number;
    question?: string;
    resolutionTime: number;
    status: number;
    yesOdds?: number;
    noOdds?: number;
    totalVolume?: number;
    participants?: number;
  };
}

const marketTypeLabels = {
  [MARKET_TYPES.BINARY]: 'Binary',
  [MARKET_TYPES.CONDITIONAL]: 'Conditional',
  [MARKET_TYPES.SUBJECTIVE]: 'Subjective',
};

const statusLabels = {
  [MARKET_STATUS.ACTIVE]: { label: 'Active', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  [MARKET_STATUS.RESOLVING]: { label: 'Resolving', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  [MARKET_STATUS.RESOLVED]: { label: 'Resolved', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  [MARKET_STATUS.DISPUTED]: { label: 'Disputed', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  [MARKET_STATUS.CANCELLED]: { label: 'Cancelled', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
};

export function MarketCard({ market }: MarketCardProps) {
  const yesOdds = market.yesOdds || 50;
  const noOdds = market.noOdds || 50;
  const timeRemaining = formatDistanceToNow(new Date(market.resolutionTime * 1000), { addSuffix: true });

  return (
    <Link href={`/markets/${market.id}`}>
      <GlassCard hover className="p-6 h-full transition-all duration-300 hover:scale-[1.02]">
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-purple-500/30">
                {marketTypeLabels[market.marketType as keyof typeof marketTypeLabels]}
              </Badge>
              <Badge className={`text-xs ${statusLabels[market.status as keyof typeof statusLabels]?.color}`}>
                {statusLabels[market.status as keyof typeof statusLabels]?.label}
              </Badge>
            </div>
            {market.status === MARKET_STATUS.DISPUTED && (
              <Shield className="w-5 h-5 text-yellow-500" />
            )}
          </div>

          <h3 className="text-lg font-semibold text-white mb-4 line-clamp-2">
            {market.question || `Market #${market.id}`}
          </h3>

          <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{timeRemaining}</span>
            </div>
            {market.participants !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{market.participants}</span>
              </div>
            )}
          </div>

          <div className="space-y-3 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">YES</span>
              </div>
              <span className="text-lg font-semibold text-green-400">{yesOdds}%</span>
            </div>

            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-400" style={{ width: `${yesOdds}%` }} />
              <div className="absolute inset-y-0 right-0 bg-gradient-to-r from-red-400 to-red-500" style={{ width: `${noOdds}%` }} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-300">NO</span>
              </div>
              <span className="text-lg font-semibold text-red-400">{noOdds}%</span>
            </div>
          </div>

          {market.totalVolume !== undefined && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-sm text-gray-400">
                Total Volume: <span className="text-white font-semibold">${market.totalVolume.toLocaleString()}</span>
              </div>
            </div>
          )}

          <Button className="w-full mt-4" variant="outline">
            View Market
          </Button>
        </div>
      </GlassCard>
    </Link>
  );
}
