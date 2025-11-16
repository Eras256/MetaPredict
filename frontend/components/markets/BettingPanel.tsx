'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Info, Shield, Brain } from 'lucide-react';
import { usePlaceBet, useApproveUSDC } from '@/lib/hooks/betting/useBetting';
import { toast } from 'sonner';

interface BettingPanelProps {
  marketId: number;
  yesOdds: number;
  noOdds: number;
  userBalance: number;
}

export function BettingPanel({ marketId, yesOdds, noOdds, userBalance }: BettingPanelProps) {
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const { placeBet, isPending: isPlacingBet } = usePlaceBet();
  const { approve, isPending: isApproving } = useApproveUSDC();

  const odds = side === 'yes' ? yesOdds : noOdds;
  const estimatedShares = amount ? (parseFloat(amount) / (odds / 100)).toFixed(2) : '0';
  const potentialReturn = amount ? (parseFloat(amount) * (100 / odds)).toFixed(2) : '0';

  const handleBet = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > userBalance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      await approve(amount);
      await placeBet(marketId, side === 'yes', amount);
      setAmount('');
    } catch (error) {
      console.error('Betting error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            Place Your Bet
            <Shield className="w-5 h-5 text-purple-400" />
          </span>
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-300">AI Oracle</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={side} onValueChange={(v) => setSide(v as 'yes' | 'no')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="yes" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              YES {yesOdds}%
            </TabsTrigger>
            <TabsTrigger value="no" className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              NO {noOdds}%
            </TabsTrigger>
          </TabsList>

          <TabsContent value="yes" className="space-y-4 mt-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount (USDC)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Balance: {userBalance.toFixed(2)} USDC</span>
                <button onClick={() => setAmount(userBalance.toString())} className="text-purple-400 hover:underline">
                  Max
                </button>
              </div>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated Shares</span>
                <span className="text-white font-semibold">{estimatedShares}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Potential Return</span>
                <span className="text-green-400 font-semibold">${potentialReturn}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Profit</span>
                <span className="text-green-400 font-semibold">+${(parseFloat(potentialReturn) - parseFloat(amount || '0')).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-blue-300 mb-1">
                  0.1% of your bet goes to insurance pool. If Gemini AI oracle fails, you'll get 100% refund.
                </p>
                <p className="text-xs text-purple-300 flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  Powered by Gemini 2.5 Flash with automatic fallback
                </p>
              </div>
            </div>

            <Button onClick={handleBet} disabled={isPlacingBet || isApproving} className="w-full" size="lg">
              {isApproving ? 'Approving...' : isPlacingBet ? 'Placing Bet...' : 'Bet YES'}
            </Button>
          </TabsContent>

          <TabsContent value="no" className="space-y-4 mt-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount (USDC)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Balance: {userBalance.toFixed(2)} USDC</span>
                <button onClick={() => setAmount(userBalance.toString())} className="text-purple-400 hover:underline">
                  Max
                </button>
              </div>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated Shares</span>
                <span className="text-white font-semibold">{estimatedShares}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Potential Return</span>
                <span className="text-red-400 font-semibold">${potentialReturn}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Profit</span>
                <span className="text-red-400 font-semibold">+${(parseFloat(potentialReturn) - parseFloat(amount || '0')).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-blue-300 mb-1">
                  0.1% of your bet goes to insurance pool. If Gemini AI oracle fails, you'll get 100% refund.
                </p>
                <p className="text-xs text-purple-300 flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  Powered by Gemini 2.5 Flash with automatic fallback
                </p>
              </div>
            </div>

            <Button onClick={handleBet} disabled={isPlacingBet || isApproving} className="w-full" size="lg" variant="destructive">
              {isApproving ? 'Approving...' : isPlacingBet ? 'Placing Bet...' : 'Bet NO'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

