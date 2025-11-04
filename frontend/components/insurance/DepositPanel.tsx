'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function DepositPanel() {
  const [amount, setAmount] = useState('');

  const handleDeposit = async () => {
    // TODO: Implement deposit via contract
    console.log('Deposit:', amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard className="p-8">
        <h2 className="text-2xl font-semibold mb-6">Deposit to Insurance Pool</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              Amount (USDC)
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Current APY</span>
              <span className="text-lg font-semibold text-green-400">8.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Yield Source</span>
              <span className="text-sm text-white">Venus Protocol</span>
            </div>
          </div>

          <Button onClick={handleDeposit} size="lg" className="w-full">
            <DollarSign className="mr-2 h-5 w-5" />
            Deposit USDC
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="p-8">
        <h3 className="text-xl font-semibold mb-4">How Insurance Works</h3>
        <ul className="space-y-3 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <span>Deposit USDC to earn yield via Venus Protocol (8.5% APY)</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <span>Pool automatically covers oracle failures and disputes</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <span>If oracle confidence &lt; 80%, insurance activates</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <span>Users get 100% refund of their investment</span>
          </li>
        </ul>
      </GlassCard>
    </div>
  );
}

