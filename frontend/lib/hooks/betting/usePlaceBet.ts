'use client';

import { useState, useMemo } from 'react';
import { useSendTransaction, useActiveAccount } from 'thirdweb/react';
import { defineChain } from 'thirdweb/chains';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
import { waitForReceipt } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import { client } from '@/lib/config/thirdweb';

// ABI parcial para placeBet - usando el mismo patrón que useCreateMarket
const PlaceBetABI = [
  {
    name: 'placeBet',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_marketId', type: 'uint256' },
      { name: '_isYes', type: 'bool' },
    ],
    outputs: [],
  },
  {
    name: 'markets',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
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
        name: '',
        type: 'tuple',
      },
    ],
  },
  {
    name: 'marketTypeContract',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'binaryMarket',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'conditionalMarket',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'subjectiveMarket',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;
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
  
  const coreContract = useMemo(() => {
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.CORE_CONTRACT,
      abi: PlaceBetABI as any,
    });
  }, []);

  const { mutateAsync: sendTransaction, isPending: isSending } = useSendTransaction();

  const placeBet = async (marketId: number, isYes: boolean, amount: string) => {
    if (!account) {
      throw new Error('No account connected');
    }
    
    let marketType: string | null = null;
    let marketContractAddress: string | null = null;
    
    try {
      setLoading(true);
      
      // OBTENER INFORMACIÓN DEL MERCADO - Esto es crítico y debe ejecutarse siempre
      const diagnosticContract = getContract({
        client,
        chain: opBNBTestnet,
        address: CONTRACT_ADDRESSES.CORE_CONTRACT,
        abi: PlaceBetABI as any,
      });
      
      try {
        const marketInfo = await readContract({
          contract: diagnosticContract,
          method: 'markets',
          params: [BigInt(marketId)],
        }) as any;
        
        if (marketInfo) {
          // MarketType enum: 0=Binary, 1=Conditional, 2=Subjective
          const typeMap = ['Binary', 'Conditional', 'Subjective'];
          const marketTypeNum = Number(marketInfo.marketType);
          marketType = typeMap[marketTypeNum] || 'Unknown';
          
          // Verificar el estado del mercado
          const statusMap = ['Active', 'Resolving', 'Resolved', 'Disputed', 'Cancelled'];
          const statusNum = Number(marketInfo.status);
          const marketStatus = statusMap[statusNum] || 'Unknown';
          
          // Si el mercado no está activo, lanzar error antes de intentar apostar
          if (statusNum !== 0) {
            throw new Error(`Market is not active. Current status: ${marketStatus}`);
          }
          
          // Obtener la dirección del contrato de mercado
          marketContractAddress = await readContract({
            contract: diagnosticContract,
            method: 'marketTypeContract',
            params: [BigInt(marketId)],
          }) as string;
          
          // Verificar el coreContract del contrato de mercado
          if (marketContractAddress) {
            try {
              // ABI mínimo para leer coreContract
              const marketContractABI = [{
                name: 'coreContract',
                type: 'function',
                stateMutability: 'view',
                inputs: [],
                outputs: [{ name: '', type: 'address' }],
              }] as const;
              
              const marketContract = getContract({
                client,
                chain: opBNBTestnet,
                address: marketContractAddress as `0x${string}`,
                abi: marketContractABI as any,
              });
              
              const marketCoreContract = await readContract({
                contract: marketContract,
                method: 'coreContract',
                params: [],
              }) as string;
              
              console.log('Market diagnosis:', {
                marketId,
                marketType,
                marketStatus,
                marketContractAddress,
                marketCoreContract,
                expectedCoreContract: CONTRACT_ADDRESSES.CORE_CONTRACT,
                coreContractMatches: marketCoreContract.toLowerCase() === CONTRACT_ADDRESSES.CORE_CONTRACT.toLowerCase(),
              });
              
              // Si el coreContract del mercado no coincide, lanzar error antes de intentar apostar
              if (marketCoreContract.toLowerCase() !== CONTRACT_ADDRESSES.CORE_CONTRACT.toLowerCase()) {
                const contractName = marketType === 'Binary' ? 'BinaryMarket' : 
                                   marketType === 'Conditional' ? 'ConditionalMarket' : 
                                   marketType === 'Subjective' ? 'SubjectiveMarket' : 
                                   'Market Contract';
                throw new Error(`Configuration error: The ${contractName} contract (${marketContractAddress}) has a different coreContract address (${marketCoreContract}) than the current PredictionMarketCore (${CONTRACT_ADDRESSES.CORE_CONTRACT}). This market was created with a different Core contract and cannot accept bets from the current Core.`);
              }
            } catch (e: any) {
              console.warn('Could not read coreContract from market contract:', e);
              // Continuar de todos modos, pero registrar la advertencia
            }
          }
        } else {
          throw new Error(`Market ${marketId} not found`);
        }
      } catch (diagError: any) {
        // Si el error es que el mercado no está activo o no existe, lanzarlo directamente
        if (diagError?.message?.includes('Market is not active') || 
            diagError?.message?.includes('not found') ||
            diagError?.message?.includes('Configuration error')) {
          throw diagError;
        }
        console.warn('Could not fetch market info for diagnosis:', diagError);
        // Continuar de todos modos, pero esto es una advertencia
      }
      
      // Convertir amount a bigint (BNB tiene 18 decimales)
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 1e18));
      
      // Colocar apuesta con BNB nativo (payable) usando el Core Contract
      const betTx = prepareContractCall({
        contract: coreContract,
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
      
      // Intentar obtener más detalles del error
      let errorDetails: any = {
        marketId,
        marketType,
        marketContractAddress,
        isYes,
        amount,
        coreContract: CONTRACT_ADDRESSES.CORE_CONTRACT,
        binaryMarket: CONTRACT_ADDRESSES.BINARY_MARKET,
        conditionalMarket: CONTRACT_ADDRESSES.CONDITIONAL_MARKET,
        subjectiveMarket: CONTRACT_ADDRESSES.SUBJECTIVE_MARKET,
        errorMessage: error?.message,
        errorReason: error?.reason,
        errorData: error?.data,
      };
      
      // Si es un error de thirdweb, intentar obtener más información
      if (error?.data) {
        errorDetails.thirdwebData = error.data;
      }
      
      if (error?.cause) {
        errorDetails.cause = error.cause;
      }
      
      // More descriptive error message for "Only core"
      let errorMessage = error?.message || 'Error placing bet';
      
      // Verificar si el error es "execution reverted" sin más detalles
      if (error?.message?.includes('execution reverted') && !error?.reason) {
        // Verificar si el mercado existe en el nuevo Core
        try {
          const checkContract = getContract({
            client,
            chain: opBNBTestnet,
            address: CONTRACT_ADDRESSES.CORE_CONTRACT,
            abi: PlaceBetABI as any,
          });
          
          const marketExists = await readContract({
            contract: checkContract,
            method: 'markets',
            params: [BigInt(marketId)],
          });
          
          if (!marketExists || marketExists.id === BigInt(0)) {
            errorMessage = `Market ${marketId} does not exist in the new Core Contract. This market was created with the old Core Contract and cannot accept bets. Please use a market created with the new Core Contract (Market ID: 1 or create a new market).`;
          }
        } catch (checkError) {
          // Si no se puede verificar, asumir que el mercado no existe
          errorMessage = `Market ${marketId} may not exist in the new Core Contract. This market was likely created with the old Core Contract. Please use Market ID 1 or create a new market.`;
        }
        
        errorDetails.possibleCauses = [
          'Market does not exist in the new Core Contract (created with old Core)',
          'Market is not active',
          'Invalid amount (outside MIN_BET/MAX_BET limits)',
          'Core Contract is paused',
          'Market contract address mismatch',
        ];
      }
      
      console.error('Error details:', errorDetails);
      
      // Verificar si el mercado está cancelado o no activo
      if (errorMessage.includes('Market is not active') || errorMessage.includes('Not active') || errorMessage.includes('not active') || error?.reason?.includes('Not active')) {
        errorMessage = 'This market is not active. You can only place bets on active markets.';
      } else if (errorMessage.includes('Only core') || errorMessage.includes('onlyCore') || error?.reason?.includes('Only core')) {
        // Intentar obtener la dirección del contrato de mercado si no se obtuvo antes
        let finalMarketContractAddress = marketContractAddress;
        if (!finalMarketContractAddress) {
          try {
            const coreContract = getContract({
              client,
              chain: opBNBTestnet,
              address: CONTRACT_ADDRESSES.CORE_CONTRACT,
              abi: PlaceBetABI as any,
            });
            finalMarketContractAddress = await readContract({
              contract: coreContract,
              method: 'marketTypeContract',
              params: [BigInt(marketId)],
            }) as string;
          } catch (e) {
            // Si no se puede obtener, usar las direcciones conocidas según el tipo
            if (marketType === 'Binary') {
              finalMarketContractAddress = CONTRACT_ADDRESSES.BINARY_MARKET;
            } else if (marketType === 'Conditional') {
              finalMarketContractAddress = CONTRACT_ADDRESSES.CONDITIONAL_MARKET;
            } else if (marketType === 'Subjective') {
              finalMarketContractAddress = CONTRACT_ADDRESSES.SUBJECTIVE_MARKET;
            }
          }
        }
        
        const marketTypeName = marketType || 'Unknown';
        const contractName = marketType === 'Binary' ? 'BinaryMarket' : 
                           marketType === 'Conditional' ? 'ConditionalMarket' : 
                           marketType === 'Subjective' ? 'SubjectiveMarket' : 
                           'Market Contract';
        
        errorMessage = `Configuration error: The ${contractName} contract (${finalMarketContractAddress || 'unknown address'}) has a different coreContract address than the current PredictionMarketCore (${CONTRACT_ADDRESSES.CORE_CONTRACT}). This requires redeploying the market contracts with the correct core address. Run 'pnpm hardhat run scripts/verify-contract-linking.ts --network opBNBTestnet' to verify the configuration.`;
      } else if (errorMessage.includes('Invalid amount') || errorMessage.includes('invalid amount') || error?.reason?.includes('Invalid amount')) {
        errorMessage = 'Invalid bet amount. The amount must be between 0.001 BNB and 100 BNB.';
      } else if (errorMessage.includes('Market is not active') || errorMessage.includes('market is not active')) {
        errorMessage = 'This market is not active. You can only place bets on active markets.';
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
