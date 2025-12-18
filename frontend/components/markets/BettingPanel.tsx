'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Info, Shield, Brain } from 'lucide-react';
import { usePlaceBet } from '@/lib/hooks/betting/usePlaceBet';
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
      // BNB nativo no requiere approval
      await placeBet(marketId, side === 'yes', amount);
      setAmount('');
    } catch (error: any) {
      // El error ya se maneja y muestra en usePlaceBet con toast.error
      // Solo loguear para debugging si es necesario
      // No necesitamos hacer nada más aquí porque usePlaceBet ya muestra el error al usuario
      if (process.env.NODE_ENV === 'development') {
        console.error('[BettingPanel] Error caught (already handled by usePlaceBet):', error);
      }
    }
  };

  return (
    <Card className="w-full relative overflow-hidden border-purple-500/20 bg-gradient-to-br from-white/5 via-purple-500/5 to-pink-500/5 backdrop-blur-sm">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <CardHeader className="p-5 sm:p-6 relative z-10">
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <span className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">Place Your Bet</span>
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
          </span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm shadow-lg shadow-purple-500/10">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
            <span className="text-xs sm:text-sm font-semibold text-purple-200">AI Oracle</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-5 sm:p-6 relative z-10">
        <Tabs value={side} onValueChange={(v) => setSide(v as 'yes' | 'no')}>
          <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-sm border border-white/10 p-1">
            <TabsTrigger 
              value="yes" 
              className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/30 data-[state=active]:to-emerald-500/30 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-green-500/40 data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/20 transition-all"
            >
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-semibold">YES</span>
              <span className="sm:hidden font-semibold">Y</span>
              <span className="font-bold">{yesOdds}%</span>
            </TabsTrigger>
            <TabsTrigger 
              value="no" 
              className="flex items-center gap-2 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500/30 data-[state=active]:to-rose-500/30 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-red-500/40 data-[state=active]:shadow-lg data-[state=active]:shadow-red-500/20 transition-all"
            >
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-semibold">NO</span>
              <span className="sm:hidden font-semibold">N</span>
              <span className="font-bold">{noOdds}%</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="yes" className="space-y-4 sm:space-y-5 mt-5 sm:mt-6">
            <div>
              <label className="text-xs sm:text-sm text-gray-300 mb-2 block font-medium">Amount (BNB)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
                className="text-sm sm:text-base bg-white/5 border-white/20 focus:border-green-500/50 focus:ring-green-500/20"
              />
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="truncate mr-2 text-gray-400">Balance: <span className="text-white font-semibold">{userBalance.toFixed(4)} BNB</span></span>
                <button 
                  onClick={() => setAmount(userBalance.toString())} 
                  className="text-green-400 hover:text-green-300 font-semibold bg-green-500/10 hover:bg-green-500/20 px-3 py-1 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-all flex-shrink-0"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="space-y-2.5 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 backdrop-blur-sm shadow-lg shadow-green-500/10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Estimated Shares</span>
                <span className="text-white font-bold text-base truncate ml-2">{estimatedShares}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Potential Return</span>
                <span className="text-green-400 font-bold text-base truncate ml-2">${potentialReturn}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-green-500/20">
                <span className="text-gray-300 font-medium">Profit</span>
                <span className="text-green-400 font-bold text-lg truncate ml-2">+${(parseFloat(potentialReturn) - parseFloat(amount || '0')).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 backdrop-blur-sm">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-xs text-blue-200 leading-relaxed">
                  0.1% of your bet goes to insurance pool. If Gemini AI oracle fails, you'll get 100% refund.
                </p>
                <p className="text-xs text-purple-300 flex items-center gap-2 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                  <Brain className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate font-medium">Powered by Gemini with automatic fallback</span>
                </p>
              </div>
            </div>

            <Button 
              onClick={handleBet} 
              disabled={isPlacingBet} 
              className="w-full h-12 text-sm sm:text-base font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 hover:scale-[1.02]" 
              size="lg"
            >
              {isPlacingBet ? 'Placing Bet...' : 'Bet YES'}
            </Button>
          </TabsContent>

          <TabsContent value="no" className="space-y-4 sm:space-y-5 mt-5 sm:mt-6">
            <div>
              <label className="text-xs sm:text-sm text-gray-300 mb-2 block font-medium">Amount (BNB)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
                className="text-sm sm:text-base bg-white/5 border-white/20 focus:border-red-500/50 focus:ring-red-500/20"
              />
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="truncate mr-2 text-gray-400">Balance: <span className="text-white font-semibold">{userBalance.toFixed(4)} BNB</span></span>
                <button 
                  onClick={() => setAmount(userBalance.toString())} 
                  className="text-red-400 hover:text-red-300 font-semibold bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all flex-shrink-0"
                >
                  Max
                </button>
              </div>
            </div>

            <div className="space-y-2.5 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/30 backdrop-blur-sm shadow-lg shadow-red-500/10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Estimated Shares</span>
                <span className="text-white font-bold text-base truncate ml-2">{estimatedShares}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Potential Return</span>
                <span className="text-red-400 font-bold text-base truncate ml-2">${potentialReturn}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-red-500/20">
                <span className="text-gray-300 font-medium">Profit</span>
                <span className="text-red-400 font-bold text-lg truncate ml-2">+${(parseFloat(potentialReturn) - parseFloat(amount || '0')).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 backdrop-blur-sm">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-xs text-blue-200 leading-relaxed">
                  0.1% of your bet goes to insurance pool. If Gemini AI oracle fails, you'll get 100% refund.
                </p>
                <p className="text-xs text-purple-300 flex items-center gap-2 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                  <Brain className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate font-medium">Powered by Gemini with automatic fallback</span>
                </p>
              </div>
            </div>

            <Button 
              onClick={handleBet} 
              disabled={isPlacingBet} 
              className="w-full h-12 text-sm sm:text-base font-bold bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:via-rose-700 hover:to-red-700 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 hover:scale-[1.02]" 
              size="lg"
            >
              {isPlacingBet ? 'Placing Bet...' : 'Bet NO'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

