import { useState } from 'react';
import { useContract, useContractWrite } from 'thirdweb/react';
import { defineChain } from 'thirdweb/chains';
import { prepareContractCall } from 'thirdweb';
import { PREDICTION_MARKET_ADDRESS } from '@/lib/contracts/addresses';
import { PREDICTION_MARKET_ABI } from '@/lib/contracts/abi/PredictionMarket.json';
import { client } from '@/lib/config/thirdweb';
import { toast } from 'sonner';

// ✅ FIX #7: Configurar opBNB testnet
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

// ✅ FIX #7: Hook mejorado con Thirdweb useContract y gasless
export function useBetting() {
  const [loading, setLoading] = useState(false);
  
  const { contract } = useContract({
    client,
    chain: opBNBTestnet,
    address: PREDICTION_MARKET_ADDRESS,
    abi: PREDICTION_MARKET_ABI,
  });

  const { mutateAsync: placeBetWrite, isPending: isPlacing } = useContractWrite();
  
  const { mutateAsync: claimWinningsWrite, isPending: isClaiming } = useContractWrite();

  const placeBet = async (marketId: number, isYes: boolean, amount: bigint) => {
    try {
      setLoading(true);
      
      // ✅ FIX #7: Preparar transacción con Thirdweb
      const tx = prepareContractCall({
        contract,
        method: 'placeBet',
        params: [BigInt(marketId), isYes, amount],
      });

      // ✅ FIX #7: Enviar transacción (gasless si está configurado)
      const result = await placeBetWrite(tx);
      
      toast.success('Apuesta colocada exitosamente!');
      return result;
    } catch (error: any) {
      console.error('Error placing bet:', error);
      toast.error(error?.message || 'Error al colocar apuesta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const claimWinnings = async (marketId: number) => {
    try {
      setLoading(true);
      
      const tx = prepareContractCall({
        contract,
        method: 'claimWinnings',
        params: [BigInt(marketId)],
      });

      const result = await claimWinningsWrite(tx);
      
      toast.success('Ganancias reclamadas exitosamente!');
      return result;
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
    loading: loading || isPlacing || isClaiming,
  };
}
