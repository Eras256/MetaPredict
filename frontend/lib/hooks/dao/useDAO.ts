'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useActiveAccount } from 'thirdweb/react';
import { CONTRACTS } from '@/lib/config/constants';
import { toast } from 'sonner';

// ABI placeholder
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
  const { data, isLoading } = useReadContract({
    address: CONTRACTS.DAO_GOVERNANCE as `0x${string}`,
    abi: DAOGovernanceABI,
    functionName: 'getProposal',
    args: [BigInt(proposalId)],
    query: { enabled: proposalId > 0 },
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
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const vote = async (proposalId: number, support: 0 | 1 | 2, expertiseDomain: string = '') => {
    try {
      writeContract({
        address: CONTRACTS.DAO_GOVERNANCE as `0x${string}`,
        abi: DAOGovernanceABI,
        functionName: 'castVote',
        args: [BigInt(proposalId), support, expertiseDomain],
      });
      
      toast.success('Vote cast successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cast vote');
      throw error;
    }
  };

  return { vote, isPending: isPending || isConfirming, isSuccess };
}

export function useExecuteProposal() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const execute = async (proposalId: number) => {
    try {
      writeContract({
        address: CONTRACTS.DAO_GOVERNANCE as `0x${string}`,
        abi: DAOGovernanceABI,
        functionName: 'executeProposal',
        args: [BigInt(proposalId)],
      });
      
      toast.success('Proposal executed!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to execute proposal');
      throw error;
    }
  };

  return { execute, isPending: isPending || isConfirming, isSuccess };
}

export function useUserProposals() {
  const account = useActiveAccount();
  
  const { data, isLoading } = useReadContract({
    address: CONTRACTS.DAO_GOVERNANCE as `0x${string}`,
    abi: DAOGovernanceABI,
    functionName: 'getUserProposals',
    args: [account?.address as `0x${string}`],
    query: { enabled: !!account },
  });

  return {
    proposalIds: (data as any) || [],
    isLoading,
  };
}

export function useExpertise(userAddress: string, domain: string) {
  const { data, isLoading } = useReadContract({
    address: CONTRACTS.DAO_GOVERNANCE as `0x${string}`,
    abi: DAOGovernanceABI,
    functionName: 'getExpertise',
    args: [userAddress as `0x${string}`, domain],
    query: { enabled: !!userAddress && !!domain },
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

