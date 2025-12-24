'use client';

import { useState, useEffect } from 'react';
import { Globe, Clock, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserPendingBets, usePendingBet } from '@/lib/hooks/omniRouter/useOmniRouter';
import { useActiveAccount } from 'thirdweb/react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  56: 'BSC Mainnet',
  97: 'BSC Testnet',
  137: 'Polygon Mainnet',
  204: 'opBNB Mainnet',
  5611: 'opBNB Testnet',
  42161: 'Arbitrum One',
  10: 'Optimism',
};

const BET_STATUS = {
  0: { label: 'Pending', color: 'yellow', icon: Clock },
  1: { label: 'Executed', color: 'green', icon: CheckCircle },
  2: { label: 'Failed', color: 'red', icon: XCircle },
  3: { label: 'Cancelled', color: 'gray', icon: XCircle },
};

export function PendingCrossChainBets() {
  const account = useActiveAccount();
  const { betIds, isLoading } = useUserPendingBets();
  const [bets, setBets] = useState<any[]>([]);
  const [loadingBets, setLoadingBets] = useState(false);

  useEffect(() => {
    if (!account || !betIds || betIds.length === 0) {
      setBets([]);
      return;
    }

    const fetchBets = async () => {
      setLoadingBets(true);
      try {
        const betsData = await Promise.all(
          betIds.map(async (betId: string) => {
            // We'll need to fetch each bet individually
            // For now, we'll just store the betId
            return { betId };
          })
        );
        setBets(betsData);
      } catch (error) {
        console.error('Error fetching pending bets:', error);
        setBets([]);
      } finally {
        setLoadingBets(false);
      }
    };

    fetchBets();
  }, [account, betIds]);

  if (!account) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Connect your wallet to view pending cross-chain bets</p>
        </div>
      </GlassCard>
    );
  }

  if (isLoading || loadingBets) {
    return (
      <GlassCard className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </GlassCard>
    );
  }

  if (!betIds || betIds.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold">Pending Cross-Chain Bets</h3>
        </div>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-2">No pending cross-chain bets</p>
          <p className="text-gray-500 text-xs">Your cross-chain bets will appear here once placed</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold">Pending Cross-Chain Bets</h3>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          {betIds.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {betIds.map((betId: string, index: number) => (
          <PendingBetItem key={betId} betId={betId} />
        ))}
      </div>
    </GlassCard>
  );
}

function PendingBetItem({ betId }: { betId: string }) {
  const { bet, isLoading } = usePendingBet(betId);

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  if (!bet) {
    return null;
  }

  const status = BET_STATUS[bet.status as keyof typeof BET_STATUS] || BET_STATUS[0];
  const StatusIcon = status.icon;

  return (
    <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              className={`bg-${status.color}-500/20 text-${status.color}-400 border-${status.color}-500/30`}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {bet.isYes ? 'YES' : 'NO'}
            </Badge>
          </div>
          <div className="text-sm text-gray-300 space-y-1">
            <div>
              <span className="text-gray-400">Amount: </span>
              <span className="font-semibold text-white">{bet.amount.toFixed(4)} BNB</span>
            </div>
            <div>
              <span className="text-gray-400">From: </span>
              <span className="text-white">
                {CHAIN_NAMES[bet.sourceChainId] || `Chain ${bet.sourceChainId}`}
              </span>
            </div>
            <div>
              <span className="text-gray-400">To: </span>
              <span className="text-white">
                {CHAIN_NAMES[bet.targetChainId] || `Chain ${bet.targetChainId}`}
              </span>
            </div>
            {bet.timestamp && (
              <div className="text-xs text-gray-500 mt-2">
                {new Date(bet.timestamp * 1000).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

