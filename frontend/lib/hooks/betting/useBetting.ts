'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACTS } from '@/lib/config/constants';
import { toast } from 'sonner';

// ABI placeholder
const PredictionMarketCoreABI = [
  {
    name: 'placeBet',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_marketId', type: 'uint256' },
      { name: '_isYes', type: 'bool' },
      { name: '_amount', type: 'uint256' },
    ],
  },
  {
    name: 'getMarketContract',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

const USDCABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

const BinaryMarketABI = [
  {
    name: 'claimWinnings',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_marketId', type: 'uint256' }],
  },
] as const;

export function usePlaceBet() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const placeBet = async (marketId: number, isYes: boolean, amount: string) => {
    try {
      const amountWei = parseUnits(amount, 6);
      
      writeContract({
        address: CONTRACTS.PREDICTION_MARKET_CORE as `0x${string}`,
        abi: PredictionMarketCoreABI,
        functionName: 'placeBet',
        args: [BigInt(marketId), isYes, amountWei],
      });
      
      toast.success('Bet placed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place bet');
      throw error;
    }
  };

  return { placeBet, isPending: isPending || isConfirming, isSuccess, hash };
}

export function useApproveUSDC() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = async (amount: string) => {
    try {
      const amountWei = parseUnits(amount, 6);
      
      writeContract({
        address: CONTRACTS.USDC as `0x${string}`,
        abi: USDCABI,
        functionName: 'approve',
        args: [CONTRACTS.PREDICTION_MARKET_CORE as `0x${string}`, amountWei],
      });
      
      toast.success('Approval successful!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve');
      throw error;
    }
  };

  return { approve, isPending: isPending || isConfirming, isSuccess };
}

export function useClaimWinnings(marketId: number) {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  
  const { data: marketContract } = useReadContract({
    address: CONTRACTS.PREDICTION_MARKET_CORE as `0x${string}`,
    abi: PredictionMarketCoreABI,
    functionName: 'getMarketContract',
    args: [BigInt(marketId)],
  });

  const claim = async () => {
    try {
      if (!marketContract) {
        throw new Error('Market contract not found');
      }

      writeContract({
        address: marketContract as `0x${string}`,
        abi: BinaryMarketABI,
        functionName: 'claimWinnings',
        args: [BigInt(marketId)],
      });
      
      toast.success('Winnings claimed!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim');
      throw error;
    }
  };

  return { claim, isPending: isPending || isConfirming, isSuccess };
}

