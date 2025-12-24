'use client';

import { useState } from 'react';
import { Users, Loader2, Globe, Award, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useReputationDAO, useJoinReputationDAO, usePortReputationCrossChain } from '@/lib/hooks/reputation/useReputationDAO';
import { useActiveAccount } from 'thirdweb/react';
import { toast } from 'sonner';

export function ReputationDAOPanel() {
  const account = useActiveAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [destinationChainId, setDestinationChainId] = useState('');
  
  const { reputation, minimumStake, isLoading } = useReputationDAO();
  const { joinDAO, isPending: isJoining } = useJoinReputationDAO();
  const { portReputation, isPending: isPorting } = usePortReputationCrossChain();

  const handleJoinDAO = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid stake amount');
      return;
    }

    if (parseFloat(stakeAmount) < minimumStake) {
      toast.error(`Minimum stake is ${minimumStake} BNB`);
      return;
    }

    try {
      const amountBigInt = BigInt(Math.floor(parseFloat(stakeAmount) * 1e18));
      await joinDAO(amountBigInt);
      setStakeAmount('');
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handlePortReputation = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!reputation?.isMember) {
      toast.error('You must be a member of Reputation DAO to port reputation');
      return;
    }

    if (!destinationChainId || isNaN(Number(destinationChainId))) {
      toast.error('Please enter a valid chain ID');
      return;
    }

    try {
      await portReputation(Number(destinationChainId));
      setDestinationChainId('');
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold">Reputation DAO</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
          </div>
        ) : reputation ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Membership Status</span>
                {reputation.isMember ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Award className="w-3 h-3 mr-1" />
                    Member
                  </Badge>
                ) : (
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                    Not a Member
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Stake:</span>
                  <span className="ml-2 text-white font-semibold">{reputation.stake.toFixed(4)} BNB</span>
                </div>
                <div>
                  <span className="text-gray-400">Accuracy:</span>
                  <span className="ml-2 text-white font-semibold">{reputation.accuracy}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Disputes Won:</span>
                  <span className="ml-2 text-white font-semibold">{reputation.disputesWon}</span>
                </div>
                <div>
                  <span className="text-gray-400">Slashes:</span>
                  <span className="ml-2 text-white font-semibold">{reputation.slashesIncurred}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-500/10 rounded-lg border border-gray-500/20 text-center">
            <p className="text-sm text-gray-400">No reputation data found</p>
          </div>
        )}
      </GlassCard>

      {!reputation?.isMember && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Join Reputation DAO</h3>
          
          {!account ? (
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-center">
              <p className="text-sm text-gray-400">Connect your wallet to join</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stake Amount (BNB)
                </label>
                <Input
                  type="number"
                  placeholder={`Minimum: ${minimumStake.toFixed(4)}`}
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  min={minimumStake}
                  step="0.01"
                  disabled={isJoining}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum stake: {minimumStake.toFixed(4)} BNB
                </p>
              </div>

              <Button
                onClick={handleJoinDAO}
                disabled={!stakeAmount || isJoining || parseFloat(stakeAmount) < minimumStake}
                className="w-full"
                size="lg"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-5 w-5" />
                    Join Reputation DAO
                  </>
                )}
              </Button>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300">
                  <strong>Benefits:</strong> Join the Reputation DAO to participate in dispute resolution, earn rewards for correct votes, and build your cross-protocol reputation.
                </p>
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {reputation?.isMember && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold">Port Reputation Cross-Chain</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Destination Chain ID
              </label>
              <Input
                type="number"
                placeholder="e.g., 1 (Ethereum), 56 (BSC), 137 (Polygon)"
                value={destinationChainId}
                onChange={(e) => setDestinationChainId(e.target.value)}
                disabled={isPorting}
              />
            </div>

            <Button
              onClick={handlePortReputation}
              disabled={!destinationChainId || isPorting || isNaN(Number(destinationChainId))}
              className="w-full"
              size="lg"
              variant="outline"
            >
              {isPorting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Porting...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-5 w-5" />
                  Port Reputation
                </>
              )}
            </Button>

            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-xs text-purple-300">
                <strong>Note:</strong> Port your reputation to other chains to maintain your reputation score across multiple protocols. This uses Chainlink CCIP for cross-chain communication.
              </p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

