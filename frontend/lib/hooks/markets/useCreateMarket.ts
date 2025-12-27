'use client';

import { useState, useMemo } from 'react';
import { useSendTransaction, useActiveAccount } from 'thirdweb/react';
import { defineChain } from 'thirdweb/chains';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
import { waitForReceipt } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import { client } from '@/lib/config/thirdweb';
import { MARKET_STATUS } from '@/lib/config/constants';
import { toast } from 'sonner';
import { getTransactionUrl, formatTxHash } from '@/lib/utils/blockchain';
import PREDICTION_MARKET_CORE_ABI from '@/lib/contracts/abi/PredictionMarketCore.json';

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
  {
    name: 'placeBetCrossChain',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_marketId', type: 'uint256' },
      { name: '_isYes', type: 'bool' },
      { name: '_targetChainId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'voteOnDispute',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_marketId', type: 'uint256' },
      { name: '_vote', type: 'uint8' },
    ],
    outputs: [],
  },
  {
    name: 'markets',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'marketType', type: 'uint8' },
      { name: 'creator', type: 'address' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'resolutionTime', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'metadata', type: 'string' },
    ],
  },
  {
    name: 'getMarket',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'marketType', type: 'uint8' },
          { name: 'creator', type: 'address' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'resolutionTime', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'metadata', type: 'string' },
        ],
        internalType: 'struct PredictionMarketCore.MarketInfo',
        name: '',
        type: 'tuple',
      },
    ],
  },
  {
    name: 'paused',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'aiOracle',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'daoGovernance',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'marketCounter',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
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

      // Get the new market ID by reading the market counter
      const marketCounter = await readContract({
        contract,
        method: 'marketCounter',
        params: [],
      }) as bigint;
      const marketId = Number(marketCounter);

      const txUrl = getTransactionUrl(txHash);
      toast.success(`Binary market created! View transaction: ${formatTxHash(txHash)}`, {
        duration: 10000,
        action: {
          label: 'View on opBNBScan',
          onClick: () => window.open(txUrl, '_blank'),
        },
      });

      return { transactionHash: txHash, receipt: result, marketId };
    } catch (error: any) {
      console.error('Error creating binary market:', error);
      
      // Helper function to parse contract errors
      const parseContractError = (error: any): string => {
        if (!error) return 'Unknown error creating binary market';
        
        const errorString = error.toString?.() || error.message || String(error);
        
        // Common contract errors
        if (errorString.includes('Invalid time') || errorString.includes('invalid time')) {
          return 'Resolution time must be at least 1 hour in the future from the current blockchain time. Please select a time that is at least 1 hour 5 minutes from now to account for block time differences.';
        }
        if (errorString.includes('Only core') || errorString.includes('onlyCore')) {
          return 'Configuration error: The BinaryMarket contract does not have the coreContract correctly configured. The contract needs to be redeployed with the correct Core Contract address.';
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
        
        return 'Unknown error creating binary market';
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
      
      // Helper function to parse contract errors
      const parseContractError = (error: any): string => {
        if (!error) return 'Unknown error creating conditional market';
        
        const errorString = error.toString?.() || error.message || String(error);
        
        // Common contract errors
        if (errorString.includes('Invalid parent') || errorString.includes('invalid parent')) {
          return `Parent market (ID: ${parentMarketId}) does not exist. Please verify that the parent market ID is valid and that the market exists in the system.`;
        }
        if (errorString.includes('Invalid time') || errorString.includes('invalid time')) {
          return 'Resolution time must be after the parent market\'s resolution time.';
        }
        if (errorString.includes('Only core') || errorString.includes('onlyCore')) {
          return 'Configuration error: The ConditionalMarket contract does not have the coreContract correctly configured. The contract needs to be redeployed with the correct Core Contract address.';
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
        
        return 'Unknown error creating conditional market';
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
      
      // Helper function to parse contract errors
      const parseContractError = (error: any): string => {
        if (!error) return 'Unknown error creating subjective market';
        
        const errorString = error.toString?.() || error.message || String(error);
        
        // Common contract errors
        if (errorString.includes('Invalid time') || errorString.includes('invalid time')) {
          return 'Resolution time must be at least 1 hour in the future from the current blockchain time. Please select a time that is at least 1 hour 5 minutes from now to account for block time differences.';
        }
        if (errorString.includes('Only core') || errorString.includes('onlyCore')) {
          return 'Configuration error: The SubjectiveMarket contract does not have the coreContract correctly configured. The contract needs to be redeployed with the correct Core Contract address.';
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
        
        return 'Unknown error creating subjective market';
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

    // Declarar marketInfo fuera del try para que esté disponible en el catch
    let marketInfo: any = null;
    let validationError: string | null = null;

    try {
      setLoading(true);

      // Validar estado del mercado antes de intentar iniciar resolución
      // Usamos getMarket que es más confiable que markets mapping
      
      try {
        marketInfo = await readContract({
          contract,
          method: 'getMarket',
          params: [BigInt(marketId)],
        }) as any;

        // Verificar que el mercado existe: debe tener marketType definido
        if (!marketInfo || marketInfo.marketType === undefined) {
          throw new Error(`Market #${marketId} does not exist`);
        }

        const status = Number(marketInfo.status);
        const resolutionTime = Number(marketInfo.resolutionTime);
        const currentTime = Math.floor(Date.now() / 1000);

        // Validar que el status esté en el rango esperado (0-4)
        if (isNaN(status) || status < 0 || status > 4) {
          console.error('Invalid market status:', status, 'Market info:', marketInfo);
          validationError = `Market #${marketId} has invalid status: ${status}. Cannot initiate resolution.`;
        } else {
          const statusNames = ['Active', 'Resolving', 'Resolved', 'Disputed', 'Cancelled'];
          
          // Validar estado del mercado
          if (status !== MARKET_STATUS.ACTIVE) {
            if (status === MARKET_STATUS.RESOLVED) {
              throw new Error(`Market #${marketId} is already resolved. Current status: ${statusNames[status]}`);
            }
            if (status === MARKET_STATUS.RESOLVING) {
              throw new Error(`Market #${marketId} resolution is already in progress. Current status: ${statusNames[status]}`);
            }
            if (status === MARKET_STATUS.CANCELLED) {
              throw new Error(`Market #${marketId} has been cancelled. Current status: ${statusNames[status]}`);
            }
            if (status === MARKET_STATUS.DISPUTED) {
              throw new Error(`Market #${marketId} is in dispute. Current status: ${statusNames[status]}`);
            }
            // Si llegamos aquí, el estado es inválido
            validationError = `Market #${marketId} is not in Active status. Current status: ${statusNames[status]} (${status})`;
          }

          // Validar tiempo de resolución
          if (status === MARKET_STATUS.ACTIVE && currentTime < resolutionTime) {
            const timeRemaining = resolutionTime - currentTime;
            const hours = Math.floor(timeRemaining / 3600);
            const minutes = Math.floor((timeRemaining % 3600) / 60);
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            
            let timeMessage = '';
            if (days > 0) {
              timeMessage = `${days}d ${remainingHours}h ${minutes}m`;
            } else if (hours > 0) {
              timeMessage = `${hours}h ${minutes}m`;
            } else {
              timeMessage = `${minutes}m`;
            }
            
            throw new Error(`Market #${marketId} resolution time has not passed yet. Remaining: ${timeMessage}`);
          }
        }
      } catch (preCheckError: any) {
        // Si el error es de validación específica, mostrarlo y no continuar
        if (preCheckError.message && 
            (preCheckError.message.includes('does not exist') ||
             preCheckError.message.includes('already resolved') ||
             preCheckError.message.includes('already in progress') ||
             preCheckError.message.includes('has been cancelled') ||
             preCheckError.message.includes('is in dispute') ||
             preCheckError.message.includes('is not in Active status') ||
             preCheckError.message.includes('has not passed yet'))) {
          throw preCheckError;
        }
        // Si es un error de lectura del contrato, registrar y continuar
        console.warn('Could not pre-validate market, proceeding with transaction:', preCheckError.message);
        validationError = `Warning: Could not validate market state. Error: ${preCheckError.message}`;
      }

      // Si hay un error de validación crítico, no continuar
      if (validationError && !validationError.includes('Warning')) {
        throw new Error(validationError);
      }

      // Validación crítica: Si no tenemos información del mercado, NO continuar
      if (!marketInfo || marketInfo.marketType === undefined) {
        const errorMsg = `Cannot initiate resolution: Market #${marketId} does not exist or could not be read from the contract.`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }

      // Logging detallado para diagnóstico
      const currentTime = Math.floor(Date.now() / 1000);
      const statusNames = ['Active', 'Resolving', 'Resolved', 'Disputed', 'Cancelled'];
      const status = Number(marketInfo.status);
      const resolutionTime = Number(marketInfo.resolutionTime);
      const timeRemaining = resolutionTime - currentTime;
      
      const canResolve = status === MARKET_STATUS.ACTIVE && currentTime >= resolutionTime;
      
      console.log('🔍 Market state before transaction:', {
        marketId,
        exists: true,
        marketType: marketInfo.marketType?.toString(),
        status: `${statusNames[status] || 'Unknown'} (${status})`,
        resolutionTime: new Date(resolutionTime * 1000).toISOString(),
        currentTime: new Date(currentTime * 1000).toISOString(),
        timeRemaining: timeRemaining > 0 ? `${Math.floor(timeRemaining / 3600)}h ${Math.floor((timeRemaining % 3600) / 60)}m` : 'Expired',
        canResolve,
        requirements: {
          isActive: status === MARKET_STATUS.ACTIVE,
          timePassed: currentTime >= resolutionTime,
          bothMet: canResolve,
        },
        creator: marketInfo.creator,
        contractAddress: CONTRACT_ADDRESSES.PREDICTION_MARKET,
        account: account.address,
      });
      
      // Mostrar mensaje informativo si no se puede resolver
      if (!canResolve) {
        if (status !== MARKET_STATUS.ACTIVE) {
          console.warn(`⚠️ Market #${marketId} is not in Active status. Current: ${statusNames[status]} (${status})`);
        }
        if (currentTime < resolutionTime) {
          console.warn(`⚠️ Market #${marketId} resolution time has not passed yet. Remaining: ${Math.floor(timeRemaining / 3600)}h ${Math.floor((timeRemaining % 3600) / 60)}m`);
        }
      }

      // Validación final antes de la transacción
      // IMPORTANTE: El contrato requiere que el mercado esté en estado "Active" para iniciar resolución
      // Un mercado puede estar "Active" pero haber expirado - el estado no cambia automáticamente
      if (status !== MARKET_STATUS.ACTIVE) {
        const statusName = statusNames[status] || 'Unknown';
        let errorMsg = `Market #${marketId} cannot be resolved because it is not in Active status.\n\n`;
        errorMsg += `Current status: ${statusName} (${status})\n`;
        errorMsg += `Resolution time: ${new Date(resolutionTime * 1000).toLocaleString()}\n`;
        errorMsg += `Current time: ${new Date(currentTime * 1000).toLocaleString()}\n\n`;
        
        // Explicar qué significa cada estado
        if (status === MARKET_STATUS.RESOLVING) {
          errorMsg += `This market is already being resolved. Please wait for the resolution to complete.`;
        } else if (status === MARKET_STATUS.RESOLVED) {
          errorMsg += `This market has already been resolved.`;
        } else if (status === MARKET_STATUS.DISPUTED) {
          errorMsg += `This market is in dispute. It cannot be resolved through normal resolution.`;
        } else if (status === MARKET_STATUS.CANCELLED) {
          errorMsg += `This market has been cancelled. It cannot be resolved.`;
        } else {
          errorMsg += `Only markets in Active status can be resolved.`;
        }
        
        throw new Error(errorMsg);
      }

      // Verificar que el tiempo de resolución haya pasado
      if (currentTime < resolutionTime) {
        const hours = Math.floor(timeRemaining / 3600);
        const minutes = Math.floor((timeRemaining % 3600) / 60);
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        
        let timeMsg = '';
        if (days > 0) {
          timeMsg = `${days}d ${remainingHours}h ${minutes}m`;
        } else if (hours > 0) {
          timeMsg = `${hours}h ${minutes}m`;
        } else {
          timeMsg = `${minutes}m`;
        }
        
        throw new Error(
          `Market #${marketId} resolution time has not passed yet.\n\n` +
          `Resolution time: ${new Date(resolutionTime * 1000).toLocaleString()}\n` +
          `Current time: ${new Date(currentTime * 1000).toLocaleString()}\n` +
          `Time remaining: ${timeMsg}\n\n` +
          `You can only initiate resolution after the resolution time has passed.`
        );
      }

      console.log('✅ All validations passed. Proceeding with transaction...');

      // Verificar que los contratos requeridos estén configurados
      // El contrato necesita aiOracle para mercados binary/conditional y daoGovernance para subjetivos
      try {
        const aiOracleAddress = await readContract({
          contract,
          method: 'aiOracle',
          params: [],
        }) as string;
        
        const daoGovernanceAddress = await readContract({
          contract,
          method: 'daoGovernance',
          params: [],
        }) as string;
        
        const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
        const marketType = Number(marketInfo.marketType);
        const MARKET_TYPES = { BINARY: 0, CONDITIONAL: 1, SUBJECTIVE: 2 };
        
        console.log('🔍 Checking required contracts:', {
          marketType: marketType === MARKET_TYPES.BINARY ? 'Binary' : 
                      marketType === MARKET_TYPES.CONDITIONAL ? 'Conditional' : 
                      marketType === MARKET_TYPES.SUBJECTIVE ? 'Subjective' : 'Unknown',
          aiOracleAddress,
          daoGovernanceAddress,
          aiOracleConfigured: aiOracleAddress && aiOracleAddress.toLowerCase() !== ZERO_ADDRESS.toLowerCase(),
          daoGovernanceConfigured: daoGovernanceAddress && daoGovernanceAddress.toLowerCase() !== ZERO_ADDRESS.toLowerCase(),
        });
        
        // Verificar según el tipo de mercado
        if (marketType === MARKET_TYPES.SUBJECTIVE) {
          if (!daoGovernanceAddress || daoGovernanceAddress.toLowerCase() === ZERO_ADDRESS.toLowerCase()) {
            throw new Error(`Cannot initiate resolution: DAO Governance contract is not configured. The contract address is zero.`);
          }
        } else {
          // Binary o Conditional necesitan AI Oracle
          if (!aiOracleAddress || aiOracleAddress.toLowerCase() === ZERO_ADDRESS.toLowerCase()) {
            throw new Error(`Cannot initiate resolution: AI Oracle contract is not configured. The contract address is zero.`);
          }
        }
      } catch (contractCheckError: any) {
        // Si el error es sobre contratos no configurados, lanzarlo
        if (contractCheckError.message?.includes('not configured') || 
            contractCheckError.message?.includes('zero')) {
          throw contractCheckError;
        }
        // Si es otro error (como que las funciones no existen), solo registrar y continuar
        console.warn('Could not verify contract configuration:', contractCheckError.message);
      }

      // Verificar si el contrato está pausado (si tiene función paused)
      try {
        const isPaused = await readContract({
          contract,
          method: 'paused',
          params: [],
        }) as boolean;
        
        if (isPaused) {
          throw new Error(`Contract is paused. Resolution cannot be initiated at this time.`);
        }
      } catch (pauseCheckError: any) {
        // Si la función paused no existe o hay error, continuar
        // (no todos los contratos tienen esta función)
        if (!pauseCheckError.message?.includes('paused')) {
          console.warn('Could not check pause status:', pauseCheckError.message);
        } else {
          throw pauseCheckError;
        }
      }

      // Preparar la transacción
      console.log('📝 Preparing transaction...', {
        contract: CONTRACT_ADDRESSES.PREDICTION_MARKET,
        method: 'initiateResolution',
        params: [marketId],
      });

      const tx = prepareContractCall({
        contract,
        method: 'initiateResolution',
        params: [BigInt(marketId)],
      });

      console.log('📤 Attempting to send transaction...');
      console.log('Transaction prepared:', {
        to: CONTRACT_ADDRESSES.PREDICTION_MARKET,
        method: 'initiateResolution',
        marketId,
      });
      
      // Intentar enviar la transacción
      // El error ocurre aquí durante la estimación de gas si el contrato rechaza la transacción
      let result;
      try {
        result = await sendTransaction(tx);
      } catch (txError: any) {
        // El error durante sendTransaction generalmente ocurre en estimate-gas
        // Esto significa que el contrato está rechazando la transacción
        console.error('❌ Transaction failed during gas estimation:', txError);
        
        // Analizar el error para determinar la causa específica
        const errorMsg = String(txError?.message || '').toLowerCase();
        let specificReason = '';
        
        // El error "missing revert data" generalmente indica que Chainlink Functions está fallando
        if (errorMsg.includes('missing revert data') || errorMsg.includes('revert data')) {
          specificReason = `Chainlink Functions may not be properly configured or available on opBNB Testnet. ` +
                         `The AI Oracle contract is trying to use Chainlink Functions but it's failing. ` +
                         `This is a known limitation - Chainlink Functions is not available on opBNB Testnet. ` +
                         `The market resolution needs to be done manually using fulfillResolutionManual by the AI Oracle owner.`;
        } else if (errorMsg.includes('execution reverted')) {
          specificReason = `The contract rejected the transaction. ` +
                         `This usually means: the market is not in Active status, ` +
                         `the resolution time has not passed, the AI Oracle contract has an issue, ` +
                         `or Chainlink Functions is not properly configured.`;
        } else {
          specificReason = `Unknown error during transaction execution.`;
        }
        
        // Re-lanzar el error para que sea manejado por el catch principal
        const enhancedError = new Error(
          `Failed to initiate resolution for market #${marketId}.\n\n` +
          `${specificReason}\n\n` +
          `Market state: ${marketInfo ? `Status: ${statusNames[Number(marketInfo.status)] || 'Unknown'}, ` : ''}` +
          `Resolution time passed: ${currentTime >= resolutionTime ? 'Yes' : 'No'}\n\n` +
          `Original error: ${txError?.message || 'Unknown error'}`
        );
        (enhancedError as any).originalError = txError;
        throw enhancedError;
      }
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });

      // Emitir evento personalizado para notificar a otros componentes
      window.dispatchEvent(new CustomEvent('marketResolutionInitiated', {
        detail: { marketId, transactionHash: txHash }
      }));

      const txUrl = getTransactionUrl(txHash);
      toast.success(`Resolution initiated! The AI Oracle will process it shortly.`, {
        duration: 10000,
        description: `Transaction: ${formatTxHash(txHash)}`,
        action: {
          label: 'View on opBNBScan',
          onClick: () => window.open(txUrl, '_blank'),
        },
      });

      return { transactionHash: txHash, receipt: result };
    } catch (error: any) {
      console.error('❌ Error initiating resolution:', error);
      
      // Función helper para serializar objetos con referencias circulares
      const safeStringify = (obj: any, space = 2) => {
        const seen = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]';
            }
            seen.add(value);
          }
          if (value instanceof Error) {
            return {
              name: value.name,
              message: value.message,
              stack: value.stack,
            };
          }
          return value;
        }, space);
      };
      
      // Log completo del error
      console.error('Error details (full):', safeStringify(error));
      console.error('Error details (structured):', {
        message: error?.message,
        reason: error?.reason,
        shortMessage: error?.shortMessage,
        data: error?.data,
        code: error?.code,
        cause: error?.cause,
        stack: error?.stack,
        name: error?.name,
        contract: error?.contract,
        chainId: error?.chainId,
        // Intentar extraer más información
        args: error?.args,
        functionName: error?.functionName,
        errorName: error?.errorName,
      });
      
      // Intentar extraer el mensaje de revert del error
      let revertMessage = '';
      let originalError = error?.originalError || error;
      
      try {
        // Intentar múltiples formas de extraer el mensaje de revert
        if (originalError?.data) {
          if (typeof originalError.data === 'string') {
            revertMessage = originalError.data;
          } else if (originalError.data.message) {
            revertMessage = originalError.data.message;
          } else if (originalError.data.reason) {
            revertMessage = originalError.data.reason;
          }
        }
        if (originalError?.reason && !revertMessage) revertMessage = originalError.reason;
        if (originalError?.shortMessage && !revertMessage) revertMessage = originalError.shortMessage;
        if (originalError?.cause?.message && !revertMessage) revertMessage = originalError.cause.message;
        
        // Intentar extraer de la estructura de error de thirdweb
        if (error?.message && !revertMessage) {
          // Buscar patrones comunes en el mensaje
          const messageMatch = error.message.match(/revert[:\s]+(.+)/i);
          if (messageMatch) {
            revertMessage = messageMatch[1];
          }
        }
      } catch (e) {
        console.warn('Could not extract revert message:', e);
      }
      
      console.log('🔍 Extracted revert message:', revertMessage);
      console.log('🔍 Original error structure:', {
        hasOriginalError: !!error?.originalError,
        errorKeys: Object.keys(error || {}),
        originalErrorKeys: Object.keys(originalError || {}),
      });
      
      // Extraer información del mercado para mensajes más descriptivos
      let marketStatusInfo = '';
      if (marketInfo) {
        const status = Number(marketInfo.status);
        const statusNames = ['Active', 'Resolving', 'Resolved', 'Disputed', 'Cancelled'];
        const resolutionTime = Number(marketInfo.resolutionTime);
        const currentTime = Math.floor(Date.now() / 1000);
        
        marketStatusInfo = ` Market status: ${statusNames[status] || 'Unknown'} (${status}). `;
        if (status === MARKET_STATUS.ACTIVE) {
          if (currentTime < resolutionTime) {
            const timeRemaining = resolutionTime - currentTime;
            const hours = Math.floor(timeRemaining / 3600);
            const minutes = Math.floor((timeRemaining % 3600) / 60);
            marketStatusInfo += `Resolution time not reached. Remaining: ${hours}h ${minutes}m.`;
          } else {
            marketStatusInfo += `Resolution time has passed.`;
          }
        }
      }
      
      // Extraer información del error de manera más exhaustiva
      const errorString = String(error?.message || error?.reason || error?.shortMessage || revertMessage || error || '');
      const errorData = error?.data || error?.cause?.data || error?.cause;
      const errorCode = error?.code || error?.cause?.code;
      
      console.log('🔍 Error analysis:', {
        errorString,
        revertMessage,
        errorData,
        errorCode,
        hasData: !!errorData,
        dataType: typeof errorData,
      });
      
      // Mejorar mensajes de error con información específica
      let errorMessage = `Error initiating resolution for market #${marketId}.`;
      
      if (errorString) {
        const errorMsg = errorString.toLowerCase();
        
        if (errorMsg.includes('paused')) {
          errorMessage = `Contract is paused. Resolution cannot be initiated at this time.`;
        } else if (errorMsg.includes('not active') || errorMsg.includes('marketnotactive')) {
          errorMessage = `Market #${marketId} is not in Active status.${marketStatusInfo || ' It may already be resolving or resolved.'}`;
        } else if (errorMsg.includes('not ready') || errorMsg.includes('invalidtime')) {
          errorMessage = `Market #${marketId} resolution time has not passed yet.${marketStatusInfo || ''}`;
        } else if (errorMsg.includes('does not exist') || errorMsg.includes('market does not exist')) {
          errorMessage = `Market #${marketId} does not exist. Please verify the market ID.`;
        } else if (errorMsg.includes('execution reverted') || errorMsg.includes('revert') || errorMsg.includes('rejected the transaction') || errorMsg.includes('missing revert data')) {
          // Usar el revertMessage extraído anteriormente
          const revertReason = revertMessage || '';
          
          console.log('🔍 Processing revert reason:', revertReason);
          
          const revertLower = revertReason.toLowerCase();
          if (revertLower.includes('not active') || revertLower.includes('marketnotactive')) {
            errorMessage = `Market #${marketId} is not in Active status.${marketStatusInfo || ' It may already be resolving or resolved.'}`;
          } else if (revertLower.includes('not ready') || revertLower.includes('invalidtime')) {
            errorMessage = `Market #${marketId} resolution time has not passed yet.${marketStatusInfo || ''}`;
          } else if (errorMsg.includes('missing revert data')) {
            // Error específico de Chainlink Functions
            errorMessage = `Transaction failed: Chainlink Functions error detected.\n\n`;
            errorMessage += `Market #${marketId} meets all requirements (Active status, resolution time passed), `;
            errorMessage += `but the transaction is failing when calling the AI Oracle.\n\n`;
            errorMessage += `🔍 Root Cause:\n`;
            errorMessage += `Chainlink Functions is not available on opBNB Testnet (as of December 2025). `;
            errorMessage += `The AI Oracle contract is trying to use Chainlink Functions but it's failing.\n\n`;
            errorMessage += `💡 Solution:\n`;
            errorMessage += `Market resolution needs to be done manually by the AI Oracle owner `;
            errorMessage += `using the fulfillResolutionManual function. `;
            errorMessage += `This is a known limitation when Chainlink Functions is not available.\n\n`;
            errorMessage += `Market state: ${marketStatusInfo || 'Status verified, time passed'}`;
          } else if (revertReason && revertReason.length > 0) {
            errorMessage = `Transaction failed: ${revertReason}.${marketStatusInfo || ''}`;
          } else {
            // Si no hay mensaje de revert específico, proporcionar diagnóstico detallado
            // basado en la información del mercado que tenemos
            if (marketStatusInfo) {
              errorMessage = `Transaction failed for market #${marketId}.${marketStatusInfo}`;
              errorMessage += ` The contract rejected the transaction.\n\n`;
              errorMessage += `💡 Most likely cause: Chainlink Functions is not available on opBNB Testnet. `;
              errorMessage += `Market resolution must be done manually by the AI Oracle owner.`;
            } else {
              // Mensaje de error detallado cuando no hay revert reason específico
              errorMessage = `Transaction failed for market #${marketId}. `;
              errorMessage += `The contract rejected the transaction during gas estimation.\n\n`;
              errorMessage += `Possible reasons:\n`;
              errorMessage += `• Chainlink Functions is not available on opBNB Testnet (most likely)\n`;
              errorMessage += `• The AI Oracle contract has an internal error\n`;
              errorMessage += `• The DAO Governance contract has an internal error (for subjective markets)\n`;
              errorMessage += `• Chainlink Functions subscription is invalid or expired\n\n`;
              errorMessage += `💡 Note: If Chainlink Functions is not available, `;
              errorMessage += `the market resolution must be done manually by the AI Oracle owner.\n\n`;
              errorMessage += `Check the console logs above for detailed market state information.`;
            }
          }
        } else if (errorMsg.includes('already resolved')) {
          errorMessage = error.message;
        } else if (errorMsg.includes('already in progress')) {
          errorMessage = error.message;
        } else if (errorMsg.includes('has not passed yet')) {
          errorMessage = error.message;
        } else if (errorMsg.includes('user rejected') || errorMsg.includes('user denied')) {
          errorMessage = 'Transaction cancelled by user.';
        } else if (errorMsg.includes('insufficient funds') || errorMsg.includes('insufficient balance')) {
          errorMessage = 'Insufficient funds to pay gas fee. Please add more BNB to your wallet.';
        } else {
          // Incluir el mensaje original pero con contexto adicional
          errorMessage = `${errorString}${marketStatusInfo ? ` ${marketStatusInfo}` : ''}`;
        }
      } else {
        errorMessage += marketStatusInfo || ' Please check the market status and try again.';
      }
      
      toast.error(errorMessage, {
        duration: 10000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { initiateResolution, isPending: loading || isSending };
}

export function usePlaceBetCrossChain() {
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

  const placeBetCrossChain = async (
    marketId: number,
    isYes: boolean,
    amount: bigint,
    targetChainId: number
  ) => {
    if (!account) {
      throw new Error('No account connected');
    }

    try {
      setLoading(true);
      
      const tx = prepareContractCall({
        contract,
        method: 'placeBetCrossChain',
        params: [BigInt(marketId), isYes, BigInt(targetChainId)],
        value: amount,
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      toast.success(
        `Cross-chain bet placed! View transaction: ${formatTxHash(txHash)}`,
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
      console.error('Error placing cross-chain bet:', error);
      toast.error(error?.message || 'Error placing cross-chain bet');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { placeBetCrossChain, isPending: loading || isSending };
}

export function useVoteOnDispute() {
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

  const voteOnDispute = async (marketId: number, vote: 1 | 2 | 3) => {
    if (!account) {
      throw new Error('No account connected');
    }

    // Vote: 1 = Yes, 2 = No, 3 = Invalid
    if (vote < 1 || vote > 3) {
      throw new Error('Invalid vote. Must be 1 (Yes), 2 (No), or 3 (Invalid)');
    }

    try {
      setLoading(true);
      
      const tx = prepareContractCall({
        contract,
        method: 'voteOnDispute',
        params: [BigInt(marketId), BigInt(vote)],
      });

      const result = await sendTransaction(tx);
      const txHash = result.transactionHash;
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: txHash });
      
      const txUrl = getTransactionUrl(txHash);
      const voteLabels = { 1: 'Yes', 2: 'No', 3: 'Invalid' };
      toast.success(
        `Vote cast: ${voteLabels[vote]}! View transaction: ${formatTxHash(txHash)}`,
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
      console.error('Error voting on dispute:', error);
      toast.error(error?.message || 'Error voting on dispute');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { voteOnDispute, isPending: loading || isSending };
}

