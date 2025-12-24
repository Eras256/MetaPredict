'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInsurance } from '@/lib/hooks/insurance/useInsurance';
import { useInsurancePool } from '@/lib/hooks/insurance/useInsurancePool';
import { useActiveAccount } from 'thirdweb/react';
import { toast } from 'sonner';

export function DepositPanel() {
  const [amount, setAmount] = useState('');
  const account = useActiveAccount();
  const { deposit, loading } = useInsurance();
  const { apy, userDeposit, loading: poolLoading, refresh } = useInsurancePool();

  // Refresh data after successful deposit
  useEffect(() => {
    if (!loading && amount === '') {
      refresh();
    }
  }, [loading, amount, refresh]);

  const handleDeposit = async () => {
    if (!account) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      // Convert amount to bigint (BNB has 18 decimals)
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 1e18));
      await deposit(amountBigInt, account.address);
      setAmount('');
      toast.success('Deposit successful!');
      // Refresh pool data after deposit
      setTimeout(() => {
        refresh();
      }, 2000);
    } catch (error: any) {
      console.error('Error depositing:', error);
      // Error is already handled in the hook
    }
  };

  const formatBNB = (value: bigint | null | undefined): string => {
    if (!value || value === BigInt(0)) return '0.0000';
    return `${(Number(value) / 1e18).toFixed(4)}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard className="p-8">
        <h2 className="text-2xl font-semibold mb-6">Deposit to Insurance Pool</h2>
        
        <div className="space-y-4">
          {userDeposit && userDeposit.amount > BigInt(0) && (
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Your Deposit</span>
                <span className="text-lg font-semibold text-white">{formatBNB(userDeposit.amount)} BNB</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Your Shares (ERC-4626 Compatible)</span>
                <span className="text-sm text-white font-mono">{formatBNB(userDeposit.shares)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Share Price</span>
                <span className="text-xs text-gray-400">
                  {userDeposit.shares > BigInt(0) 
                    ? `${(Number(userDeposit.amount) / Number(userDeposit.shares) * 1e18).toFixed(6)} BNB/share`
                    : 'N/A'}
                </span>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
              Amount (BNB)
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
              disabled={loading}
              step="0.0001"
              min="0.01"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum deposit: 0.01 BNB</p>
          </div>

          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            {poolLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Current APY</span>
                  <span className="text-lg font-semibold text-green-400">
                    {apy > 0 ? `${apy.toFixed(2)}%` : 'Calculating...'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Yield Source</span>
                  <span className="text-sm text-white">Native Yield</span>
                </div>
              </>
            )}
          </div>

          <Button 
            onClick={handleDeposit} 
            size="lg" 
            className="w-full"
            disabled={loading || !account || poolLoading}
          >
            <DollarSign className="mr-2 h-5 w-5" />
            {loading ? 'Depositing...' : 'Deposit BNB'}
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="p-8">
        <h3 className="text-xl font-semibold mb-4">How Insurance Works (ERC-4626 Compatible)</h3>
        <ul className="space-y-3 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <span><strong>Share-Based System:</strong> When you deposit BNB, you receive shares proportional to your deposit. Shares represent your ownership in the pool.</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <span><strong>Yield Generation:</strong> Pool generates returns through native staking and yield strategies. Your shares automatically accrue value as the pool earns yield.</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <span><strong>Oracle Protection:</strong> Pool automatically covers oracle failures and disputes. If oracle confidence &lt; 80%, insurance activates.</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <span><strong>100% Refund:</strong> Users get 100% refund of their investment when insurance activates. All deposits and yields are transparent on-chain.</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <span><strong>Withdraw Anytime:</strong> You can withdraw your shares at any time. The amount you receive = (your shares / total shares) × total pool assets.</span>
          </li>
        </ul>
      </GlassCard>
    </div>
  );
}
