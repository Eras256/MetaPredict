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
  // CONTRACT_ADDRESSES siempre tiene valores por defecto, así que siempre creamos un contrato válido
  const contract = useMemo(() => {
    const address = CONTRACT_ADDRESSES.OMNI_ROUTER || '0x0000000000000000000000000000000000000000';
    return getContract({
      client,
      chain: opBNBTestnet,
      address: address as `0x${string}`,
      abi: OmniRouterABI as any,
    });
  }, []);

  const hasValidContract = !!CONTRACT_ADDRESSES.OMNI_ROUTER;

  const { data, isLoading } = useReadContract({
    contract: contract,
    method: 'getSupportedChains',
    params: [],
    queryOptions: { enabled: hasValidContract },
  });

  const chainIds = (data as bigint[]) || [];
  const chainsWithDetails = chainIds.map((chainId) => ({
    chainId: Number(chainId),
    name: `Chain ${Number(chainId)}`,
  }));

  return {
    chains: chainIds.map(id => Number(id)),
    chainsWithDetails,
    isLoading,
  };
}

export function usePendingBet(betId: string) {
  // Siempre crear un contrato válido, pero usar enabled para controlar la query
  const contract = useMemo(() => {
    const address = CONTRACT_ADDRESSES.OMNI_ROUTER || '0x0000000000000000000000000000000000000000';
    return getContract({
      client,
      chain: opBNBTestnet,
      address: address as `0x${string}`,
      abi: OmniRouterABI as any,
    });
  }, []);

  const hasValidContract = !!CONTRACT_ADDRESSES.OMNI_ROUTER && !!betId && betId.startsWith('0x');

  const { data, isLoading } = useReadContract({
    contract: contract,
    method: 'getPendingBet',
    params: [betId as `0x${string}`],
    queryOptions: { enabled: hasValidContract },
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
  // Siempre crear un contrato válido, pero usar enabled para controlar la query
  const contract = useMemo(() => {
    const address = CONTRACT_ADDRESSES.OMNI_ROUTER || '0x0000000000000000000000000000000000000000';
    return getContract({
      client,
      chain: opBNBTestnet,
      address: address as `0x${string}`,
      abi: OmniRouterABI as any,
    });
  }, []);

  const hasValidContract = !!CONTRACT_ADDRESSES.OMNI_ROUTER && !!account;

  const { data, isLoading } = useReadContract({
    contract: contract,
    method: 'getUserPendingBets',
    params: account?.address ? [account.address] : undefined,
    queryOptions: { enabled: hasValidContract },
  });

  return {
    betIds: (data as any) || [],
    isLoading,
  };
}

export function usePriceComparison(marketQuestion: string, isYes: boolean, amount: string) {
  // Siempre crear un contrato válido, pero usar enabled para controlar la query
  const contract = useMemo(() => {
    const address = CONTRACT_ADDRESSES.OMNI_ROUTER || '0x0000000000000000000000000000000000000000';
    return getContract({
      client,
      chain: opBNBTestnet,
      address: address as `0x${string}`,
      abi: OmniRouterABI as any,
    });
  }, []);

  const amountBigInt = useMemo(() => {
    if (!amount || parseFloat(amount) <= 0) return BigInt(0);
    return BigInt(Math.floor(parseFloat(amount) * 1e18));
  }, [amount]);

  const hasValidContract = !!CONTRACT_ADDRESSES.OMNI_ROUTER && !!marketQuestion && parseFloat(amount) > 0;

  const { data, isLoading } = useReadContract({
    contract: contract,
    method: 'findBestPrice',
    params: [marketQuestion, isYes, amountBigInt],
    queryOptions: {
      enabled: hasValidContract,
    },
  });

  const result = data as any;

  return {
    bestChainId: result?.[0] ? Number(result[0]) : null,
    bestPrice: result?.[1] ? BigInt(result[1]) : null,
    estimatedShares: result?.[2] ? BigInt(result[2]) : null,
    gasCost: result?.[3] ? BigInt(result[3]) : null,
    isLoading,
  };
}

export function usePlaceCrossChainBet() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  
  // Siempre crear un contrato válido para usePlaceCrossChainBet
  // (aunque puede ser con dirección cero si no está configurado)
  const contract = useMemo(() => {
    const address = CONTRACT_ADDRESSES.OMNI_ROUTER || '0x0000000000000000000000000000000000000000';
    return getContract({
      client,
      chain: opBNBTestnet,
      address: address as `0x${string}`,
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
    
    if (!CONTRACT_ADDRESSES.OMNI_ROUTER) {
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

