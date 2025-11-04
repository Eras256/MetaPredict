'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/lib/config/constants';
import { parseUnits, formatUnits } from 'viem';
import { toast } from 'sonner';

// ABI placeholder
const InsurancePoolABI = [
  {
    name: 'getPoolHealth',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'totalAsset', type: 'uint256' },
      { name: 'insured', type: 'uint256' },
      { name: 'claimed', type: 'uint256' },
      { name: 'available', type: 'uint256' },
      { name: 'utilizationRate', type: 'uint256' },
      { name: 'yieldAPY', type: 'uint256' },
    ],
  },
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' },
    ],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' },
      { name: 'owner', type: 'address' },
    ],
    outputs: [{ name: 'shares', type: 'uint256' }],
  },
  {
    name: 'claimYield',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
  },
  {
    name: 'getPendingYield',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function useInsurancePool() {
  const { data: poolHealth } = useReadContract({
    address: CONTRACTS.INSURANCE_POOL as `0x${string}`,
    abi: InsurancePoolABI,
    functionName: 'getPoolHealth',
  });

  const health = poolHealth as any;

  return {
    totalAssets: health ? Number(formatUnits(health[0], 6)) : 0,
    totalInsured: health ? Number(formatUnits(health[1], 6)) : 0,
    totalClaimed: health ? Number(formatUnits(health[2], 6)) : 0,
    available: health ? Number(formatUnits(health[3], 6)) : 0,
    utilizationRate: health ? Number(health[4]) / 100 : 0,
    yieldAPY: health ? Number(health[5]) / 100 : 0,
  };
}

export function useDepositInsurance() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = async (amount: string, receiver: string) => {
    try {
      const amountWei = parseUnits(amount, 6);
      
      writeContract({
        address: CONTRACTS.INSURANCE_POOL as `0x${string}`,
        abi: InsurancePoolABI,
        functionName: 'deposit',
        args: [amountWei, receiver as `0x${string}`],
      });
      
      toast.success('Deposited to insurance pool!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to deposit');
      throw error;
    }
  };

  return { deposit, isPending: isPending || isConfirming, isSuccess };
}

export function useWithdrawInsurance() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = async (amount: string, receiver: string, owner: string) => {
    try {
      const amountWei = parseUnits(amount, 6);
      
      writeContract({
        address: CONTRACTS.INSURANCE_POOL as `0x${string}`,
        abi: InsurancePoolABI,
        functionName: 'withdraw',
        args: [amountWei, receiver as `0x${string}`, owner as `0x${string}`],
      });
      
      toast.success('Withdrawn from insurance pool!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to withdraw');
      throw error;
    }
  };

  return { withdraw, isPending: isPending || isConfirming, isSuccess };
}

export function useClaimInsuranceYield() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimYield = async () => {
    try {
      writeContract({
        address: CONTRACTS.INSURANCE_POOL as `0x${string}`,
        abi: InsurancePoolABI,
        functionName: 'claimYield',
        args: [],
      });
      
      toast.success('Yield claimed!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim yield');
      throw error;
    }
  };

  return { claimYield, isPending: isPending || isConfirming, isSuccess };
}

