'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useActiveAccount } from 'thirdweb/react';
import { CONTRACTS } from '@/lib/config/constants';
import { parseUnits, formatUnits } from 'viem';
import { toast } from 'sonner';

// ABI placeholder - should be imported from actual ABI file
const ReputationStakingABI = [
  {
    name: 'getStaker',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [
      { name: 'stakedAmount', type: 'uint256' },
      { name: 'reputationScore', type: 'uint256' },
      { name: 'tier', type: 'uint8' },
      { name: 'correctVotes', type: 'uint256' },
      { name: 'totalVotes', type: 'uint256' },
      { name: 'slashedAmount', type: 'uint256' },
    ],
  },
  {
    name: 'stake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_user', type: 'address' },
      { name: '_amount', type: 'uint256' },
    ],
  },
  {
    name: 'unstake',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_amount', type: 'uint256' }],
  },
] as const;

export function useReputation() {
  const account = useActiveAccount();
  
  const { data: stakerData, isLoading } = useReadContract({
    address: CONTRACTS.REPUTATION_STAKING as `0x${string}`,
    abi: ReputationStakingABI,
    functionName: 'getStaker',
    args: [account?.address as `0x${string}`],
    query: { enabled: !!account },
  });

  const staker = stakerData as any;

  return {
    stakedAmount: staker?.stakedAmount ? Number(formatUnits(staker.stakedAmount, 6)) : 0,
    reputationScore: staker?.reputationScore ? Number(staker.reputationScore) : 0,
    tier: staker?.tier ? Number(staker.tier) : 0,
    correctVotes: staker?.correctVotes ? Number(staker.correctVotes) : 0,
    totalVotes: staker?.totalVotes ? Number(staker.totalVotes) : 0,
    isLoading,
  };
}

export function useStakeReputation() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const stake = async (amount: string) => {
    try {
      const amountWei = parseUnits(amount, 6);
      
      writeContract({
        address: CONTRACTS.PREDICTION_MARKET_CORE as `0x${string}`,
        abi: [] as any, // CoreABI
        functionName: 'stakeReputation',
        args: [amountWei],
      });
      
      toast.success('Staked successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to stake');
      throw error;
    }
  };

  return { stake, isPending: isPending || isConfirming, isSuccess };
}

export function useLeaderboard() {
  // This would typically fetch from a subgraph or API
  const { data, isLoading } = useReadContract({
    address: CONTRACTS.REPUTATION_STAKING as `0x${string}`,
    abi: ReputationStakingABI,
    functionName: 'getStaker',
    args: ['0x0000000000000000000000000000000000000000' as `0x${string}`],
    query: { enabled: false },
  });

  return {
    leaderboard: [],
    isLoading,
  };
}

