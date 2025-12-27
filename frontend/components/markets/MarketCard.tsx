'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Clock, Users, Shield, Brain } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { formatDistanceToNow, format } from 'date-fns';
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
    outcome?: number; // 0=Pending, 1=Yes, 2=No, 3=Invalid
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

// Expired status (not in contract, but shown when deadline passed)
const expiredStatusLabel = {
  label: 'Expired - Pending Resolution',
  color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  glow: 'shadow-[0_0_12px_rgba(249,115,22,0.3)]'
};

export function MarketCard({ market }: MarketCardProps) {
  const [currentTime, setCurrentTime] = useState(() => Math.floor(Date.now() / 1000));
  
  // Update current time every 10 seconds to ensure accurate expiration detection
  useEffect(() => {
    // Set initial time immediately
    setCurrentTime(Math.floor(Date.now() / 1000));
    
    // Update every 10 seconds for more responsive expiration detection
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const yesOdds = market.yesOdds || 50;
  const noOdds = market.noOdds || 50;
  
  // Ensure resolutionTime is in seconds (Unix timestamp)
  // Handle both seconds and milliseconds formats
  // resolutionTime from contract is in seconds (Unix timestamp)
  const resolutionTimeSeconds = market.resolutionTime > 1e12 
    ? Math.floor(market.resolutionTime / 1000) 
    : Math.floor(market.resolutionTime);
  
  const deadlineDate = new Date(resolutionTimeSeconds * 1000);
  const deadlineFormatted = format(deadlineDate, 'MMM dd, yyyy HH:mm');
  
  // Check if market has expired (deadline passed but not resolved)
  // Use strict comparison with current time
  const hasExpired = resolutionTimeSeconds <= currentTime;
  
  // Get market status flags
  const isResolved = market.status === MARKET_STATUS.RESOLVED;
  const isResolving = market.status === MARKET_STATUS.RESOLVING;
  const isActive = market.status === MARKET_STATUS.ACTIVE;
  const isCancelled = market.status === MARKET_STATUS.CANCELLED;
  
  // Check if market is actually resolved by checking outcome
  // outcome: 0=Pending, 1=Yes, 2=No, 3=Invalid
  // IMPORTANT: A market is ONLY truly resolved if:
  // 1. Status is Resolved (2) AND
  // 2. Outcome exists AND
  // 3. Outcome is NOT Pending (0) - must be 1, 2, or 3
  // If outcome is missing or 0, market is NOT truly resolved, even if status says Resolved
  const hasOutcome = market.outcome !== undefined;
  const outcomeIsPending = hasOutcome && market.outcome === 0;
  const hasValidOutcome = hasOutcome && market.outcome !== 0; // 1, 2, or 3
  // Market is actually resolved ONLY if status is Resolved AND has valid outcome (1, 2, or 3)
  // IMPORTANT: Declare this BEFORE any usage, including in console.log
  const isActuallyResolved = isResolved && hasValidOutcome;
  
  // Debug logging (only in development) - log ALL expired markets for troubleshooting
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    if (hasExpired) {
      console.log(`[MarketCard] Market #${market.id} EXPIRATION CHECK:`, {
        resolutionTime: resolutionTimeSeconds,
        currentTime,
        deadline: deadlineFormatted,
        currentDate: new Date().toLocaleString(),
        status: market.status,
        statusName: ['Active', 'Resolving', 'Resolved', 'Disputed', 'Cancelled'][market.status] || 'Unknown',
        outcome: market.outcome,
        outcomeName: market.outcome !== undefined ? ['Pending', 'Yes', 'No', 'Invalid'][market.outcome] : 'Not available',
        hasExpired,
        timeDiffSeconds: currentTime - resolutionTimeSeconds,
        isActuallyResolved,
        willShowExpired: hasExpired && !isActuallyResolved && !isCancelled,
      });
    }
  }
  
  // Determine display status: prioritize expiration check over contract status
  // CRITICAL LOGIC: 
  // 1. If deadline passed (hasExpired = true) AND market is not actually resolved AND not cancelled
  //    → ALWAYS show "Expired - Pending Resolution"
  // 2. This catches ALL cases: Active markets that expired, Resolved markets with outcome still Pending, etc.
  // 3. Only show contract status if market hasn't expired OR is truly resolved (has valid outcome)
  let displayStatus;
  if (hasExpired && !isActuallyResolved && !isCancelled) {
    // Market expired but not actually resolved - ALWAYS show expired status
    // This catches:
    // - Active markets that expired
    // - Resolved markets where outcome is still 0 (Pending)
    // - Resolved markets where outcome is not available
    displayStatus = expiredStatusLabel;
  } else {
    // Market hasn't expired OR is truly resolved OR is cancelled - use contract status
    displayStatus = statusLabels[market.status as keyof typeof statusLabels];
  }
  
  // Format time remaining or show "Expired"
  // Show "Expired" if deadline passed and market is not actually resolved
  const timeRemaining = hasExpired && !isActuallyResolved && !isCancelled
    ? 'Expired'
    : formatDistanceToNow(new Date(resolutionTimeSeconds * 1000), { addSuffix: true });
  
  // Convert totalVolume from wei to BNB if needed
  // totalVolume is already in BNB from markets/page.tsx, but handle both cases
  const totalVolumeBNB = market.totalVolume 
    ? (typeof market.totalVolume === 'bigint' 
        ? Number(market.totalVolume) / 1e18 
        : market.totalVolume > 1e15 
        ? market.totalVolume / 1e18 
        : market.totalVolume)
    : 0;

  return (
    <Link href={`/markets/${market.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4 }}
        className="h-full"
      >
        <GlassCard hover className="p-4 sm:p-5 md:p-6 h-full transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(139,92,246,0.3)] group relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-blue-500/0 group-hover:from-purple-500/10 group-hover:via-pink-500/5 group-hover:to-blue-500/10 transition-all duration-500" />
          
          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Header with badges */}
            <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-1 min-w-0">
                <Badge 
                  variant="outline" 
                  className="text-[10px] sm:text-xs font-semibold border-purple-500/40 bg-purple-500/10 text-purple-300 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full backdrop-blur-sm whitespace-nowrap"
                >
                  {marketTypeLabels[market.marketType as keyof typeof marketTypeLabels]}
                </Badge>
                <Badge 
                  className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border backdrop-blur-sm whitespace-nowrap ${displayStatus?.color} ${displayStatus?.glow}`}
                >
                  {displayStatus?.label}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {market.status === MARKET_STATUS.DISPUTED && (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="flex-shrink-0"
                  >
                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                  </motion.div>
                )}
                <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm group-hover:border-purple-500/50 transition-colors flex-shrink-0">
                  <Brain className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="text-[10px] sm:text-xs text-purple-300 font-medium hidden sm:inline whitespace-nowrap">AI Oracle</span>
                </div>
              </div>
            </div>

            {/* Question */}
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-3 sm:mb-4 line-clamp-2 leading-snug group-hover:text-purple-100 transition-colors break-words">
              {market.question || `Market #${market.id}`}
            </h3>

            {/* Deadline, Time remaining, and Participants */}
            <div className="space-y-2 mb-4 sm:mb-5">
              <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 flex-shrink-0">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400 flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium">Deadline</span>
                  <span className="text-[10px] sm:text-xs text-red-300 font-semibold truncate">{deadlineFormatted}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border flex-shrink-0 ${
                  hasExpired && !isActuallyResolved && !isCancelled
                    ? 'bg-orange-500/10 border-orange-500/20' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <Clock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 ${
                    hasExpired && !isActuallyResolved && !isCancelled
                      ? 'text-orange-400' 
                      : 'text-purple-400'
                  }`} />
                  <span className={`text-[10px] sm:text-xs font-medium truncate max-w-[120px] sm:max-w-none ${
                    hasExpired && !isActuallyResolved && !isCancelled
                      ? 'text-orange-300' 
                      : 'text-gray-300'
                  }`}>
                    {timeRemaining}
                  </span>
                </div>
                {market.participants !== undefined && (
                  <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-white/5 border border-white/10 flex-shrink-0">
                    <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs text-gray-300 font-medium whitespace-nowrap">{market.participants} {market.participants === 1 ? 'participant' : 'participants'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Prediction odds with enhanced bars */}
            <div className="space-y-2.5 sm:space-y-3 mt-auto mb-4 sm:mb-5">
              {/* YES Option */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                    <div className="p-1 sm:p-1.5 rounded-lg bg-green-500/10 border border-green-500/20 flex-shrink-0">
                      <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-300 whitespace-nowrap">YES</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-green-400 bg-green-500/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-green-500/20 whitespace-nowrap flex-shrink-0">
                    {yesOdds}%
                  </span>
                </div>
                <div className="relative h-2.5 sm:h-3 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/50">
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
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                    <div className="p-1 sm:p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 flex-shrink-0">
                      <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-300 whitespace-nowrap">NO</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-red-400 bg-red-500/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-red-500/20 whitespace-nowrap flex-shrink-0">
                    {noOdds}%
                  </span>
                </div>
                <div className="relative h-2.5 sm:h-3 bg-gray-800/50 rounded-full overflow-hidden border border-gray-700/50">
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

            {/* Volume in BNB */}
            {totalVolumeBNB > 0 && (
              <div className="mb-3 sm:mb-4 pt-3 sm:pt-4 border-t border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 font-medium truncate">Total Volume:</span>
                  <span className="text-xs sm:text-sm md:text-base text-white font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap flex-shrink-0">
                    {totalVolumeBNB < 0.0001 
                      ? totalVolumeBNB.toFixed(6) 
                      : totalVolumeBNB < 0.01 
                      ? totalVolumeBNB.toFixed(4) 
                      : totalVolumeBNB < 1 
                      ? totalVolumeBNB.toFixed(2) 
                      : totalVolumeBNB.toLocaleString(undefined, { maximumFractionDigits: 2 })} BNB
                  </span>
                </div>
              </div>
            )}

            {/* View Market Button */}
            <Button 
              className="w-full mt-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs sm:text-sm font-semibold border-0 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300 py-2 sm:py-2.5" 
              size="sm"
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <span className="whitespace-nowrap">View Market</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex-shrink-0"
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
