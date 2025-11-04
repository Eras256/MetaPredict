'use client';

import Link from 'next/link';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';

interface Market {
  id: number;
  question: string;
  description: string;
  yesPool: number;
  noPool: number;
  resolutionTime: number;
  status: string;
  creator: string;
}

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const totalPool = market.yesPool + market.noPool;
  const yesOdds = totalPool > 0 ? (market.yesPool / totalPool) * 100 : 50;
  const noOdds = totalPool > 0 ? (market.noPool / totalPool) * 100 : 50;
  const timeRemaining = Math.max(0, market.resolutionTime - Date.now());
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));

  return (
    <Link href={`/markets/${market.id}`}>
      <GlassCard hover className="p-6 h-full flex flex-col">
        <h3 className="text-xl font-semibold mb-2 line-clamp-2">{market.question}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{market.description}</p>

        {/* Odds */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">YES</span>
              <span className="text-sm font-semibold text-green-400">{yesOdds.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                style={{ width: `${yesOdds}%` }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">NO</span>
              <span className="text-sm font-semibold text-red-400">{noOdds.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-rose-500"
                style={{ width: `${noOdds}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pool Size */}
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-gray-400">Total Pool</span>
          <span className="text-white font-semibold">${(totalPool / 1000000).toFixed(2)}M</span>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Clock className="h-4 w-4" />
          <span>{daysRemaining} days remaining</span>
        </div>

        <Button className="w-full mt-auto">
          View Market
        </Button>
      </GlassCard>
    </Link>
  );
}

