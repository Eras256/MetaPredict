'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useMarket } from '@/lib/hooks/useMarkets';
import { useBetting } from '@/lib/hooks/useBetting';

export default function MarketDetailPage() {
  const params = useParams();
  const marketId = Number(params.id);
  const { market, loading } = useMarket(marketId);
  const { placeBet, loading: bettingLoading } = useBetting();
  const [betAmount, setBetAmount] = useState('');
  const [betSide, setBetSide] = useState<'yes' | 'no'>('yes');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pt-32 pb-20 flex items-center justify-center">
        <p className="text-gray-400">Loading market...</p>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pt-32 pb-20 flex items-center justify-center">
        <p className="text-gray-400">Market not found</p>
      </div>
    );
  }

  const totalPool = Number(market.yesPool) + Number(market.noPool);
  const yesOdds = totalPool > 0 ? (Number(market.yesPool) / totalPool) * 100 : 50;
  const noOdds = totalPool > 0 ? (Number(market.noPool) / totalPool) * 100 : 50;

  const handleBet = async () => {
    if (!betAmount) return;
    const amount = BigInt(parseFloat(betAmount) * 1e6); // USDC has 6 decimals
    await placeBet(marketId, betSide === 'yes', amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard className="p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {market.question}
          </h1>
          <p className="text-gray-400 text-lg mb-6">{market.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-5 w-5" />
              <span>Resolution: {new Date(Number(market.resolutionTime) * 1000).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <TrendingUp className="h-5 w-5" />
              <span>Total Pool: ${(totalPool / 1e6).toFixed(2)}M</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Shield className="h-5 w-5" />
              <span>Insurance: ${(Number(market.insuranceReserve) / 1e6).toFixed(2)}</span>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Odds */}
          <GlassCard className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Current Odds</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-green-400">YES</span>
                  <span className="text-2xl font-bold text-white">{yesOdds.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${yesOdds}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">Pool: ${(Number(market.yesPool) / 1e6).toFixed(2)}M</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-red-400">NO</span>
                  <span className="text-2xl font-bold text-white">{noOdds.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-rose-500"
                    style={{ width: `${noOdds}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">Pool: ${(Number(market.noPool) / 1e6).toFixed(2)}M</p>
              </div>
            </div>
          </GlassCard>

          {/* Betting Panel */}
          <GlassCard className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Place Your Bet</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setBetSide('yes')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    betSide === 'yes'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-white/10 bg-white/5 hover:border-green-500/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">YES</div>
                    <div className="text-sm text-gray-400">{yesOdds.toFixed(1)}%</div>
                  </div>
                </button>
                <button
                  onClick={() => setBetSide('no')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    betSide === 'no'
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-white/10 bg-white/5 hover:border-red-500/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400 mb-1">NO</div>
                    <div className="text-sm text-gray-400">{noOdds.toFixed(1)}%</div>
                  </div>
                </button>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (USDC)
                </label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: $1.00</p>
              </div>

              <Button
                onClick={handleBet}
                disabled={!betAmount || bettingLoading}
                size="lg"
                className="w-full"
              >
                {bettingLoading ? 'Processing...' : `Bet ${betSide.toUpperCase()}`}
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

