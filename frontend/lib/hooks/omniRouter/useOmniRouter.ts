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

const OmniRouterABI = [
  {
    name: 'findBestPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_marketQuestion', type: 'string' },
      { name: '_isYes', type: 'bool' },
      { name: '_amount', type: 'uint256' },
    ],
    outputs: [
      { name: 'bestChainId', type: 'uint256' },
      { name: 'bestPrice', type: 'uint256' },
      { name: 'estimatedShares', type: 'uint256' },
      { name: 'gasCost', type: 'uint256' },
    ],
  },
  {
    name: 'getMarketPrices',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketQuestion', type: 'string' }],
    outputs: [
      { name: 'chainIds', type: 'uint256[]' },
      { name: 'yesPrices', type: 'uint256[]' },
      { name: 'noPrices', type: 'uint256[]' },
      { name: 'liquidities', type: 'uint256[]' },
    ],
  },
  {
    name: 'getSupportedChains',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'getPendingBet',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_betId', type: 'bytes32' }],
    outputs: [
      { name: 'user', type: 'address' },
      { name: 'sourceChainId', type: 'uint256' },
      { name: 'targetChainId', type: 'uint256' },
      { name: 'marketHash', type: 'bytes32' },
      { name: 'isYes', type: 'bool' },
      { name: 'amount', type: 'uint256' },
      { name: 'expectedPrice', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'status', type: 'uint8' },
    ],
  },
  {
    name: 'getUserPendingBets',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'bytes32[]' }],
  },
  {
    name: 'routeBet',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_marketId', type: 'uint256' },
      { name: '_user', type: 'address' },
      { name: '_isYes', type: 'bool' },
      { name: '_amount', type: 'uint256' },
      { name: '_targetChainId', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

export function useSupportedChains() {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.OMNI_ROUTER) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.OMNI_ROUTER,
      abi: OmniRouterABI as any,
    });
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'getSupportedChains',
    params: [],
    queryOptions: { enabled: !!contract },
  });

  return {
    chainIds: (data as any) || [],
    isLoading,
  };
}

export function usePendingBet(betId: string) {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.OMNI_ROUTER || !betId) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.OMNI_ROUTER,
      abi: OmniRouterABI as any,
    });
  }, [betId]);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'getPendingBet',
    params: [betId as `0x${string}`],
    queryOptions: { enabled: !!contract && !!betId && betId.startsWith('0x') },
  });

  const result = data as any;

  return {
    bet: result
      ? {
          user: result[0],
          sourceChainId: Number(result[1]),
          targetChainId: Number(result[2]),
          marketHash: result[3],
          isYes: result[4],
          amount: Number(result[5]) / 1e18,
          expectedPrice: Number(result[6]),
          timestamp: Number(result[7]),
          status: Number(result[8]),
        }
      : null,
    isLoading,
  };
}

export function useUserPendingBets() {
  const account = useActiveAccount();
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.OMNI_ROUTER) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.OMNI_ROUTER,
      abi: OmniRouterABI as any,
    });
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'getUserPendingBets',
    params: account?.address ? [account.address] : undefined,
    queryOptions: { enabled: !!account && !!contract },
  });

  return {
    betIds: (data as any) || [],
    isLoading,
  };
}

export function usePlaceCrossChainBet() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.OMNI_ROUTER) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.OMNI_ROUTER,
      abi: OmniRouterABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const placeCrossChainBet = async (
    marketId: number,
    isYes: boolean,
    amount: bigint,
    targetChainId: number
  ) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    if (!contract) {
      throw new Error('OmniRouter contract not configured');
    }

    try {
      setLoading(true);
      
      const tx = prepareContractCall({
        contract,
        method: 'routeBet',
        params: [BigInt(marketId), account.address, isYes, amount, BigInt(targetChainId)],
        value: amount,
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Cross-chain bet initiated! View transaction: ${formatTxHash(txHash)}`,
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
      console.error('Error placing cross-chain bet:', error);
      toast.error(error?.message || 'Error placing cross-chain bet');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { placeCrossChainBet, isPending: loading || isSending };
}

