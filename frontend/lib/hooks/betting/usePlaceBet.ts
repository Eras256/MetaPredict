'use client';

import { useState, useMemo } from 'react';
import { useSendTransaction, useActiveAccount } from 'thirdweb/react';
import { defineChain } from 'thirdweb/chains';
import { getContract, prepareContractCall } from 'thirdweb';
import { waitForReceipt } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import PREDICTION_MARKET_ABI from '@/lib/contracts/abi/PredictionMarket.json';
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

export function usePlaceBet() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  
  const predictionMarketContract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
      abi: PREDICTION_MARKET_ABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const placeBet = async (marketId: number, isYes: boolean, amount: string) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    try {
      setLoading(true);
      
      // Convertir amount a bigint (BNB tiene 18 decimales)
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 1e18));
      
      // Colocar apuesta con BNB nativo (payable)
      const betTx = prepareContractCall({
        contract: predictionMarketContract,
        method: 'placeBet',
        params: [BigInt(marketId), isYes],
        value: amountBigInt, // Enviar BNB nativo
      });

      const betResult = await sendTransaction(betTx);
      const betHash = betResult.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: betHash });
      
      const txUrl = getTransactionUrl(betHash);
      toast.success(
        `Apuesta colocada exitosamente! Ver transacción: ${formatTxHash(betHash)}`,
        {
          duration: 10000,
          action: {
            label: 'Ver en opBNBScan',
            onClick: () => window.open(txUrl, '_blank'),
          },
        }
      );
      
      return { transactionHash: betHash, receipt: betResult };
    } catch (error: any) {
      console.error('Error placing bet:', error);
      toast.error(error?.message || 'Error placing bet');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { placeBet, isPending: loading || isSending };
}

// Ya no se necesita approval para BNB nativo - función eliminada

// ABI simplificado para BinaryMarket.claimWinnings
const BinaryMarketABI = [
  {
    name: 'claimWinnings',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [],
  },
] as const;

export function useClaimWinnings(marketId: number, marketType: 'binary' | 'conditional' | 'subjective' = 'binary') {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  
  // Determinar qué contrato usar según el tipo de mercado
  const contractAddress = useMemo(() => {
    switch (marketType) {
      case 'binary':
        return CONTRACT_ADDRESSES.BINARY_MARKET;
      case 'conditional':
        return CONTRACT_ADDRESSES.CONDITIONAL_MARKET;
      case 'subjective':
        return CONTRACT_ADDRESSES.SUBJECTIVE_MARKET;
      default:
        return CONTRACT_ADDRESSES.BINARY_MARKET;
    }
  }, [marketType]);
  
  const contract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: contractAddress,
      abi: BinaryMarketABI as any,
    });
  }, [contractAddress]);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const claim = async () => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    try {
      setLoading(true);
      
      const tx = prepareContractCall({
        contract,
        method: 'claimWinnings',
        params: [BigInt(marketId)],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Ganancias reclamadas! Ver transacción: ${formatTxHash(txHash)}`,
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
      console.error('Error claiming winnings:', error);
      toast.error(error?.message || 'Error claiming winnings');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { claim, isPending: loading || isSending };
}
