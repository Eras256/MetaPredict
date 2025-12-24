'use client';

import Link from 'next/link';
import { ExternalLink, GitBranch } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Badge } from '@/components/ui/badge';
import { useChildMarkets } from '@/lib/hooks/markets/useMarketData';
import { Skeleton } from '@/components/ui/skeleton';

interface ChildMarketsPanelProps {
  parentMarketId: number;
}

export function ChildMarketsPanel({ parentMarketId }: ChildMarketsPanelProps) {
  const { childMarketIds, isLoading } = useChildMarkets(parentMarketId);

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <Skeleton className="h-32 w-full" />
      </GlassCard>
    );
  }

  if (!childMarketIds || childMarketIds.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold">Child Markets</h3>
        </div>
        <div className="p-4 rounded-lg bg-gray-500/10 border border-gray-500/20 text-center">
          <p className="text-sm text-gray-400">No child markets created yet</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold">Child Markets</h3>
        <Badge className="bg-purple-500/20 text-purple-400">
          {childMarketIds.length}
        </Badge>
      </div>
      
      <div className="space-y-2">
        {childMarketIds.map((childId) => (
          <Link
            key={childId}
            href={`/markets/${childId}`}
            className="block p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  Market #{childId}
                </span>
                <Badge variant="outline" className="text-xs">
                  Conditional
                </Badge>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}

