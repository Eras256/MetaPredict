'use client';

import { useState } from 'react';
import { Vote, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVoteOnDispute } from '@/lib/hooks/markets/useCreateMarket';
import { useActiveAccount } from 'thirdweb/react';
import { toast } from 'sonner';

interface DisputeVotingPanelProps {
  marketId: number;
  marketQuestion: string;
}

export function DisputeVotingPanel({ marketId, marketQuestion }: DisputeVotingPanelProps) {
  const account = useActiveAccount();
  const { voteOnDispute, isPending } = useVoteOnDispute();
  const [selectedVote, setSelectedVote] = useState<1 | 2 | 3 | null>(null);

  const handleVote = async (vote: 1 | 2 | 3) => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setSelectedVote(vote);
      await voteOnDispute(marketId, vote);
      setSelectedVote(null);
    } catch (error) {
      setSelectedVote(null);
      // Error already handled in hook
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Vote className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold">Vote on Dispute</h3>
      </div>

      {!account ? (
        <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-center">
          <p className="text-sm text-gray-400">Connect your wallet to vote on disputes</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-xs text-purple-300 mb-2">
              <strong>Market:</strong> {marketQuestion}
            </p>
            <p className="text-xs text-gray-400">
              This market is in dispute. Cast your vote to help resolve it. Your vote weight is based on your staked reputation.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => handleVote(1)}
              disabled={isPending || selectedVote !== null}
              className="w-full justify-start"
              variant={selectedVote === 1 ? 'default' : 'outline'}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Vote Yes
            </Button>
            <Button
              onClick={() => handleVote(2)}
              disabled={isPending || selectedVote !== null}
              className="w-full justify-start"
              variant={selectedVote === 2 ? 'default' : 'outline'}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Vote No
            </Button>
            <Button
              onClick={() => handleVote(3)}
              disabled={isPending || selectedVote !== null}
              className="w-full justify-start"
              variant={selectedVote === 3 ? 'default' : 'outline'}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Vote Invalid
            </Button>
          </div>

          {isPending && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
              <span className="ml-2 text-sm text-gray-400">Processing vote...</span>
            </div>
          )}

          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-yellow-300 font-semibold mb-1">Important</p>
                <ul className="text-xs text-yellow-200 space-y-1 list-disc list-inside">
                  <li>You must have staked reputation to vote</li>
                  <li>Incorrect votes result in 20% slashing penalty</li>
                  <li>Correct votes earn rewards from slashed amounts</li>
                  <li>Vote weight = √(staked BNB)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

