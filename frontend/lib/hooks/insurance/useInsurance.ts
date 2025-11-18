'use client';

import { useState, useMemo } from 'react';
import { useSendTransaction, useActiveAccount } from 'thirdweb/react';
import { defineChain } from 'thirdweb/chains';
import { getContract, prepareContractCall } from 'thirdweb';
import { waitForReceipt } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import InsurancePoolABI from '@/lib/contracts/abi/InsurancePool.json';
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
      
      const tx = prepareContractCall({
        contract,
        method: 'deposit',
        params: [amount, receiver || account.address],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Depósito exitoso! Ver transacción: ${formatTxHash(txHash)}`,
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
      console.error('Error depositing:', error);
      toast.error(error?.message || 'Error al depositar');
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
        `Retiro exitoso! Ver transacción: ${formatTxHash(txHash)}`,
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
      console.error('Error withdrawing:', error);
      toast.error(error?.message || 'Error al retirar');
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
        `Yield reclamado exitosamente! Ver transacción: ${formatTxHash(txHash)}`,
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
      console.error('Error claiming yield:', error);
      toast.error(error?.message || 'Error al reclamar yield');
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
      
      // Note: This might need to be called on PredictionMarket contract, not InsurancePool
      // Adjust based on your contract structure
      const predictionMarketContract = getContract({
        client,
        chain: opBNBTestnet,
        address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
        abi: [] as any, // Add proper ABI
      });
      
      const tx = prepareContractCall({
        contract: predictionMarketContract,
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
      toast.error(error?.message || 'Error al reclamar seguro');
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
