'use client';

import { useState, useMemo } from 'react';
import { useSendTransaction, useActiveAccount } from 'thirdweb/react';
import { defineChain } from 'thirdweb/chains';
import { getContract, prepareContractCall } from 'thirdweb';
import { waitForReceipt } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import InsurancePoolABI from '@/lib/contracts/abi/InsurancePool.json';
import BinaryMarketABI from '@/lib/contracts/abi/BinaryMarket.json';
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

export function useInsurance() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  
  const contract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.INSURANCE_POOL,
      abi: InsurancePoolABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const deposit = async (amount: bigint, receiver?: string) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    try {
      setLoading(true);
      
      // InsurancePool.deposit(address receiver) is payable - send BNB native
      const tx = prepareContractCall({
        contract,
        method: 'deposit',
        params: [receiver || account.address],
        value: amount, // Send BNB native
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Deposit successful! View transaction: ${formatTxHash(txHash)}`,
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
      console.error('Error depositing:', error);
      toast.error(error?.message || 'Error depositing');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (amount: bigint, receiver?: string, owner?: string) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    try {
      setLoading(true);
      
      const tx = prepareContractCall({
        contract,
        method: 'withdraw',
        params: [amount, receiver || account.address, owner || account.address],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Withdrawal successful! View transaction: ${formatTxHash(txHash)}`,
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
      console.error('Error withdrawing:', error);
      toast.error(error?.message || 'Error withdrawing');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const claimYield = async () => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    try {
      setLoading(true);
      
      const tx = prepareContractCall({
        contract,
        method: 'claimYield',
        params: [],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Yield claimed successfully! View transaction: ${formatTxHash(txHash)}`,
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
      console.error('Error claiming yield:', error);
      toast.error(error?.message || 'Error claiming yield');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const claimInsurance = async (marketId: number) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    try {
      setLoading(true);
      
      // claimInsurance está en los contratos de mercado (BinaryMarket, ConditionalMarket, SubjectiveMarket)
      // Intentamos primero con BinaryMarket, que es el más común
      // El método claimInsurance requiere que el mercado esté en estado Disputed
      const marketContract = getContract({
        client,
        chain: opBNBTestnet,
        address: CONTRACT_ADDRESSES.BINARY_MARKET,
        abi: [
          {
            name: 'claimInsurance',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: '_marketId', type: 'uint256' }
            ],
            outputs: []
          }
        ] as any,
      });
      
      const tx = prepareContractCall({
        contract: marketContract,
        method: 'claimInsurance',
        params: [BigInt(marketId)],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Reclamo de seguro exitoso! Ver transacción: ${formatTxHash(txHash)}`,
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
      console.error('Error claiming insurance:', error);
      
      // Mejorar mensajes de error
      let errorMessage = error?.message || 'Error claiming insurance';
      
      if (errorMessage.includes('MarketNotActive') || errorMessage.includes('Not active')) {
        errorMessage = 'El mercado no está en estado Disputed. Solo puedes reclamar seguro cuando el oracle falla.';
      } else if (errorMessage.includes('AlreadyClaimed')) {
        errorMessage = 'Ya has reclamado el seguro para este mercado.';
      } else if (errorMessage.includes('InsufficientBalance')) {
        errorMessage = 'No tienes inversión en este mercado para reclamar.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    deposit,
    withdraw,
    claimYield,
    claimInsurance,
    loading: loading || isSending,
  };
}
