'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, Globe, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePlaceBetCrossChain } from '@/lib/hooks/markets/useCreateMarket';
import { useSupportedChains, usePriceComparison } from '@/lib/hooks/omniRouter/useOmniRouter';
import { useActiveAccount } from 'thirdweb/react';
import { toast } from 'sonner';

interface CrossChainBettingPanelProps {
  marketId: number;
  marketQuestion: string;
}

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

export function CrossChainBettingPanel({ marketId, marketQuestion }: CrossChainBettingPanelProps) {
  const account = useActiveAccount();
  const [amount, setAmount] = useState('');
  const [isYes, setIsYes] = useState(true);
  const [targetChainId, setTargetChainId] = useState<number | null>(null);
  
  const { placeBetCrossChain, isPending } = usePlaceBetCrossChain();
  const { chainsWithDetails, isLoading: chainsLoading } = useSupportedChains();
  
  const { bestChainId, bestPrice, estimatedShares, gasCost, isLoading: priceLoading } = 
    usePriceComparison(marketQuestion, isYes, amount);

  const handlePlaceBet = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!targetChainId) {
      toast.error('Please select a target chain');
      return;
    }

    try {
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 1e18));
      await placeBetCrossChain(marketId, isYes, amountBigInt, targetChainId);
      setAmount('');
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold">Cross-Chain Betting</h3>
      </div>

      {!account ? (
        <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-center">
          <p className="text-sm text-gray-400">Connect your wallet to place cross-chain bets</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount (BNB)</label>
            <Input
              type="number"
              placeholder="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.001"
              step="0.001"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Side</label>
            <div className="flex gap-2">
              <Button
                variant={isYes ? 'default' : 'outline'}
                onClick={() => setIsYes(true)}
                disabled={isPending}
                className="flex-1"
              >
                YES
              </Button>
              <Button
                variant={!isYes ? 'default' : 'outline'}
                onClick={() => setIsYes(false)}
                disabled={isPending}
                className="flex-1"
              >
                NO
              </Button>
            </div>
          </div>

          {priceLoading && amount ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
              <span className="ml-2 text-sm text-gray-400">Finding best price...</span>
            </div>
          ) : bestChainId && amount ? (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Best Chain:</span>
                <Badge className="bg-green-500/20 text-green-400">
                  {CHAIN_NAMES[bestChainId] || `Chain ${bestChainId}`}
                </Badge>
              </div>
              {bestPrice && (
                <div className="text-xs text-gray-300 space-y-1">
                  <div>Price: {(Number(bestPrice) / 1e18).toFixed(4)}</div>
                  {estimatedShares && (
                    <div>Estimated Shares: {(Number(estimatedShares) / 1e18).toFixed(4)}</div>
                  )}
                  {gasCost && (
                    <div>Gas Cost: {(Number(gasCost) / 1e18).toFixed(6)} BNB</div>
                  )}
                </div>
              )}
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Chain</label>
            {chainsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
              </div>
            ) : chainsWithDetails.length > 0 ? (
              <select
                value={targetChainId || ''}
                onChange={(e) => setTargetChainId(Number(e.target.value))}
                disabled={isPending}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                <option value="">Select chain...</option>
                {chainsWithDetails.map((chain) => (
                  <option key={chain.chainId} value={chain.chainId}>
                    {chain.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-gray-500">No supported chains available</p>
            )}
          </div>

          <Button
            onClick={handlePlaceBet}
            disabled={!amount || !targetChainId || isPending || parseFloat(amount) <= 0}
            className="w-full"
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Placing Bet...
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-5 w-5" />
                Place Cross-Chain Bet
              </>
            )}
          </Button>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-300">
              <strong>Note:</strong> Cross-chain bets are routed through OmniRouter to find the best price across multiple chains. The bet will be executed on the selected target chain.
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

