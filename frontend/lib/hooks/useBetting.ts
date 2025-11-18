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

// ✅ Hook mejorado con Thirdweb v5 API y hash de transacción
export function useBetting() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  
  const contract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
      abi: PREDICTION_MARKET_ABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const placeBet = async (marketId: number, isYes: boolean, amount: bigint) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    try {
      setLoading(true);
      
      // ✅ Preparar transacción con Thirdweb
      const tx = prepareContractCall({
        contract,
        method: 'placeBet',
        params: [BigInt(marketId), isYes, amount],
      });

      // ✅ Enviar transacción con Thirdweb v5
      const result = await sendTransaction(tx);
      
      // ✅ Obtener hash de transacción
      const txHash = result.transactionHash;
      
      // ✅ Esperar confirmación
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      // ✅ Mostrar toast con enlace al scanner
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Apuesta colocada exitosamente! Ver transacción: ${formatTxHash(txHash)}`,
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
      console.error('Error placing bet:', error);
      toast.error(error?.message || 'Error al colocar apuesta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const claimWinnings = async (marketId: number) => {
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
      
      // ✅ Obtener hash de transacción
      const txHash = result.transactionHash;
      
      // ✅ Esperar confirmación
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      // ✅ Mostrar toast con enlace al scanner
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Ganancias reclamadas exitosamente! Ver transacción: ${formatTxHash(txHash)}`,
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
      toast.error(error?.message || 'Error al reclamar ganancias');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    placeBet,
    claimWinnings,
    loading: loading || isSending,
  };
}
