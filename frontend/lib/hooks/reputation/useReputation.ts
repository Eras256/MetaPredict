'use client';

import { useState, useEffect, useMemo } from 'react';
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

// ABI for ReputationStaking contract
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
      { name: 'lastUpdateTime', type: 'uint256' },
      { name: 'hasNFT', type: 'bool' },
    ],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'tierRequirements',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
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
  {
    name: 'getVote',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_user', type: 'address' },
      { name: '_marketId', type: 'uint256' },
    ],
    outputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'vote', type: 'uint8' },
      { name: 'stakeWeight', type: 'uint256' },
      { name: 'rewarded', type: 'bool' },
      { name: 'slashed', type: 'bool' },
    ],
  },
  {
    name: 'getUserVotes',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'getVoteWeights',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [
      { name: 'yes', type: 'uint256' },
      { name: 'no', type: 'uint256' },
      { name: 'invalid', type: 'uint256' },
    ],
  },
  {
    name: 'totalStaked',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalSlashed',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'minStake',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'slashingPenalty',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
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
    queryOptions: { 
      enabled: !!account && !!contract,
      // Note: Auto-refresh is now controlled by AutoRefreshBanner component in pages
      // This ensures refresh only happens at the specified intervals (e.g., 40s for reputation)
    },
  });

  const staker = stakerData as any;

  // Read all values directly from contract
  // Struct order: stakedAmount, reputationScore, tier, correctVotes, totalVotes, slashedAmount, lastUpdateTime, hasNFT
  const stakedAmount = staker?.[0] ? Number(staker[0]) / 1e18 : 0;
  const reputationScore = staker?.[1] ? Number(staker[1]) : 0;
  const tier = staker?.[2] ? Number(staker[2]) : 0;
  const correctVotes = staker?.[3] ? Number(staker[3]) : 0;
  const totalVotes = staker?.[4] ? Number(staker[4]) : 0;
  const slashedAmount = staker?.[5] ? Number(staker[5]) / 1e18 : 0;
  const hasNFT = staker?.[7] ? Boolean(staker[7]) : false;

  // Get NFT balance and token IDs
  const { data: nftBalance } = useReadContract({
    contract: contract!,
    method: 'balanceOf',
    params: account?.address ? [account.address] : undefined,
    queryOptions: {
      enabled: !!account && !!contract,
      refetchInterval: 30000,
    },
  });

  const nftCount = nftBalance ? Number(nftBalance) : 0;

  return {
    stakedAmount,
    reputationScore: Math.round(reputationScore),
    tier,
    correctVotes,
    totalVotes,
    slashedAmount,
    hasNFT,
    nftCount,
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
      throw new Error('ReputationStaking contract not configured');
    }

    // Validar que el amount sea al menos 0.1 BNB (minStake)
    const minStake = BigInt('100000000000000000'); // 0.1 BNB
    if (amount < minStake) {
      throw new Error('Amount must be at least 0.1 BNB');
    }

    try {
      setLoading(true);
      
      const tx = prepareContractCall({
        contract,
        method: 'stake',
        params: [account.address, amount],
        value: amount,
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Successfully staked! View transaction: ${formatTxHash(txHash)}`,
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
      console.error('Error staking reputation:', error);
      
      let errorMessage = error?.message || 'Error staking reputation';
      
      if (errorMessage.includes('Below min stake')) {
        errorMessage = 'Amount must be at least 0.1 BNB';
      } else if (errorMessage.includes('user rejected') || errorMessage.includes('user denied')) {
        errorMessage = 'Transaction cancelled by user.';
      } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
        errorMessage = 'Insufficient funds to pay gas fee. Please add more BNB to your wallet.';
      }
      
      toast.error(errorMessage);
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
      throw new Error('ReputationStaking contract not configured');
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
        `Successfully unstaked! View transaction: ${formatTxHash(txHash)}`,
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
      console.error('Error unstaking reputation:', error);
      
      let errorMessage = error?.message || 'Error unstaking reputation';
      
      if (errorMessage.includes('Insufficient stake')) {
        errorMessage = 'You do not have enough staked to unstake this amount';
      } else if (errorMessage.includes('Cooldown period')) {
        errorMessage = 'You must wait 7 days after your last stake/unstake before unstaking again';
      } else if (errorMessage.includes('user rejected') || errorMessage.includes('user denied')) {
        errorMessage = 'Transaction cancelled by user.';
      } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
        errorMessage = 'Insufficient funds to pay gas fee. Please add more BNB to your wallet.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { unstake, loading: loading || isSending };
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For now, return empty array as the contract doesn't have a direct getAllStakers function
    // This would need to be implemented by:
    // 1. Listening to Stake events and storing in DB
    // 2. Or implementing a view function in the contract
    // 3. Or using The Graph to index events
    setIsLoading(false);
    setLeaderboard([]);
  }, []);

  return {
    leaderboard,
    isLoading,
  };
}

export function useUserVotesHistory() {
  const account = useActiveAccount();
  const [votes, setVotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.REPUTATION_STAKING) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.REPUTATION_STAKING as `0x${string}`,
      abi: ReputationStakingABI as any,
    });
  }, []);

  useEffect(() => {
    if (!account || !contract) {
      setVotes([]);
      setIsLoading(false);
      return;
    }

    const fetchVotes = async () => {
      try {
        setIsLoading(true);
        const { readContract } = await import('thirdweb');
        
        // Get user's vote market IDs
        const marketIds = await readContract({
          contract,
          method: 'getUserVotes',
          params: [account.address],
        }) as bigint[];

        if (!marketIds || marketIds.length === 0) {
          setVotes([]);
          setIsLoading(false);
          return;
        }

        // Fetch vote details for each market
        const votePromises = marketIds.map(async (marketId: bigint) => {
          try {
            const voteData = await readContract({
              contract,
              method: 'getVote',
              params: [account.address, marketId],
            }) as any;

            return {
              marketId: Number(marketId),
              vote: Number(voteData[1]), // 1=Yes, 2=No, 3=Invalid
              stakeWeight: Number(voteData[2]) / 1e18,
              rewarded: voteData[3],
              slashed: voteData[4],
            };
          } catch (error) {
            console.error(`Error fetching vote for market ${marketId}:`, error);
            return null;
          }
        });

        const results = await Promise.all(votePromises);
        setVotes(results.filter((v): v is NonNullable<typeof v> => v !== null));
      } catch (error) {
        console.error('Error fetching user votes:', error);
        setVotes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVotes();
  }, [account, contract]);

  return { votes, isLoading };
}

export function useVoteWeights(marketId: number) {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.REPUTATION_STAKING) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.REPUTATION_STAKING as `0x${string}`,
      abi: ReputationStakingABI as any,
    });
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'getVoteWeights',
    params: [BigInt(marketId)],
    queryOptions: { enabled: marketId > 0 && !!contract },
  });

  const result = data as any;

  return {
    yesWeight: result?.[0] ? Number(result[0]) / 1e18 : 0,
    noWeight: result?.[1] ? Number(result[1]) / 1e18 : 0,
    invalidWeight: result?.[2] ? Number(result[2]) / 1e18 : 0,
    totalWeight: result
      ? (Number(result[0]) + Number(result[1]) + Number(result[2])) / 1e18
      : 0,
    isLoading,
  };
}

export function useReputationStats() {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.REPUTATION_STAKING) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.REPUTATION_STAKING as `0x${string}`,
      abi: ReputationStakingABI as any,
    });
  }, []);

  const { data: totalStaked } = useReadContract({
    contract: contract!,
    method: 'totalStaked',
    params: [],
    queryOptions: { enabled: !!contract },
  });

  const { data: totalSlashed } = useReadContract({
    contract: contract!,
    method: 'totalSlashed',
    params: [],
    queryOptions: { enabled: !!contract },
  });

  const { data: minStake } = useReadContract({
    contract: contract!,
    method: 'minStake',
    params: [],
    queryOptions: { enabled: !!contract },
  });

  const { data: slashingPenalty } = useReadContract({
    contract: contract!,
    method: 'slashingPenalty',
    params: [],
    queryOptions: { enabled: !!contract },
  });

  return {
    totalStaked: totalStaked ? Number(totalStaked) / 1e18 : 0,
    totalSlashed: totalSlashed ? Number(totalSlashed) / 1e18 : 0,
    minStake: minStake ? Number(minStake) / 1e18 : 0,
    slashingPenalty: slashingPenalty ? Number(slashingPenalty) / 100 : 0, // Convert from basis points to percentage
  };
}
