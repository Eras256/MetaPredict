'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Clock, Users, Shield, Brain } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { formatDistanceToNow } from 'date-fns';
import { MARKET_STATUS, MARKET_TYPES } from '@/lib/config/constants';
import { motion } from 'framer-motion';

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
  [MARKET_STATUS.ACTIVE]: { 
    label: 'Active', 
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
    glow: 'shadow-[0_0_12px_rgba(34,197,94,0.3)]'
  },
  [MARKET_STATUS.RESOLVING]: { 
    label: 'Resolving', 
    color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    glow: 'shadow-[0_0_12px_rgba(234,179,8,0.3)]'
  },
  [MARKET_STATUS.RESOLVED]: { 
    label: 'Resolved', 
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.3)]'
  },
  [MARKET_STATUS.DISPUTED]: { 
    label: 'Disputed', 
    color: 'bg-red-500/20 text-red-300 border-red-500/30',
    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]'
  },
  [MARKET_STATUS.CANCELLED]: { 
    label: 'Cancelled', 
    color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    glow: ''
  },
};

export function MarketCard({ market }: MarketCardProps) {
  const yesOdds = market.yesOdds || 50;
  const noOdds = market.noOdds || 50;
  const timeRemaining = formatDistanceToNow(new Date(market.resolutionTime * 1000), { addSuffix: true });
  const statusInfo = statusLabels[market.status as keyof typeof statusLabels];

  return (
    <Link href={`/markets/${market.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4 }}
        className="h-full"
      >
        <GlassCard hover className="p-5 sm:p-6 h-full transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(139,92,246,0.3)] group relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:via-pink-500/5 group-hover:to-blue-500/10 transition-all duration-500" />
          
          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Header with badges */}
            <div className="flex items-start justify-between mb-4 gap-2">
              <div className="flex items-center gap-2 flex-wrap flex-1">
                <Badge 
                  variant="outline" 
                  className="text-xs font-semibold border-purple-500/40 bg-purple-500/10 text-purple-300 px-2.5 py-1 rounded-full backdrop-blur-sm"
                >
                  {marketTypeLabels[market.marketType as keyof typeof marketTypeLabels]}
                </Badge>
                <Badge 
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${statusInfo?.color} ${statusInfo?.glow}`}
                >
                  {statusInfo?.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {market.status === MARKET_STATUS.DISPUTED && (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                  </motion.div>
                )}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm group-hover:border-purple-500/50 transition-colors">
                  <Brain className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="text-xs text-purple-300 font-medium hidden sm:inline">AI Oracle</span>
                </div>
              </div>
            </div>

            {/* Question */}
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 line-clamp-2 leading-snug group-hover:text-purple-100 transition-colors">
              {market.question || `Market #${market.id}`}
            </h3>

            {/* Time and participants */}
            <div className="flex items-center gap-4 mb-5 text-xs sm:text-sm text-gray-400 flex-wrap">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span className="truncate font-medium">{timeRemaining}</span>
              </div>
              {market.participants !== undefined && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-medium">{market.participants}</span>
                </div>
              )}
            </div>

            {/* Prediction odds with enhanced bars */}
            <div className="space-y-3 mt-auto mb-5">
              {/* YES Option */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                      <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-300">YES</span>
                  </div>
                  <span className="text-lg font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20">
                    {yesOdds}%
                  </span>
                </div>
                <div className="relative h-3 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${yesOdds}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 rounded-full"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
              </div>

              {/* NO Option */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                      <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-300">NO</span>
                  </div>
                  <span className="text-lg font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                    {noOdds}%
                  </span>
                </div>
                <div className="relative h-3 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${noOdds}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className="absolute inset-y-0 right-0 bg-gradient-to-r from-red-500 via-rose-400 to-red-500 rounded-full"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Volume */}
            {market.totalVolume !== undefined && market.totalVolume > 0 && (
              <div className="mb-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-400 font-medium">Total Volume:</span>
                  <span className="text-sm sm:text-base text-white font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ${market.totalVolume < 0.01 
                      ? market.totalVolume.toFixed(4) 
                      : market.totalVolume < 1 
                      ? market.totalVolume.toFixed(2) 
                      : market.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* View Market Button */}
            <Button 
              className="w-full mt-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold border-0 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300" 
              size="sm"
            >
              <span className="flex items-center justify-center gap-2">
                View Market
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </Link>
  );
}
