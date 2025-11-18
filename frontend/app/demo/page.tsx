'use client';

// Force dynamic rendering to avoid SSG issues with contract addresses
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  Users, 
  Brain, 
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Info
} from 'lucide-react';
import { GlassCard } from '@/components/effects/GlassCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Hooks
import { useBNBBalance } from '@/lib/hooks/useBNBBalance';
import { usePlaceBet, useClaimWinnings } from '@/lib/hooks/betting/usePlaceBet';
import { useInsurance } from '@/lib/hooks/insurance/useInsurance';
import { useReputation, useStakeReputation, useUnstakeReputation } from '@/lib/hooks/reputation/useReputation';
import { useVoteOnProposal, useExecuteProposal, useProposal } from '@/lib/hooks/dao/useDAO';
import { useOracle } from '@/lib/hooks/useOracle';
import { usePriceComparison, useMarketPrices, useSupportedChains } from '@/lib/hooks/aggregator/useAggregator';
import {
  useCreateBinaryMarket,
  useCreateConditionalMarket,
  useCreateSubjectiveMarket,
  useInitiateResolution,
} from '@/lib/hooks/markets/useCreateMarket';

export default function DemoPage() {
  const account = useActiveAccount();
  const { balance: bnbBalance, isLoading: balanceLoading } = useBNBBalance();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🎮 Demo - On-Chain Features
        </h1>
        <p className="text-gray-400 text-lg">
          Test all available features on MetaPredict.ai
        </p>
        {account && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Wallet className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">
              Balance: {balanceLoading ? '...' : `${bnbBalance.toFixed(4)} BNB`}
            </span>
          </div>
        )}
      </div>

      {!account && (
        <GlassCard className="p-8 text-center mb-8">
          <XCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Please connect your wallet to use on-chain features
          </p>
        </GlassCard>
      )}

      <Tabs defaultValue="tokens" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="tokens" className="gap-2">
            <Wallet className="w-4 h-4" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="betting" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Betting
          </TabsTrigger>
          <TabsTrigger value="insurance" className="gap-2">
            <Shield className="w-4 h-4" />
            Insurance
          </TabsTrigger>
          <TabsTrigger value="reputation" className="gap-2">
            <Users className="w-4 h-4" />
            Reputation
          </TabsTrigger>
          <TabsTrigger value="dao" className="gap-2">
            <Brain className="w-4 h-4" />
            DAO
          </TabsTrigger>
          <TabsTrigger value="oracle" className="gap-2">
            <Zap className="w-4 h-4" />
            Oracle
          </TabsTrigger>
          <TabsTrigger value="markets" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Markets
          </TabsTrigger>
        </TabsList>

        {/* Tokens Tab */}
        <TabsContent value="tokens">
          <TokenOperations />
        </TabsContent>

        {/* Betting Tab */}
        <TabsContent value="betting">
          <BettingOperations />
        </TabsContent>

        {/* Insurance Tab */}
        <TabsContent value="insurance">
          <InsuranceOperations />
        </TabsContent>

        {/* Reputation Tab */}
        <TabsContent value="reputation">
          <ReputationOperations />
        </TabsContent>

        {/* DAO Tab */}
        <TabsContent value="dao">
          <DAOOperations />
        </TabsContent>

        {/* Oracle Tab */}
        <TabsContent value="oracle">
          <OracleOperations />
        </TabsContent>

        {/* Markets Tab */}
        <TabsContent value="markets">
          <MarketOperations />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component: Token Operations
function TokenOperations() {
  const account = useActiveAccount();
  const { balance, isLoading, error, decimals } = useBNBBalance();

  return (
    <div className="grid grid-cols-1 gap-6">
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-400" />
            BNB Balance
          </CardTitle>
          <CardDescription>
            Check your native BNB balance on opBNB Testnet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Current Balance</span>
                <span className="text-2xl font-bold text-white">
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    `${balance.toFixed(4)} BNB`
                  )}
                </span>
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-red-300 font-semibold mb-1">Error reading balance:</p>
                  <p className="text-xs text-red-400">{error.message || 'Unknown error'}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-blue-300 mb-1">
                  This balance is read directly from your wallet on opBNB Testnet. Native BNB does not require approval.
                </p>
                <p className="text-xs text-blue-400">
                  Decimals: {decimals} (Native BNB)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

