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

  const stakedAmount = staker?.[0] ? Number(staker[0]) / 1e18 : 0;
  const reputationScore = staker?.[1] ? Number(staker[1]) : 0;
  const tier = staker?.[2] ? Number(staker[2]) : 0;
  const correctVotes = staker?.[3] ? Number(staker[3]) : 0;
  const totalVotes = staker?.[4] ? Number(staker[4]) : 0;
  const slashedAmount = staker?.[5] ? Number(staker[5]) / 1e18 : 0;
  
  // Calcular reputación basada en votos si hay votos, sino usar la del contrato
  let calculatedReputation = reputationScore;
  if (totalVotes > 0) {
    // Reputación basada en votos correctos
    calculatedReputation = (correctVotes * 100) / totalVotes;
  } else if (stakedAmount > 0 && reputationScore === 0) {
    // Reputación base basada en el stake (mínimo 50, máximo 70 para nuevos usuarios)
    // Esto incentiva a los usuarios a participar en disputes para mejorar su reputación
    const baseReputation = Math.min(50 + (stakedAmount * 2), 70);
    calculatedReputation = baseReputation;
  }

  return {
    stakedAmount,
    reputationScore: Math.round(calculatedReputation || reputationScore),
    tier,
    correctVotes,
    totalVotes,
    slashedAmount,
    isLoading,
  };
}

export function useStakeReputation() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  
  // Usar el contrato Core (PREDICTION_MARKET) en lugar de ReputationStaking directamente
  // porque stake() requiere "Only core" - debe llamarse a través de Core.stakeReputation()
  const contract = useMemo(() => {
    // Usar PREDICTION_MARKET que es el mismo que CORE_CONTRACT pero más confiable
    const coreAddress = CONTRACT_ADDRESSES.PREDICTION_MARKET || CONTRACT_ADDRESSES.CORE_CONTRACT;
    if (!coreAddress) {
      console.error('Core contract address not configured');
      return null;
    }
    
    // Importar ABI completo del Core contract
    try {
      const CoreABI = require('@/lib/contracts/abi/PredictionMarketCore.json');
      return getContract({
        client,
        chain: opBNBTestnet,
        address: coreAddress,
        abi: CoreABI as any,
      });
    } catch (error) {
      console.error('Error loading Core ABI:', error);
      // Fallback a ABI mínimo
      return getContract({
        client,
        chain: opBNBTestnet,
        address: coreAddress,
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
    }
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const stake = async (amount: bigint) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    if (!contract) {
      throw new Error('Core contract not configured');
    }
    
    // Validar que el amount sea al menos 0.1 BNB (minStake)
    const minStake = BigInt('100000000000000000'); // 0.1 BNB
    if (amount < minStake) {
      throw new Error('Amount is below the minimum required (0.1 BNB)');
    }
    
    try {
      setLoading(true);
      
      // Verificar que estamos usando la dirección correcta del Core
      const coreAddress = CONTRACT_ADDRESSES.PREDICTION_MARKET || CONTRACT_ADDRESSES.CORE_CONTRACT;
      console.log('📝 Staking through Core contract:', coreAddress);
      console.log('📝 Amount:', amount.toString(), 'BNB');
      
      // PredictionMarketCore.stakeReputation() es payable - envía BNB nativo
      // Esta función llama internamente a ReputationStaking.stake() con el msg.sender correcto
      const tx = prepareContractCall({
        contract,
        method: 'stakeReputation',
        params: [],
        value: amount, // Send BNB native
      });

      console.log('📤 Sending transaction...');
      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      
      console.log('⏳ Waiting for receipt...');
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      console.log('✅ Transaction confirmed');
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
      console.error('❌ Error staking:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        data: error?.data,
        contract: contract?.address,
      });
      
      // Improve error messages
      let errorMessage = error?.message || 'Error staking';
      
      if (errorMessage.includes('Only core') || errorMessage.includes('only core')) {
        errorMessage = 'Error: El contrato Core no está configurado correctamente en ReputationStaking. Por favor, verifica la configuración del contrato.';
      } else if (errorMessage.includes('Amount must be > 0') || errorMessage.includes('amount must be')) {
        errorMessage = 'El monto debe ser mayor que 0';
      } else if (errorMessage.includes('Below min stake') || errorMessage.includes('below min')) {
        errorMessage = 'El monto está por debajo del mínimo requerido (0.1 BNB)';
      } else if (errorMessage.includes('user rejected') || errorMessage.includes('User rejected')) {
        errorMessage = 'Transacción rechazada por el usuario';
      } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('Insufficient funds')) {
        errorMessage = 'Fondos insuficientes. Asegúrate de tener suficiente BNB en tu wallet.';
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
        `Unstake successful! View transaction: ${formatTxHash(txHash)}`,
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
      console.error('Error unstaking:', error);
      
      // Improve error messages
      let errorMessage = error?.message || 'Error unstaking';
      
      if (errorMessage.includes('Cooldown period') || errorMessage.includes('cooldown')) {
        errorMessage = 'You must wait 7 days from your last stake before you can unstake. This is a security period to protect the reputation system.';
      } else if (errorMessage.includes('Insufficient stake')) {
        errorMessage = 'You do not have enough stake to withdraw that amount';
      } else if (errorMessage.includes('Transfer failed')) {
        errorMessage = 'Error transferring funds. Please try again.';
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
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        // Intentar obtener leaderboard desde la API
        const response = await fetch('/api/reputation/leaderboard');
        if (response.ok) {
          const data = await response.json();
          if (data.leaderboard && Array.isArray(data.leaderboard)) {
            setLeaderboard(data.leaderboard);
          } else {
            setLeaderboard([]);
          }
        } else {
          // Si la API no está disponible, retornar array vacío
          setLeaderboard([]);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return {
    leaderboard,
    isLoading,
  };
}
