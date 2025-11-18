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
        `Bet placed successfully! View transaction: ${formatTxHash(betHash)}`,
        {
          duration: 10000,
          action: {
            label: 'View on opBNBScan',
            onClick: () => window.open(txUrl, '_blank'),
          },
        }
      );
      
      return { transactionHash: betHash, receipt: betResult };
    } catch (error: any) {
      console.error('Error placing bet:', error);
      
      // More descriptive error message for "Only core"
      let errorMessage = error?.message || 'Error placing bet';
      if (errorMessage.includes('Only core') || errorMessage.includes('onlyCore')) {
        errorMessage = 'Configuration error: Contracts are not properly linked. Verify that the core contract is configured in the secondary contracts.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { placeBet, isPending: loading || isSending };
}

// Ya no se necesita approval para BNB nativo - función eliminada

// ABI simplificado para BinaryMarket.claimWinnings
// Formato compatible con thirdweb y estándar de Solidity
const BinaryMarketABI = [
  {
    name: 'claimWinnings',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: '_marketId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
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

  // Helper function to parse contract errors
  const parseContractError = (error: any): string => {
    if (!error) return 'Unknown error claiming winnings';
    
    const errorString = error.toString?.() || error.message || String(error);
    
    // Common errors from BinaryMarket contract
    if (errorString.includes('Not resolved') || errorString.includes('not resolved')) {
      return 'Market is not resolved. You must wait for the market to be resolved before claiming winnings.';
    }
    if (errorString.includes('Already claimed') || errorString.includes('already claimed')) {
      return 'You have already claimed winnings from this market.';
    }
    if (errorString.includes('No position') || errorString.includes('no position')) {
      return 'You do not have a position in this market.';
    }
    if (errorString.includes('No winnings') || errorString.includes('no winnings')) {
      return 'You have no winnings to claim in this market.';
    }
    if (errorString.includes('Transfer failed') || errorString.includes('transfer failed')) {
      return 'Error transferring winnings. Please try again.';
    }
    if (errorString.includes('user rejected') || errorString.includes('User rejected')) {
      return 'Transaction cancelled by user.';
    }
    if (errorString.includes('insufficient funds') || errorString.includes('Insufficient funds')) {
      return 'Insufficient funds to pay gas fee.';
    }
    
    // Try to extract error message from object
    if (error.message) {
      return error.message;
    }
    
    // If it's a string, return it directly (limited to 200 characters)
    if (typeof errorString === 'string') {
      return errorString.length > 200 ? errorString.substring(0, 200) + '...' : errorString;
    }
    
    return 'Unknown error claiming winnings';
  };

  const claim = async () => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    if (!marketId || marketId <= 0) {
      const errorMsg = 'Please enter a valid market ID';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    try {
      setLoading(true);
      
      console.log('[ClaimWinnings] Starting claim:', {
        marketId,
        marketType,
        contractAddress,
        userAddress: account.address,
      });
      
      const tx = prepareContractCall({
        contract,
        method: 'claimWinnings',
        params: [BigInt(marketId)],
      });

      console.log('[ClaimWinnings] Transaction prepared, sending...');
      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      console.log('[ClaimWinnings] Transaction sent:', txHash);
      
      console.log('[ClaimWinnings] Waiting for confirmation...');
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      console.log('[ClaimWinnings] Transaction confirmed');
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Winnings claimed successfully! View transaction: ${formatTxHash(txHash)}`,
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
      console.error('[ClaimWinnings] Complete error:', {
        error,
        message: error?.message,
        code: error?.code,
        data: error?.data,
        reason: error?.reason,
        marketId,
        marketType,
        contractAddress,
      });
      
      const errorMessage = parseContractError(error);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { claim, isPending: loading || isSending };
}
