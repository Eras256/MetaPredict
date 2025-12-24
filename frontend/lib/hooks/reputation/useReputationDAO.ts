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

const ReputationDAOABI = [
  {
    name: 'joinDAO',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_stakeAmount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getReputation',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [
      { name: 'stake', type: 'uint256' },
      { name: 'accuracy', type: 'uint256' },
      { name: 'disputesWon', type: 'uint256' },
      { name: 'slashesIncurred', type: 'uint256' },
      { name: 'isMember', type: 'bool' },
      { name: 'joinedAt', type: 'uint256' },
    ],
  },
  {
    name: 'portReputationCrossChain',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_destinationChainId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'minimumStake',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function useReputationDAO() {
  const account = useActiveAccount();
  
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.REPUTATION_DAO) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.REPUTATION_DAO as `0x${string}`,
      abi: ReputationDAOABI as any,
    });
  }, []);

  const { data: reputationData, isLoading } = useReadContract({
    contract: contract!,
    method: 'getReputation',
    params: account?.address ? [account.address] : undefined,
    queryOptions: { 
      enabled: !!account && !!contract,
      refetchInterval: 30000,
    },
  });

  const { data: minStake } = useReadContract({
    contract: contract!,
    method: 'minimumStake',
    params: [],
    queryOptions: { enabled: !!contract },
  });

  const reputation = reputationData as any;

  return {
    reputation: reputation
      ? {
          stake: Number(reputation[0]) / 1e18,
          accuracy: Number(reputation[1]),
          disputesWon: Number(reputation[2]),
          slashesIncurred: Number(reputation[3]),
          isMember: Boolean(reputation[4]),
          joinedAt: Number(reputation[5]),
        }
      : null,
    minimumStake: minStake ? Number(minStake) / 1e18 : 0,
    isLoading,
  };
}

export function useJoinReputationDAO() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.REPUTATION_DAO) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.REPUTATION_DAO as `0x${string}`,
      abi: ReputationDAOABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const joinDAO = async (stakeAmount: bigint) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    if (!contract) {
      throw new Error('ReputationDAO contract not configured');
    }

    try {
      setLoading(true);
      
      const tx = prepareContractCall({
        contract,
        method: 'joinDAO',
        params: [stakeAmount],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Successfully joined Reputation DAO! View transaction: ${formatTxHash(txHash)}`,
        {
          duration: 10000,
          action: {
            label: 'View on opBNBScan',
            onClick: () => window.open(txUrl, '_blank'),
          },
        }
      );
      
      return { transactionHash: txHash, receipt: result };
    } catch (error: any) {
      console.error('Error joining Reputation DAO:', error);
      
      let errorMessage = error?.message || 'Error joining Reputation DAO';
      
      if (errorMessage.includes('Stake too low')) {
        errorMessage = 'Stake amount is below the minimum required';
      } else if (errorMessage.includes('Already member')) {
        errorMessage = 'You are already a member of the Reputation DAO';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { joinDAO, isPending: loading || isSending };
}

export function usePortReputationCrossChain() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.REPUTATION_DAO) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.REPUTATION_DAO as `0x${string}`,
      abi: ReputationDAOABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const portReputation = async (destinationChainId: number) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    if (!contract) {
      throw new Error('ReputationDAO contract not configured');
    }

    try {
      setLoading(true);
      
      const tx = prepareContractCall({
        contract,
        method: 'portReputationCrossChain',
        params: [BigInt(destinationChainId)],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Reputation porting initiated! View transaction: ${formatTxHash(txHash)}`,
        {
          duration: 10000,
          action: {
            label: 'View on opBNBScan',
            onClick: () => window.open(txUrl, '_blank'),
          },
        }
      );
      
      return { transactionHash: txHash, receipt: result };
    } catch (error: any) {
      console.error('Error porting reputation:', error);
      toast.error(error?.message || 'Error porting reputation cross-chain');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { portReputation, isPending: loading || isSending };
}