// Component: Betting Operations
function BettingOperations() {
  const account = useActiveAccount();
  const { balance } = useBNBBalance();
  const { placeBet, isPending: isPlacingBet } = usePlaceBet();
  const [marketId, setMarketId] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [betSide, setBetSide] = useState<'yes' | 'no'>('yes');
  const [claimMarketId, setClaimMarketId] = useState('');
  const { claim, isPending: isClaiming } = useClaimWinnings(parseInt(claimMarketId) || 0);

  const handlePlaceBet = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!marketId || !betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Please complete all fields');
      return;
    }
    try {
      // Native BNB does not require approval
      await placeBet(parseInt(marketId), betSide === 'yes', betAmount);
      setBetAmount('');
    } catch (error) {
      // Error already handled
    }
  };

  const handleClaim = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!claimMarketId) {
      toast.error('Please enter a Market ID');
      return;
    }
    try {
      await claim();
    } catch (error) {
      // Error already handled
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Place Bet
          </CardTitle>
          <CardDescription>
            Place a bet on a prediction market
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Market ID</label>
              <Input
                type="number"
                placeholder="1"
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
                disabled={isPlacingBet || !account}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount (BNB)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                disabled={isPlacingBet || !account}
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Balance: {balance.toFixed(4)} BNB</span>
                <button
                  onClick={() => setBetAmount(balance.toString())}
                  className="text-purple-400 hover:underline"
                >
                  Max
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Side</label>
              <div className="flex gap-2">
                <Button
                  variant={betSide === 'yes' ? 'default' : 'outline'}
                  onClick={() => setBetSide('yes')}
                  className="flex-1"
                  disabled={isPlacingBet || !account}
                >
                  YES
                </Button>
                <Button
                  variant={betSide === 'no' ? 'default' : 'outline'}
                  onClick={() => setBetSide('no')}
                  className="flex-1"
                  disabled={isPlacingBet || !account}
                >
                  NO
                </Button>
              </div>
            </div>
            <Button
              onClick={handlePlaceBet}
              disabled={isPlacingBet || !account}
              className="w-full"
              size="lg"
            >
              {isPlacingBet ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Placing Bet...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Place Bet
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-yellow-400" />
            Claim Winnings
          </CardTitle>
          <CardDescription>
            Claim your winnings from a resolved market
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Market ID</label>
              <Input
                type="number"
                placeholder="1"
                value={claimMarketId}
                onChange={(e) => setClaimMarketId(e.target.value)}
                disabled={isClaiming || !account}
              />
            </div>
            <Button
              onClick={handleClaim}
              disabled={isClaiming || !account}
              className="w-full"
              size="lg"
            >
              {isClaiming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Claim Winnings
                </>
              )}
            </Button>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-300">
                You can only claim winnings from markets that have been resolved and where your bet was winning
              </p>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

// Component: Insurance Operations
function InsuranceOperations() {
  const account = useActiveAccount();
  const { balance } = useBNBBalance();
  const { deposit, withdraw, claimYield, loading } = useInsurance();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleDeposit = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      const amountBigInt = BigInt(Math.floor(parseFloat(depositAmount) * 1e18)); // BNB has 18 decimals
      await deposit(amountBigInt, account.address);
      setDepositAmount('');
    } catch (error) {
      // Error already handled
    }
  };

  const handleWithdraw = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      const amountBigInt = BigInt(Math.floor(parseFloat(withdrawAmount) * 1e18)); // BNB has 18 decimals
      await withdraw(amountBigInt, account.address, account.address);
      setWithdrawAmount('');
    } catch (error) {
      // Error already handled
    }
  };

  const handleClaimYield = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    try {
      await claimYield();
    } catch (error) {
      // Error already handled
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Deposit
          </CardTitle>
          <CardDescription>
            Deposit BNB into the insurance pool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount (BNB)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={loading || !account}
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Balance: {balance.toFixed(4)} BNB</span>
                <button
                  onClick={() => setDepositAmount(balance.toString())}
                  className="text-purple-400 hover:underline"
                >
                  Max
                </button>
              </div>
            </div>
            <Button
              onClick={handleDeposit}
              disabled={loading || !account}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Depositing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Deposit
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-red-400" />
            Withdraw
          </CardTitle>
          <CardDescription>
            Withdraw BNB from the insurance pool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount (BNB)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                disabled={loading || !account}
              />
            </div>
            <Button
              onClick={handleWithdraw}
              disabled={loading || !account}
              className="w-full"
              size="lg"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Withdraw
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Claim Yield
          </CardTitle>
          <CardDescription>
            Claim the yield generated by Venus Protocol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Estimated APY</span>
                <span className="text-lg font-semibold text-green-400">8.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Source</span>
                <span className="text-sm text-white">Native Yield</span>
              </div>
            </div>
            <Button
              onClick={handleClaimYield}
              disabled={loading || !account}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Claim Yield
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

// Component: Reputation Operations
function ReputationOperations() {
  const account = useActiveAccount();
  const { balance } = useBNBBalance();
  const { stakedAmount, reputationScore, tier, isLoading: repLoading } = useReputation();
  const { stake, loading: isStaking } = useStakeReputation();
  const { unstake, loading: isUnstaking } = useUnstakeReputation();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  const tierNames = ['Novice', 'Expert', 'Oracle', 'Legend'];
  const tierColors = ['gray', 'blue', 'purple', 'gold'];

  const handleStake = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      const amountBigInt = BigInt(Math.floor(parseFloat(stakeAmount) * 1e18)); // BNB has 18 decimals
      await stake(amountBigInt);
      setStakeAmount('');
    } catch (error) {
      // Error already handled
    }
  };

  const handleUnstake = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      const amountBigInt = BigInt(Math.floor(parseFloat(unstakeAmount) * 1e18)); // BNB has 18 decimals
      await unstake(amountBigInt);
      setUnstakeAmount('');
    } catch (error) {
      // Error already handled
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Reputation Status
          </CardTitle>
          <CardDescription>
            Your current reputation in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {repLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : (
              <>
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Tier</span>
                    <Badge variant="outline" className="text-purple-300">
                      {tierNames[tier] || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Reputation</span>
                    <span className="text-lg font-semibold text-white">{reputationScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Staked</span>
                    <span className="text-sm text-white">{stakedAmount.toFixed(4)} BNB</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Stake
          </CardTitle>
          <CardDescription>
            Stake BNB to increase your reputation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount (BNB)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                disabled={isStaking || !account}
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Balance: {balance.toFixed(4)} BNB</span>
                <button
                  onClick={() => setStakeAmount(balance.toString())}
                  className="text-purple-400 hover:underline"
                >
                  Max
                </button>
              </div>
            </div>
            <Button
              onClick={handleStake}
              disabled={isStaking || !account}
              className="w-full"
              size="lg"
            >
              {isStaking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Staking...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Stake
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-red-400" />
            Unstake
          </CardTitle>
          <CardDescription>
            Withdraw your reputation stake
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount (BNB)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                disabled={isUnstaking || !account}
              />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Staked: {stakedAmount.toFixed(4)} BNB</span>
                <button
                  onClick={() => setUnstakeAmount(stakedAmount.toString())}
                  className="text-purple-400 hover:underline"
                >
                  Max
                </button>
              </div>
            </div>
            <Button
              onClick={handleUnstake}
              disabled={isUnstaking || !account}
              className="w-full"
              size="lg"
              variant="outline"
            >
              {isUnstaking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Unstaking...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Unstake
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

// Component: DAO Operations
function DAOOperations() {
  const account = useActiveAccount();
  const { vote, isPending: isVoting } = useVoteOnProposal();
  const { execute, isPending: isExecuting } = useExecuteProposal();
  const [proposalId, setProposalId] = useState('');
  const [voteSupport, setVoteSupport] = useState<0 | 1 | 2>(1);
  const [executeProposalId, setExecuteProposalId] = useState('');
  const [checkProposalId, setCheckProposalId] = useState('');
  const { proposal, isLoading: proposalLoading } = useProposal(parseInt(checkProposalId) || 0);

  const handleVote = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!proposalId) {
      toast.error('Please enter a Proposal ID');
      return;
    }
    try {
      await vote(parseInt(proposalId), voteSupport, '');
    } catch (error) {
      // Error already handled
    }
  };

  const handleExecute = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!executeProposalId) {
      toast.error('Please enter a Proposal ID');
      return;
    }
    try {
      await execute(parseInt(executeProposalId));
    } catch (error) {
      // Error already handled
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Vote on Proposal
          </CardTitle>
          <CardDescription>
            Cast your vote on a DAO proposal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Proposal ID</label>
              <Input
                type="number"
                placeholder="1"
                value={proposalId}
                onChange={(e) => setProposalId(e.target.value)}
                disabled={isVoting || !account}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Vote</label>
              <div className="flex gap-2">
                <Button
                  variant={voteSupport === 1 ? 'default' : 'outline'}
                  onClick={() => setVoteSupport(1)}
                  className="flex-1"
                  disabled={isVoting || !account}
                >
                  For
                </Button>
                <Button
                  variant={voteSupport === 0 ? 'default' : 'outline'}
                  onClick={() => setVoteSupport(0)}
                  className="flex-1"
                  disabled={isVoting || !account}
                >
                  Against
                </Button>
                <Button
                  variant={voteSupport === 2 ? 'default' : 'outline'}
                  onClick={() => setVoteSupport(2)}
                  className="flex-1"
                  disabled={isVoting || !account}
                >
                  Abstain
                </Button>
              </div>
            </div>
            <Button
              onClick={handleVote}
              disabled={isVoting || !account}
              className="w-full"
              size="lg"
            >
              {isVoting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Voting...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Vote
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Execute Proposal
          </CardTitle>
          <CardDescription>
            Execute an approved proposal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Proposal ID</label>
              <Input
                type="number"
                placeholder="1"
                value={executeProposalId}
                onChange={(e) => setExecuteProposalId(e.target.value)}
                disabled={isExecuting || !account}
              />
            </div>
            <Button
              onClick={handleExecute}
              disabled={isExecuting || !account}
              className="w-full"
              size="lg"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Execute
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            Check Proposal
          </CardTitle>
          <CardDescription>
            Check the status of a proposal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Proposal ID</label>
              <Input
                type="number"
                placeholder="1"
                value={checkProposalId}
                onChange={(e) => setCheckProposalId(e.target.value)}
                disabled={proposalLoading}
              />
            </div>
            {proposal && (
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Title</span>
                  <span className="text-sm text-white font-semibold">{proposal.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">For</span>
                  <span className="text-sm text-green-400">{proposal.forVotes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Against</span>
                  <span className="text-sm text-red-400">{proposal.againstVotes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Status</span>
                  <Badge variant="outline">
                    {proposal.status === 0 ? 'Pending' : proposal.status === 1 ? 'Active' : 'Executed'}
                  </Badge>
                </div>
              </div>
            )}
            {proposalLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            )}
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

// Component: Oracle Operations
function OracleOperations() {
  const account = useActiveAccount();
  const [marketId, setMarketId] = useState('');
  const { result, loading: oracleLoading } = useOracle(parseInt(marketId) || 0);
  const [priceMarketQuestion, setPriceMarketQuestion] = useState('');
  const [priceIsYes, setPriceIsYes] = useState(true);
  const [priceAmount, setPriceAmount] = useState('');
  const { bestChainId, bestPrice, estimatedShares, isLoading: priceLoading } = usePriceComparison(
    priceMarketQuestion,
    priceIsYes,
    priceAmount || '0'
  );
  const { chains, isLoading: chainsLoading } = useSupportedChains();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Query Oracle Result
          </CardTitle>
          <CardDescription>
            Query the result of a market resolved by the oracle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Market ID</label>
              <Input
                type="number"
                placeholder="1"
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
                disabled={oracleLoading}
              />
            </div>
            {result && (
              <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Resolved</span>
                  <Badge variant={result.resolved ? 'default' : 'outline'}>
                    {result.resolved ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">YES Votes</span>
                  <span className="text-sm text-green-400">{result.yesVotes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">NO Votes</span>
                  <span className="text-sm text-red-400">{result.noVotes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Confidence</span>
                  <span className="text-sm text-white font-semibold">{result.confidence}%</span>
                </div>
              </div>
            )}
            {oracleLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
              </div>
            )}
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Compare Prices (OmniRouter)
          </CardTitle>
          <CardDescription>
            Find the best cross-chain price
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Market Question</label>
              <Input
                type="text"
                placeholder="Will BTC reach $100K?"
                value={priceMarketQuestion}
                onChange={(e) => setPriceMarketQuestion(e.target.value)}
                disabled={priceLoading}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Side</label>
              <div className="flex gap-2">
                <Button
                  variant={priceIsYes ? 'default' : 'outline'}
                  onClick={() => setPriceIsYes(true)}
                  className="flex-1"
                  disabled={priceLoading}
                >
                  YES
                </Button>
                <Button
                  variant={!priceIsYes ? 'default' : 'outline'}
                  onClick={() => setPriceIsYes(false)}
                  className="flex-1"
                  disabled={priceLoading}
                >
                  NO
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Amount (BNB)</label>
              <Input
                type="number"
                placeholder="0.1"
                value={priceAmount}
                onChange={(e) => setPriceAmount(e.target.value)}
                disabled={priceLoading}
              />
            </div>
            {bestPrice !== null && (
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Best Chain ID</span>
                  <span className="text-sm text-white font-semibold">{bestChainId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Best Price</span>
                  <span className="text-sm text-green-400 font-semibold">{bestPrice}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Estimated Shares</span>
                  <span className="text-sm text-white">{estimatedShares}</span>
                </div>
              </div>
            )}
            {priceLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              </div>
            )}
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard className="p-6 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            Supported Chains (OmniRouter)
          </CardTitle>
          <CardDescription>
            List of chains supported by the cross-chain aggregator
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chainsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {chains && chains.length > 0 ? (
                chains.map((chainId: bigint, index: number) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    Chain ID: {chainId.toString()}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-400">No chains configured</p>
              )}
            </div>
          )}
        </CardContent>
      </GlassCard>
    </div>
  );
}

// Component: Market Operations
function MarketOperations() {
  const account = useActiveAccount();
  const { createMarket: createBinary, isPending: isCreatingBinary } = useCreateBinaryMarket();
  const { createMarket: createConditional, isPending: isCreatingConditional } = useCreateConditionalMarket();
  const { createMarket: createSubjective, isPending: isCreatingSubjective } = useCreateSubjectiveMarket();
  const { initiateResolution, isPending: isInitiating } = useInitiateResolution();

  // Binary Market
  const [binaryQuestion, setBinaryQuestion] = useState('');
  const [binaryDescription, setBinaryDescription] = useState('');
  const [binaryResolutionTime, setBinaryResolutionTime] = useState('');

  // Conditional Market
  const [conditionalParentId, setConditionalParentId] = useState('');
  const [conditionalCondition, setConditionalCondition] = useState('');
  const [conditionalQuestion, setConditionalQuestion] = useState('');
  const [conditionalResolutionTime, setConditionalResolutionTime] = useState('');

  // Subjective Market
  const [subjectiveQuestion, setSubjectiveQuestion] = useState('');
  const [subjectiveDescription, setSubjectiveDescription] = useState('');
  const [subjectiveResolutionTime, setSubjectiveResolutionTime] = useState('');
  const [subjectiveExpertise, setSubjectiveExpertise] = useState('');

  // Resolution
  const [resolutionMarketId, setResolutionMarketId] = useState('');

  const handleCreateBinary = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!binaryQuestion || !binaryDescription || !binaryResolutionTime) {
      toast.error('Please complete all fields');
      return;
    }
    try {
      const resolutionTimestamp = Math.floor(new Date(binaryResolutionTime).getTime() / 1000);
      await createBinary(binaryQuestion, binaryDescription, resolutionTimestamp);
      setBinaryQuestion('');
      setBinaryDescription('');
      setBinaryResolutionTime('');
    } catch (error) {
      // Error already handled
    }
  };

  const handleCreateConditional = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!conditionalParentId || !conditionalCondition || !conditionalQuestion || !conditionalResolutionTime) {
      toast.error('Please complete all fields');
      return;
    }
    try {
      const resolutionTimestamp = Math.floor(new Date(conditionalResolutionTime).getTime() / 1000);
      await createConditional(
        parseInt(conditionalParentId),
        conditionalCondition,
        conditionalQuestion,
        resolutionTimestamp
      );
      setConditionalParentId('');
      setConditionalCondition('');
      setConditionalQuestion('');
      setConditionalResolutionTime('');
    } catch (error) {
      // Error already handled
    }
  };

  const handleCreateSubjective = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!subjectiveQuestion || !subjectiveDescription || !subjectiveResolutionTime || !subjectiveExpertise) {
      toast.error('Please complete all fields');
      return;
    }
    try {
      const resolutionTimestamp = Math.floor(new Date(subjectiveResolutionTime).getTime() / 1000);
      await createSubjective(subjectiveQuestion, subjectiveDescription, resolutionTimestamp, subjectiveExpertise);
      setSubjectiveQuestion('');
      setSubjectiveDescription('');
      setSubjectiveResolutionTime('');
      setSubjectiveExpertise('');
    } catch (error) {
      // Error already handled
    }
  };

  const handleInitiateResolution = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!resolutionMarketId) {
      toast.error('Please enter a Market ID');
      return;
    }
    try {
      await initiateResolution(parseInt(resolutionMarketId));
      setResolutionMarketId('');
    } catch (error) {
      // Error already handled
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create Binary Market */}
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Create Binary Market
          </CardTitle>
          <CardDescription>Create a standard YES/NO prediction market</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Question</label>
              <Input
                type="text"
                placeholder="Will BTC reach $100K?"
                value={binaryQuestion}
                onChange={(e) => setBinaryQuestion(e.target.value)}
                disabled={isCreatingBinary || !account}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Description</label>
              <Input
                type="text"
                placeholder="Market description"
                value={binaryDescription}
                onChange={(e) => setBinaryDescription(e.target.value)}
                disabled={isCreatingBinary || !account}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Resolution Time</label>
              <Input
                type="datetime-local"
                value={binaryResolutionTime}
                onChange={(e) => setBinaryResolutionTime(e.target.value)}
                disabled={isCreatingBinary || !account}
              />
            </div>
            <Button
              onClick={handleCreateBinary}
              disabled={isCreatingBinary || !account}
              className="w-full"
              size="lg"
            >
              {isCreatingBinary ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Create Market
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      {/* Create Conditional Market */}
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Create Conditional Market
          </CardTitle>
          <CardDescription>Create an if-then conditional market</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Parent Market ID</label>
              <Input
                type="number"
                placeholder="1"
                value={conditionalParentId}
                onChange={(e) => setConditionalParentId(e.target.value)}
                disabled={isCreatingConditional || !account}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Condition</label>
              <Input
                type="text"
                placeholder="if YES on parent"
                value={conditionalCondition}
                onChange={(e) => setConditionalCondition(e.target.value)}
                disabled={isCreatingConditional || !account}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Question</label>
              <Input
                type="text"
                placeholder="Will X happen?"
                value={conditionalQuestion}
                onChange={(e) => setConditionalQuestion(e.target.value)}
                disabled={isCreatingConditional || !account}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Resolution Time</label>
              <Input
                type="datetime-local"
                value={conditionalResolutionTime}
                onChange={(e) => setConditionalResolutionTime(e.target.value)}
                disabled={isCreatingConditional || !account}
              />
            </div>
            <Button
              onClick={handleCreateConditional}
              disabled={isCreatingConditional || !account}
              className="w-full"
              size="lg"
            >
              {isCreatingConditional ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Create Market
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      {/* Create Subjective Market */}
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Create Subjective Market
          </CardTitle>
          <CardDescription>Create a market resolved by DAO voting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Question</label>
              <Input
                type="text"
                placeholder="Is this movie good?"
                value={subjectiveQuestion}
                onChange={(e) => setSubjectiveQuestion(e.target.value)}
                disabled={isCreatingSubjective || !account}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Description</label>
              <Input
                type="text"
                placeholder="Market description"
                value={subjectiveDescription}
                onChange={(e) => setSubjectiveDescription(e.target.value)}
                disabled={isCreatingSubjective || !account}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Expertise Required</label>
              <Input
                type="text"
                placeholder="film critics, economists, etc."
                value={subjectiveExpertise}
                onChange={(e) => setSubjectiveExpertise(e.target.value)}
                disabled={isCreatingSubjective || !account}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Resolution Time</label>
              <Input
                type="datetime-local"
                value={subjectiveResolutionTime}
                onChange={(e) => setSubjectiveResolutionTime(e.target.value)}
                disabled={isCreatingSubjective || !account}
              />
            </div>
            <Button
              onClick={handleCreateSubjective}
              disabled={isCreatingSubjective || !account}
              className="w-full"
              size="lg"
            >
              {isCreatingSubjective ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Create Market
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </GlassCard>

      {/* Initiate Resolution */}
      <GlassCard className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Initiate Resolution
          </CardTitle>
          <CardDescription>Start resolution process for a market</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Market ID</label>
              <Input
                type="number"
                placeholder="1"
                value={resolutionMarketId}
                onChange={(e) => setResolutionMarketId(e.target.value)}
                disabled={isInitiating || !account}
              />
            </div>
            <Button
              onClick={handleInitiateResolution}
              disabled={isInitiating || !account}
              className="w-full"
              size="lg"
            >
              {isInitiating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initiating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Initiate Resolution
                </>
              )}
            </Button>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-300">
                This will trigger AI Oracle resolution for binary/conditional markets, or DAO voting for subjective markets
              </p>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

