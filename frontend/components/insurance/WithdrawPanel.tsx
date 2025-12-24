'use client';

import { useState, useEffect } from 'react';
import { ArrowDownCircle, TrendingUp, Loader2, Coins } from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInsurance } from '@/lib/hooks/insurance/useInsurance';
import { useInsurancePool } from '@/lib/hooks/insurance/useInsurancePool';
import { useActiveAccount } from 'thirdweb/react';
import { toast } from 'sonner';

export function WithdrawPanel() {
  const [amount, setAmount] = useState('');
  const account = useActiveAccount();
  const { withdraw, claimYield, loading } = useInsurance();
  const { apy, userDeposit, pendingYield, loading: poolLoading, refresh } = useInsurancePool();

  // Refresh data after successful withdrawal
  useEffect(() => {
    if (!loading && amount === '') {
      refresh();
    }
  }, [loading, amount, refresh]);

  const handleWithdraw = async () => {
    if (!account) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!userDeposit || userDeposit.amount === BigInt(0)) {
      toast.error('You have no deposit to withdraw');
      return;
    }

    try {
      // Convert amount to bigint (BNB has 18 decimals)
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 1e18));
      
      if (amountBigInt > userDeposit.amount) {
        toast.error('Insufficient balance. You can withdraw up to ' + (Number(userDeposit.amount) / 1e18).toFixed(4) + ' BNB');
        return;
      }

      await withdraw(amountBigInt, account.address, account.address);
      setAmount('');
      toast.success('Withdrawal successful!');
      // Refresh pool data after withdrawal
      setTimeout(() => {
        refresh();
      }, 2000);
    } catch (error: any) {
      console.error('Error withdrawing:', error);
      // Error is already handled in the hook
    }
  };

  const handleClaimYield = async () => {
    if (!account) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!pendingYield || pendingYield === BigInt(0)) {
      toast.error('No pending yield to claim');
      return;
    }

    try {
      await claimYield();
      toast.success('Yield claimed successfully!');
      // Refresh pool data after claiming
      setTimeout(() => {
        refresh();
      }, 2000);
    } catch (error: any) {
      console.error('Error claiming yield:', error);
      // Error is already handled in the hook
    }
  };

  const formatBNB = (value: bigint | null | undefined): string => {
    if (!value || value === BigInt(0)) return '0.0000';
    return `${(Number(value) / 1e18).toFixed(4)}`;
  };

  const maxWithdraw = userDeposit ? Number(userDeposit.amount) / 1e18 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard className="p-8">
        <h2 className="text-2xl font-semibold mb-6">Withdraw from Insurance Pool</h2>
        
        <div className="space-y-4">
          {userDeposit && userDeposit.amount > BigInt(0) && (
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Available to Withdraw</span>
                <span className="text-lg font-semibold text-white">{formatBNB(userDeposit.amount)} BNB</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Your Shares</span>
                <span className="text-sm text-white font-mono">{formatBNB(userDeposit.shares)}</span>
              </div>
              {pendingYield && pendingYield > BigInt(0) && (
                <div className="flex items-center justify-between pt-2 border-t border-blue-500/20">
                  <span className="text-sm text-gray-400">Pending Yield</span>
                  <span className="text-sm font-semibold text-green-400">{formatBNB(pendingYield)} BNB</span>
                </div>
              )}
            </div>
          )}

          {userDeposit && userDeposit.amount > BigInt(0) ? (
            <>
              <div>
                <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (BNB)
                </label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full"
                  disabled={loading}
                  step="0.0001"
                  min="0.0001"
                  max={maxWithdraw}
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">Max: {maxWithdraw.toFixed(4)} BNB</p>
                  <button
                    onClick={() => setAmount(maxWithdraw.toFixed(4))}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    Use Max
                  </button>
                </div>
              </div>

              <Button 
                onClick={handleWithdraw} 
                size="lg" 
                className="w-full"
                disabled={loading || !account || poolLoading || !amount || parseFloat(amount) <= 0}
                variant="outline"
              >
                <ArrowDownCircle className="mr-2 h-5 w-5" />
                {loading ? 'Withdrawing...' : 'Withdraw BNB'}
              </Button>
            </>
          ) : (
            <div className="p-4 bg-gray-500/10 rounded-lg border border-gray-500/20 text-center">
              <p className="text-gray-400 text-sm">You have no deposit to withdraw</p>
              <p className="text-gray-500 text-xs mt-1">Deposit BNB first to start earning yield</p>
            </div>
          )}

          {pendingYield && pendingYield > BigInt(0) && (
            <div className="pt-4 border-t border-white/10">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Pending Yield</span>
                  <span className="text-lg font-semibold text-green-400">{formatBNB(pendingYield)} BNB</span>
                </div>
                <p className="text-xs text-gray-500">Claim your accumulated yield from the pool</p>
              </div>
              <Button 
                onClick={handleClaimYield} 
                size="lg" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading || !account || poolLoading}
              >
                <Coins className="mr-2 h-5 w-5" />
                {loading ? 'Claiming...' : 'Claim Yield'}
              </Button>
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-8">
        <h3 className="text-xl font-semibold mb-4">Withdrawal & Yield Information</h3>
        <ul className="space-y-3 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <span><strong>Share-Based Withdrawal:</strong> When you withdraw, you receive BNB proportional to your shares. The amount = (your shares / total shares) × total pool assets.</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <span><strong>Yield Accumulation:</strong> Your shares automatically accrue value as the pool earns yield. You can claim your accumulated yield at any time.</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <span><strong>No Lock Period:</strong> You can withdraw your deposit at any time. There's no lock period or penalty for early withdrawal.</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <span><strong>Transparent:</strong> All withdrawals, deposits, and yield claims are recorded on-chain and fully transparent.</span>
          </li>
        </ul>
      </GlassCard>
    </div>
  );
}

