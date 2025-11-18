'use client';

import { useState, useMemo } from 'react';
import { useSendTransaction, useActiveAccount, useReadContract } from 'thirdweb/react';
import { defineChain } from 'thirdweb/chains';
import { getContract, prepareContractCall } from 'thirdweb';
import { waitForReceipt } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import { client } from '@/lib/config/thirdweb';
import { toast } from 'sonner';
import { getTransactionUrl, formatTxHash } from '@/lib/utils/blockchain';

// ✅ Configurar opBNB testnet
const opBNBTestnet = defineChain({
  id: 5611,
  name: 'opBNB Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpc: 'https://opbnb-testnet-rpc.bnbchain.org',
});

// ABI simplificado - debería importarse del archivo ABI real
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
  
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.REPUTATION_STAKING) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.REPUTATION_STAKING as `0x${string}`,
      abi: ReputationStakingABI as any,
    });
  }, []);

  const { data: stakerData, isLoading } = useReadContract({
    contract: contract!,
    method: 'getStaker',
    params: account?.address ? [account.address] : undefined,
    queryOptions: { enabled: !!account && !!contract },
  });

  const staker = stakerData as any;

  return {
    stakedAmount: staker?.[0] ? Number(staker[0]) / 1e6 : 0,
    reputationScore: staker?.[1] ? Number(staker[1]) : 0,
    tier: staker?.[2] ? Number(staker[2]) : 0,
    correctVotes: staker?.[3] ? Number(staker[3]) : 0,
    totalVotes: staker?.[4] ? Number(staker[4]) : 0,
    isLoading,
  };
}

export function useStakeReputation() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.REPUTATION_STAKING) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.REPUTATION_STAKING as `0x${string}`,
      abi: ReputationStakingABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const stake = async (amount: bigint) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    if (!contract) {
      throw new Error('Reputation staking contract not configured');
    }
    
    try {
      setLoading(true);
      
      const tx = prepareContractCall({
        contract,
        method: 'stake',
        params: [account.address, amount],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Stake exitoso! Ver transacción: ${formatTxHash(txHash)}`,
        {
          duration: 10000,
          action: {
            label: 'Ver en opBNBScan',
            onClick: () => window.open(txUrl, '_blank'),
          },
        }
      );
      
      return { transactionHash: txHash, receipt: result };
    } catch (error: any) {
      console.error('Error staking:', error);
      toast.error(error?.message || 'Error al hacer stake');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { stake, loading: loading || isSending };
}

export function useUnstakeReputation() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.REPUTATION_STAKING) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.REPUTATION_STAKING as `0x${string}`,
      abi: ReputationStakingABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const unstake = async (amount: bigint) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    if (!contract) {
      throw new Error('Reputation staking contract not configured');
    }
    
    try {
      setLoading(true);
      
      const tx = prepareContractCall({
        contract,
        method: 'unstake',
        params: [amount],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Unstake exitoso! Ver transacción: ${formatTxHash(txHash)}`,
        {
          duration: 10000,
          action: {
            label: 'Ver en opBNBScan',
            onClick: () => window.open(txUrl, '_blank'),
          },
        }
      );
      
      return { transactionHash: txHash, receipt: result };
    } catch (error: any) {
      console.error('Error unstaking:', error);
      toast.error(error?.message || 'Error al hacer unstake');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { unstake, loading: loading || isSending };
}

export function useLeaderboard() {
  // TODO: Implementar con subgraph o API
  return {
    leaderboard: [],
    isLoading: false,
  };
}
