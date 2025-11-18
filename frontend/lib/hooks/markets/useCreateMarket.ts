'use client';

import { useState, useMemo } from 'react';
import { useSendTransaction, useActiveAccount } from 'thirdweb/react';
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

// ABI for PredictionMarketCore market creation functions
const PredictionMarketCoreABI = [
  {
    name: 'createBinaryMarket',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_question', type: 'string' },
      { name: '_description', type: 'string' },
      { name: '_resolutionTime', type: 'uint256' },
      { name: '_metadata', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'createConditionalMarket',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_parentMarketId', type: 'uint256' },
      { name: '_condition', type: 'string' },
      { name: '_question', type: 'string' },
      { name: '_resolutionTime', type: 'uint256' },
      { name: '_metadata', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'createSubjectiveMarket',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_question', type: 'string' },
      { name: '_description', type: 'string' },
      { name: '_resolutionTime', type: 'uint256' },
      { name: '_expertiseRequired', type: 'string' },
      { name: '_metadata', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'initiateResolution',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [],
  },
] as const;

export function useCreateBinaryMarket() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();

  const contract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
      abi: PredictionMarketCoreABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const createMarket = async (
    question: string,
    description: string,
    resolutionTime: number,
    metadata: string = ''
  ) => {
    if (!account) {
      throw new Error('No account connected');
    }

    try {
      setLoading(true);

      const tx = prepareContractCall({
        contract,
        method: 'createBinaryMarket',
        params: [question, description, BigInt(resolutionTime), metadata],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });

      const txUrl = getTransactionUrl(txHash);
      toast.success(`Binary market created! View transaction: ${formatTxHash(txHash)}`, {
        duration: 10000,
        action: {
          label: 'View on opBNBScan',
          onClick: () => window.open(txUrl, '_blank'),
        },
      });

      return { transactionHash: txHash, receipt: result };
    } catch (error: any) {
      console.error('Error creating binary market:', error);
      
      // Mensaje de error más descriptivo para "Only core"
      let errorMessage = error?.message || 'Error creating binary market';
      if (errorMessage.includes('Only core') || errorMessage.includes('onlyCore')) {
        errorMessage = 'Error de configuración: El contrato BinaryMarket no tiene configurado correctamente el coreContract. El contrato necesita ser redesplegado con la dirección correcta del Core Contract.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createMarket, isPending: loading || isSending };
}

export function useCreateConditionalMarket() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();

  const contract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
      abi: PredictionMarketCoreABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const createMarket = async (
    parentMarketId: number,
    condition: string,
    question: string,
    resolutionTime: number,
    metadata: string = ''
  ) => {
    if (!account) {
      throw new Error('No account connected');
    }

    try {
      setLoading(true);

      const tx = prepareContractCall({
        contract,
        method: 'createConditionalMarket',
        params: [
          BigInt(parentMarketId),
          condition,
          question,
          BigInt(resolutionTime),
          metadata,
        ],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });

      const txUrl = getTransactionUrl(txHash);
      toast.success(`Conditional market created! View transaction: ${formatTxHash(txHash)}`, {
        duration: 10000,
        action: {
          label: 'View on opBNBScan',
          onClick: () => window.open(txUrl, '_blank'),
        },
      });

      return { transactionHash: txHash, receipt: result };
    } catch (error: any) {
      console.error('Error creating conditional market:', error);
      
      // Función helper para parsear errores de contratos
      const parseContractError = (error: any): string => {
        if (!error) return 'Error desconocido al crear mercado condicional';
        
        const errorString = error.toString?.() || error.message || String(error);
        
        // Errores comunes del contrato
        if (errorString.includes('Invalid parent') || errorString.includes('invalid parent')) {
          return `El mercado padre (ID: ${parentMarketId}) no existe. Por favor, verifica que el ID del mercado padre sea válido y que el mercado exista en el sistema.`;
        }
        if (errorString.includes('Invalid time') || errorString.includes('invalid time')) {
          return 'El tiempo de resolución debe ser posterior al tiempo de resolución del mercado padre.';
        }
        if (errorString.includes('Only core') || errorString.includes('onlyCore')) {
          return 'Error de configuración: El contrato ConditionalMarket no tiene configurado correctamente el coreContract. El contrato necesita ser redesplegado con la dirección correcta del Core Contract.';
        }
        if (errorString.includes('user rejected') || errorString.includes('User rejected')) {
          return 'Transacción cancelada por el usuario.';
        }
        if (errorString.includes('insufficient funds') || errorString.includes('Insufficient funds')) {
          return 'Fondos insuficientes para pagar la tarifa de gas.';
        }
        
        // Intentar extraer el mensaje de error del objeto
        if (error.message) {
          return error.message;
        }
        
        // Si es un string, devolverlo directamente (limitado a 200 caracteres)
        if (typeof errorString === 'string') {
          return errorString.length > 200 ? errorString.substring(0, 200) + '...' : errorString;
        }
        
        return 'Error desconocido al crear mercado condicional';
      };
      
      const errorMessage = parseContractError(error);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createMarket, isPending: loading || isSending };
}

export function useCreateSubjectiveMarket() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();

  const contract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
      abi: PredictionMarketCoreABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const createMarket = async (
    question: string,
    description: string,
    resolutionTime: number,
    expertiseRequired: string,
    metadata: string = ''
  ) => {
    if (!account) {
      throw new Error('No account connected');
    }

    try {
      setLoading(true);

      const tx = prepareContractCall({
        contract,
        method: 'createSubjectiveMarket',
        params: [question, description, BigInt(resolutionTime), expertiseRequired, metadata],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });

      const txUrl = getTransactionUrl(txHash);
      toast.success(`Subjective market created! View transaction: ${formatTxHash(txHash)}`, {
        duration: 10000,
        action: {
          label: 'View on opBNBScan',
          onClick: () => window.open(txUrl, '_blank'),
        },
      });

      return { transactionHash: txHash, receipt: result };
    } catch (error: any) {
      console.error('Error creating subjective market:', error);
      
      // Mensaje de error más descriptivo para "Only core"
      let errorMessage = error?.message || 'Error creating subjective market';
      if (errorMessage.includes('Only core') || errorMessage.includes('onlyCore')) {
        errorMessage = 'Error de configuración: El contrato SubjectiveMarket no tiene configurado correctamente el coreContract. El contrato necesita ser redesplegado con la dirección correcta del Core Contract.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createMarket, isPending: loading || isSending };
}

export function useInitiateResolution() {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();

  const contract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
      abi: PredictionMarketCoreABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const initiateResolution = async (marketId: number) => {
    if (!account) {
      throw new Error('No account connected');
    }

    try {
      setLoading(true);

      const tx = prepareContractCall({
        contract,
        method: 'initiateResolution',
        params: [BigInt(marketId)],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });

      const txUrl = getTransactionUrl(txHash);
      toast.success(`Resolution initiated! View transaction: ${formatTxHash(txHash)}`, {
        duration: 10000,
        action: {
          label: 'View on opBNBScan',
          onClick: () => window.open(txUrl, '_blank'),
        },
      });

      return { transactionHash: txHash, receipt: result };
    } catch (error: any) {
      console.error('Error initiating resolution:', error);
      toast.error(error?.message || 'Error initiating resolution');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { initiateResolution, isPending: loading || isSending };
}

