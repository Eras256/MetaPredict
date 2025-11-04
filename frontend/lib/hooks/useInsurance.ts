import { useState } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import InsurancePoolABI from '@/lib/contracts/abi/InsurancePool.json';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import { toast } from 'sonner';

export function useInsurance() {
  const [loading, setLoading] = useState(false);
  
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: poolHealth } = useReadContract({
    address: CONTRACT_ADDRESSES.INSURANCE_POOL,
    abi: InsurancePoolABI,
    functionName: 'getPoolHealth',
  });

  const deposit = async (amount: bigint) => {
    try {
      setLoading(true);
      await writeContract({
        address: CONTRACT_ADDRESSES.INSURANCE_POOL,
        abi: InsurancePoolABI,
        functionName: 'deposit',
        args: [amount, '0x'], // receiver address
      });
      toast.success('Deposit successful!');
    } catch (error: any) {
      console.error('Error depositing:', error);
      toast.error(error?.message || 'Failed to deposit');
    } finally {
      setLoading(false);
    }
  };

  const claimInsurance = async (marketId: number) => {
    try {
      setLoading(true);
      await writeContract({
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
        abi: InsurancePoolABI,
        functionName: 'claimInsurance',
        args: [BigInt(marketId)],
      });
      toast.success('Insurance claim successful!');
    } catch (error: any) {
      console.error('Error claiming insurance:', error);
      toast.error(error?.message || 'Failed to claim insurance');
    } finally {
      setLoading(false);
    }
  };

  return {
    deposit,
    claimInsurance,
    poolHealth,
    loading: loading || isConfirming,
    isSuccess,
  };
}

