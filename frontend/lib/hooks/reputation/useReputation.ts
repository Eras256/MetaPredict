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
    stakedAmount: staker?.[0] ? Number(staker[0]) / 1e18 : 0, // BNB tiene 18 decimales
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
  
  // Usar el contrato Core en lugar de ReputationStaking directamente
  // porque stake() requiere "Only core" - debe llamarse a través de Core.stakeReputation()
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.CORE_CONTRACT) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.CORE_CONTRACT as `0x${string}`,
      abi: [
        {
          name: 'stakeReputation',
          type: 'function',
          stateMutability: 'payable',
          inputs: [],
          outputs: [],
        },
      ] as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const stake = async (amount: bigint) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    if (!contract) {
      throw new Error('Core contract not configured');
    }
    
    try {
      setLoading(true);
      
      // PredictionMarketCore.stakeReputation() es payable - envía BNB nativo
      // Esta función llama internamente a ReputationStaking.stake() con el msg.sender correcto
      const tx = prepareContractCall({
        contract,
        method: 'stakeReputation',
        params: [],
        value: amount, // Send BNB native
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
      
      // Mejorar mensajes de error
      let errorMessage = error?.message || 'Error staking';
      
      if (errorMessage.includes('Only core')) {
        errorMessage = 'Error: El stake debe hacerse a través del contrato Core. Por favor, contacta al soporte.';
      } else if (errorMessage.includes('Amount must be > 0')) {
        errorMessage = 'El monto debe ser mayor a 0';
      } else if (errorMessage.includes('Below min stake')) {
        errorMessage = 'El monto es menor al mínimo requerido (0.1 BNB)';
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
      
      // Mejorar mensajes de error
      let errorMessage = error?.message || 'Error unstaking';
      
      if (errorMessage.includes('Cooldown period') || errorMessage.includes('cooldown')) {
        errorMessage = 'Debes esperar 7 días desde tu último stake antes de poder hacer unstake. Este es un período de seguridad para proteger el sistema de reputación.';
      } else if (errorMessage.includes('Insufficient stake')) {
        errorMessage = 'No tienes suficiente stake para retirar esa cantidad';
      } else if (errorMessage.includes('Transfer failed')) {
        errorMessage = 'Error al transferir los fondos. Por favor, intenta de nuevo.';
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
  // TODO: Implementar con subgraph o API
  return {
    leaderboard: [],
    isLoading: false,
  };
}
