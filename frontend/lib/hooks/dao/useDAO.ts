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

// ABI simplificado - debería importarse del archivo ABI real
const DAOGovernanceABI = [
  {
    name: 'getProposal',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_proposalId', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'proposalType', type: 'uint8' },
      { name: 'proposer', type: 'address' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'forVotes', type: 'uint256' },
      { name: 'againstVotes', type: 'uint256' },
      { name: 'abstainVotes', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'executed', type: 'bool' },
    ],
  },
  {
    name: 'castVote',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_proposalId', type: 'uint256' },
      { name: '_support', type: 'uint8' },
      { name: '_expertiseDomain', type: 'string' },
    ],
  },
  {
    name: 'executeProposal',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_proposalId', type: 'uint256' }],
  },
  {
    name: 'getUserProposals',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'getUserVotes',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'getExpertise',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_user', type: 'address' },
      { name: '_domain', type: 'string' },
    ],
    outputs: [
      { name: 'domain', type: 'string' },
      { name: 'score', type: 'uint256' },
      { name: 'verified', type: 'bool' },
      { name: 'verifiedAt', type: 'uint256' },
      { name: 'attestations', type: 'address[]' },
    ],
  },
] as const;

export function useProposal(proposalId: number) {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DAO_GOVERNANCE) return null;
    try {
      // Validar que la dirección tenga el formato correcto
      const addr = CONTRACT_ADDRESSES.DAO_GOVERNANCE;
      if (!addr || addr.length !== 42 || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
        console.warn('Invalid DAO_GOVERNANCE address:', addr);
        return null;
      }
      return getContract({
        client,
        chain: opBNBTestnet,
        address: addr,
        abi: DAOGovernanceABI as any,
      });
    } catch (error) {
      console.error('Error creating DAO contract:', error);
      return null;
    }
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'getProposal',
    params: [BigInt(proposalId)],
    queryOptions: { enabled: proposalId > 0 && !!contract },
  });

  const result = data as any;

  return {
    proposal: result
      ? {
          id: Number(result[0]),
          proposalType: Number(result[1]),
          proposer: result[2],
          title: result[3],
          description: result[4],
          forVotes: Number(result[5]),
          againstVotes: Number(result[6]),
          abstainVotes: Number(result[7]),
          status: Number(result[8]),
          executed: result[9],
        }
      : null,
    isLoading,
  };
}

export function useVoteOnProposal() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DAO_GOVERNANCE) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DAO_GOVERNANCE,
      abi: DAOGovernanceABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const vote = async (proposalId: number, support: 0 | 1 | 2, expertiseDomain: string = '') => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    if (!contract) {
      throw new Error('DAO Governance contract not configured');
    }
    
    try {
      setLoading(true);
      
      const tx = prepareContractCall({
        contract,
        method: 'castVote',
        params: [BigInt(proposalId), support, expertiseDomain],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Voto emitido exitosamente! Ver transacción: ${formatTxHash(txHash)}`,
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
      console.error('Error voting:', error);
      toast.error(error?.message || 'Error casting vote');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { vote, isPending: loading || isSending };
}

export function useExecuteProposal() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DAO_GOVERNANCE) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DAO_GOVERNANCE,
      abi: DAOGovernanceABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const execute = async (proposalId: number) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    if (!contract) {
      throw new Error('DAO Governance contract not configured');
    }
    
    try {
      setLoading(true);
      
      const tx = prepareContractCall({
        contract,
        method: 'executeProposal',
        params: [BigInt(proposalId)],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Propuesta ejecutada exitosamente! Ver transacción: ${formatTxHash(txHash)}`,
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
      console.error('Error executing proposal:', error);
      toast.error(error?.message || 'Error executing proposal');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { execute, isPending: loading || isSending };
}

export function useUserProposals() {
  const account = useActiveAccount();
  
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DAO_GOVERNANCE) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DAO_GOVERNANCE,
      abi: DAOGovernanceABI as any,
    });
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'getUserProposals',
    params: account?.address ? [account.address] : undefined,
    queryOptions: { enabled: !!account && !!contract },
  });

  return {
    proposalIds: (data as any) || [],
    isLoading,
  };
}

export function useExpertise(userAddress: string, domain: string) {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DAO_GOVERNANCE) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DAO_GOVERNANCE,
      abi: DAOGovernanceABI as any,
    });
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'getExpertise',
    params: [userAddress as `0x${string}`, domain],
    queryOptions: { enabled: !!userAddress && !!domain && !!contract },
  });

  const result = data as any;

  return {
    expertise: result
      ? {
          domain: result[0],
          score: Number(result[1]),
          verified: result[2],
          verifiedAt: Number(result[3]),
          attestations: result[4] || [],
        }
      : null,
    isLoading,
  };
}
