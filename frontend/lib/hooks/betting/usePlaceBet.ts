'use client';

import { useState, useMemo } from 'react';
import { useSendTransaction, useActiveAccount, useReadContract } from 'thirdweb/react';
import { defineChain } from 'thirdweb/chains';
import { getContract, prepareContractCall } from 'thirdweb';
import { waitForReceipt } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import PREDICTION_MARKET_CORE_ABI from '@/lib/contracts/abi/PredictionMarketCore.json';
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
  
  // Usar el ABI completo del Core contract (PredictionMarketCore)
  // que incluye placeBet y todas las funciones necesarias
  const predictionMarketContract = useMemo(() => {
    const coreAddress = CONTRACT_ADDRESSES.PREDICTION_MARKET || CONTRACT_ADDRESSES.CORE_CONTRACT;
    if (!coreAddress) {
      console.error('Core contract address not configured');
      return null;
    }
    
    return getContract({
      client,
      chain: opBNBTestnet,
      address: coreAddress,
      abi: PREDICTION_MARKET_CORE_ABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const placeBet = async (marketId: number, isYes: boolean, amount: string) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    if (!predictionMarketContract) {
      throw new Error('Core contract not configured');
    }
    
    try {
      setLoading(true);
      
      // Validar monto mínimo (0.01 BNB)
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount. Please enter a valid amount greater than 0.');
      }
      
      const minBet = 0.01; // 0.01 BNB mínimo
      if (amountNum < minBet) {
        throw new Error(`Amount is below the minimum bet (${minBet} BNB)`);
      }
      
      // Convertir amount a bigint (BNB tiene 18 decimales)
      const amountBigInt = BigInt(Math.floor(amountNum * 1e18));
      
      console.log('📝 Placing bet:', {
        marketId,
        isYes,
        amount: amountNum,
        amountBigInt: amountBigInt.toString(),
        contractAddress: predictionMarketContract.address,
        userAddress: account.address,
      });
      
      // Colocar apuesta con BNB nativo (payable)
      // PredictionMarketCore.placeBet(uint256 _marketId, bool _isYes) payable
      const betTx = prepareContractCall({
        contract: predictionMarketContract,
        method: 'placeBet',
        params: [BigInt(marketId), isYes],
        value: amountBigInt, // Enviar BNB nativo
      });

      console.log('📤 Sending transaction...');
      const betResult = await sendTransaction(betTx);
      const betHash = betResult.transactionHash;
      console.log('⏳ Waiting for confirmation...');
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: betHash });
      console.log('✅ Transaction confirmed');
      
      // Sincronizar apuesta con Supabase
      try {
        const { supabaseSync } = await import('@/lib/services/supabaseSync');
        const user = await supabaseSync.getOrCreateUser(account.address);
        
        if (user) {
          // Obtener shares del contrato (simplificado - en producción obtener del evento)
          const shares = amountBigInt; // Por ahora usar amount como shares aproximado
          
          await supabaseSync.syncBet({
            marketId,
            userId: user.id,
            amount: amountNum,
            outcome: isYes,
            shares: Number(shares) / 1e18, // Convertir de wei
            transactionHash: betHash
          });
        }
      } catch (syncError) {
        console.warn('Failed to sync bet to Supabase (non-critical):', syncError);
      }
      
      // Emitir evento personalizado para actualizar la actividad del mercado
      window.dispatchEvent(new CustomEvent('betPlaced', {
        detail: {
          marketId,
          isYes,
          amount: amountBigInt.toString(),
          transactionHash: betHash,
        },
      }));
      
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
      // Extraer información del error de manera más robusta
      const errorInfo = {
        message: error?.message || error?.error?.message || String(error),
        code: error?.code || error?.error?.code,
        data: error?.data || error?.error?.data,
        reason: error?.reason || error?.error?.reason,
        shortMessage: error?.shortMessage || error?.error?.shortMessage,
        contract: predictionMarketContract?.address,
        errorString: error?.toString?.(),
      };
      
      // Log detallado solo en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error placing bet:', error);
        console.error('Error details:', errorInfo);
      }
      
      // More descriptive error message for "Only core"
      let errorMessage = errorInfo.message || errorInfo.shortMessage || 'Error placing bet';
      
      // Extraer información del error para diagnóstico
      const errorData = errorInfo.data;
      const errorContract = error?.contract || error?.error?.contract || errorInfo.contract;
      
      // Normalizar el mensaje de error para comparación
      const normalizedMessage = errorMessage.toLowerCase();
      
      if (normalizedMessage.includes('only core') || normalizedMessage.includes('onlycore')) {
        errorMessage = 'Configuration error: Contracts are not properly linked.\n\n';
        errorMessage += 'The "Only core" error indicates that one of the secondary contracts (InsurancePool, BinaryMarket, ConditionalMarket, SubjectiveMarket) does not have the Core contract properly configured.\n\n';
        errorMessage += 'SOLUTION:\n';
        errorMessage += '1. Run the configuration script:\n';
        errorMessage += '   cd smart-contracts\n';
        errorMessage += '   npx hardhat run scripts/fix-contract-config.ts --network opbnb-testnet\n\n';
        errorMessage += '2. If the error persists, verify that the Market Contracts (BinaryMarket, ConditionalMarket, SubjectiveMarket) were deployed with the correct Core address.\n';
        errorMessage += '   These contracts have coreContract as immutable and cannot be updated after deployment.';
        
        if (errorContract) {
          errorMessage += `\n\nFailed contract: ${errorContract}`;
        }
      } else if (errorMessage.includes('Not active') || errorMessage.includes('not active')) {
        errorMessage = 'Market is not active. You can only bet on active markets.';
      } else if (errorMessage.includes('Invalid amount') || errorMessage.includes('invalid amount')) {
        errorMessage = 'Invalid amount. The amount must be between the minimum (0.001 BNB) and maximum (100 BNB) allowed.';
      } else if (errorMessage.includes('Market expired') || errorMessage.includes('expired')) {
        errorMessage = 'Market has expired. You cannot bet on expired markets.';
      } else if (normalizedMessage.includes('user rejected') || normalizedMessage.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (normalizedMessage.includes('insufficient funds') || normalizedMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds. Make sure you have enough BNB in your wallet for the bet and gas.';
      } else if (normalizedMessage.includes('execution reverted') || normalizedMessage.includes('revert')) {
        // Intentar extraer el mensaje de revert si está disponible
        const revertReason = errorData || errorInfo.reason;
        if (revertReason) {
          errorMessage = `Error en la transacción: ${revertReason}`;
        } else {
          errorMessage = 'Transaction was reverted. Verify that the market is active and you have sufficient funds.';
        }
      }
      
      // Mostrar el error al usuario
      toast.error(errorMessage, {
        duration: 10000,
      });
      
      // Re-lanzar el error para que el componente pueda manejarlo si es necesario
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
  
  // Obtener el contrato del Core para obtener la dirección del contrato del mercado específico
  const coreContract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
      abi: PREDICTION_MARKET_CORE_ABI as any,
    });
  }, []);
  
  // Obtener la dirección del contrato del mercado específico
  const { data: marketContractAddress } = useReadContract({
    contract: coreContract,
    method: 'getMarketContract',
    params: [BigInt(marketId)],
  });
  
  const contract = useMemo(() => {
    if (!marketContractAddress || marketContractAddress === '0x0000000000000000000000000000000000000000') {
      return null;
    }
    return getContract({
      client,
      chain: opBNBTestnet,
      address: marketContractAddress as `0x${string}`,
      abi: BinaryMarketABI as any,
    });
  }, [marketContractAddress]);

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
      
      if (!contract) {
        const errorMsg = 'Market contract not found. Please try refreshing the page.';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('[ClaimWinnings] Starting claim:', {
        marketId,
        marketType,
        contractAddress: marketContractAddress,
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
      
      // Emitir evento personalizado para actualizar la actividad del mercado
      window.dispatchEvent(new CustomEvent('winningsClaimed', {
        detail: {
          marketId,
          transactionHash: txHash,
        },
      }));
      
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
      // Mejor manejo de errores con información más detallada
      const errorInfo: any = {
        marketId,
        marketType,
        contractAddress: marketContractAddress,
      };
      
      try {
        // Intentar extraer información del error de forma segura
        if (error) {
          errorInfo.errorType = error?.constructor?.name || typeof error;
          errorInfo.errorString = String(error);
          
          if (error?.message) errorInfo.message = String(error.message);
          if (error?.code) errorInfo.code = String(error.code);
          if (error?.data) errorInfo.data = String(error.data);
          if (error?.reason) errorInfo.reason = String(error.reason);
          if (error?.shortMessage) errorInfo.shortMessage = String(error.shortMessage);
          if (error?.cause) errorInfo.cause = String(error.cause);
          
          // Para errores de thirdweb
          if (error?.toString) {
            try {
              errorInfo.errorToString = error.toString();
            } catch (e) {
              // Ignorar si toString falla
            }
          }
        }
      } catch (e) {
        // Si hay un error al extraer información, solo guardar el string básico
        errorInfo.fallbackError = String(error || 'Unknown error');
      }
      
      console.error('[ClaimWinnings] Complete error:', errorInfo);
      
      const errorMessage = parseContractError(error);
      toast.error(errorMessage || 'Failed to claim winnings. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { claim, isPending: loading || isSending };
}
