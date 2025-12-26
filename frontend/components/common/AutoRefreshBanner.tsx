'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/effects/GlassCard';

interface AutoRefreshBannerProps {
  refreshInterval: number; // in seconds
  onRefresh: () => void | Promise<void>;
  description: string;
  sectionName: string;
  className?: string;
  pauseRefresh?: boolean; // Pause auto-refresh when true (e.g., when user is filling forms)
}

export function AutoRefreshBanner({
  refreshInterval,
  onRefresh,
  description,
  sectionName,
  className = '',
  pauseRefresh = false,
}: AutoRefreshBannerProps) {
  const [timeRemaining, setTimeRemaining] = useState(refreshInterval);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const onRefreshRef = useRef(onRefresh);
  const refreshIntervalRef = useRef(refreshInterval);
  const pauseRefreshRef = useRef(pauseRefresh);

  // Only set mounted state on client to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    setLastRefresh(new Date());
  }, []);

  // Keep refs updated
  useEffect(() => {
    onRefreshRef.current = onRefresh;
    refreshIntervalRef.current = refreshInterval;
    pauseRefreshRef.current = pauseRefresh;
  }, [onRefresh, refreshInterval, pauseRefresh]);

  const handleRefresh = useCallback(async () => {
    // Don't refresh if paused
    if (pauseRefreshRef.current) {
      return;
    }

    setIsRefreshing((current) => {
      if (current) return current; // Prevent multiple simultaneous refreshes
      return true;
    });
    
    try {
      await onRefreshRef.current();
      setLastRefresh(new Date());
      setTimeRemaining(refreshIntervalRef.current);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Countdown timer - updates every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        // Pause countdown if refresh is paused
        if (pauseRefreshRef.current) {
          return prev; // Keep current time, don't count down
        }
        
        if (prev <= 1) {
          // Trigger refresh when countdown reaches 0
          handleRefresh();
          return refreshIntervalRef.current;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleRefresh]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  const formatInterval = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''}`;
    const hours = Math.floor(mins / 60);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={className}
      >
        <GlassCard className="p-3 sm:p-4 md:p-5 border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
              <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 flex-shrink-0">
                <RefreshCw
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                  <span className="text-xs sm:text-sm font-semibold text-purple-300 truncate">
                    Auto-refresh: {sectionName}
                  </span>
                  <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 flex-shrink-0">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
                    <span className="text-xs text-purple-300 font-medium whitespace-nowrap">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed break-words">
                  {description} Refreshes every <strong className="text-purple-300">{formatInterval(refreshInterval)}</strong> to keep data up-to-date.
                  {pauseRefresh && (
                    <span className="block mt-1.5 sm:mt-1 text-yellow-400 text-xs">
                      ⏸️ Auto-refresh paused while you're filling forms
                    </span>
                  )}
                </p>
                {isMounted && lastRefresh && (
                  <p className="text-xs text-gray-500 mt-1.5 sm:mt-1 break-words">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex-shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className="text-xs sm:text-sm font-medium text-purple-300 whitespace-nowrap">
                {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
              </span>
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}

