'use client';

import { useMemo, useState } from 'react';
import { useReadContract, useSendTransaction, useActiveAccount } from 'thirdweb/react';
import { defineChain } from 'thirdweb/chains';
import { getContract, prepareContractCall } from 'thirdweb';
import { waitForReceipt } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/addresses';
import { client } from '@/lib/config/thirdweb';
import { toast } from 'sonner';

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

const ChainlinkDataStreamsABI = [
  {
    name: 'configureMarketStream',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_marketId', type: 'uint256' },
      { name: '_streamId', type: 'bytes32' },
      { name: '_targetPrice', type: 'int256' },
    ],
    outputs: [],
  },
  {
    name: 'getLastVerifiedPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [
      { name: 'price', type: 'int256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'isStale', type: 'bool' },
    ],
  },
  {
    name: 'checkPriceCondition',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [
      { name: 'conditionMet', type: 'bool' },
      { name: 'currentPrice', type: 'int256' },
      { name: 'targetPrice', type: 'int256' },
    ],
  },
  {
    name: 'validateMarketPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_marketId', type: 'uint256' },
      { name: '_predictedPrice', type: 'int256' },
    ],
    outputs: [
      { name: 'isValid', type: 'bool' },
      { name: 'actualPrice', type: 'int256' },
      { name: 'difference', type: 'int256' },
    ],
  },
  {
    name: 'marketStreamId',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'marketTargetPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_marketId', type: 'uint256' }],
    outputs: [{ name: '', type: 'int256' }],
  },
  {
    name: 'verifyPriceReport',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_marketId', type: 'uint256' },
      { name: '_report', type: 'bytes' },
    ],
    outputs: [
      { name: 'price', type: 'int256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'isValid', type: 'bool' },
    ],
  },
] as const;

export function useLastVerifiedPrice(marketId: number) {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION,
      abi: ChainlinkDataStreamsABI as any,
    });
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'getLastVerifiedPrice',
    params: [BigInt(marketId)],
    queryOptions: { enabled: marketId > 0 && !!contract },
  });

  const result = data as any;

  return {
    price: result?.[0] ? Number(result[0]) / 1e8 : null, // Chainlink prices are typically 8 decimals
    timestamp: result?.[1] ? Number(result[1]) : null,
    isStale: result?.[2] || false,
    isLoading,
  };
}

export function usePriceCondition(marketId: number) {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION,
      abi: ChainlinkDataStreamsABI as any,
    });
  }, []);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'checkPriceCondition',
    params: [BigInt(marketId)],
    queryOptions: { enabled: marketId > 0 && !!contract },
  });

  const result = data as any;

  return {
    conditionMet: result?.[0] || false,
    currentPrice: result?.[1] ? Number(result[1]) / 1e8 : null,
    targetPrice: result?.[2] ? Number(result[2]) / 1e8 : null,
    isLoading,
  };
}

export function useValidateMarketPrice(marketId: number, predictedPrice: number) {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION,
      abi: ChainlinkDataStreamsABI as any,
    });
  }, []);

  const predictedPriceBigInt = useMemo(() => {
    return BigInt(Math.floor(predictedPrice * 1e8));
  }, [predictedPrice]);

  const { data, isLoading } = useReadContract({
    contract: contract!,
    method: 'validateMarketPrice',
    params: [BigInt(marketId), predictedPriceBigInt],
    queryOptions: { enabled: marketId > 0 && predictedPrice > 0 && !!contract },
  });

  const result = data as any;

  return {
    isValid: result?.[0] || false,
    actualPrice: result?.[1] ? Number(result[1]) / 1e8 : null,
    difference: result?.[2] ? Number(result[2]) / 1e8 : null,
    isLoading,
  };
}

export function useMarketStreamConfig(marketId: number) {
  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION,
      abi: ChainlinkDataStreamsABI as any,
    });
  }, []);

  const { data: streamId } = useReadContract({
    contract: contract!,
    method: 'marketStreamId',
    params: [BigInt(marketId)],
    queryOptions: { enabled: marketId > 0 && !!contract },
  });

  const { data: targetPrice } = useReadContract({
    contract: contract!,
    method: 'marketTargetPrice',
    params: [BigInt(marketId)],
    queryOptions: { enabled: marketId > 0 && !!contract },
  });

  // Check if streamId is a valid non-zero value
  // A bytes32 with all zeros (0x00000000...00000000) is not a valid stream ID
  // thirdweb may return it as a hex string, so we need to check for the zero hash
  const streamIdStr = streamId ? (typeof streamId === 'string' ? streamId : String(streamId)) : null;
  const zeroHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const isValidStreamId = streamIdStr && streamIdStr !== zeroHash && streamIdStr !== '0x0';
  
  return {
    streamId: isValidStreamId ? streamIdStr : null,
    targetPrice: targetPrice ? Number(targetPrice) / 1e8 : null,
  };
}

/**
 * Hook to configure Chainlink Data Stream for a market
 */
export function useConfigureMarketStream() {
  const [isPending, setIsPending] = useState(false);
  const account = useActiveAccount();
  const { mutateAsync: sendTransaction } = useSendTransaction();

  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION,
      abi: ChainlinkDataStreamsABI as any,
    });
  }, []);

  const configureStream = async (
    marketId: number,
    streamId: string,
    targetPrice?: number
  ) => {
    if (!account) {
      throw new Error('No account connected');
    }
    if (!contract) {
      throw new Error('Data Streams Integration contract not configured');
    }

    // Verify we're using the correct contract address (the new one without onlyOwner)
    const contractAddress = CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION.toLowerCase();
    const expectedNewAddress = '0xa7128cd3a748ea85adde9c69b0d76758c0a477f3';
    const oldAddresses = [
      '0x1758d4da0bad4db90dfd56be259c19cabdcf03fd',
      '0xb452fe6efff3e83cc843c797e35fb965351f2e58'
    ];
    
    if (oldAddresses.includes(contractAddress)) {
      console.error('[ChainlinkDataStreams] ⚠️ Usando dirección antigua del contrato');
      console.error('[ChainlinkDataStreams] Dirección actual:', CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION);
      console.error('[ChainlinkDataStreams] Dirección esperada: 0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3');
      throw new Error(
        `El frontend está usando una dirección antigua del contrato que todavía tiene la restricción onlyOwner.\n\n` +
        `Dirección actual: ${CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION}\n` +
        `Dirección correcta: 0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3\n\n` +
        `Por favor:\n` +
        `1. Actualiza tu archivo .env.local con: NEXT_PUBLIC_DATA_STREAMS_INTEGRATION_ADDRESS=0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3\n` +
        `2. Detén completamente el servidor de desarrollo\n` +
        `3. Reinicia el servidor`
      );
    }

    try {
      setIsPending(true);

      // Convert streamId to bytes32 (if it's a hex string, use it directly, otherwise pad it)
      let streamIdBytes32: `0x${string}`;
      if (streamId.startsWith('0x')) {
        // Remove 0x, pad to 64 hex characters (32 bytes), then add 0x back
        const hexPart = streamId.slice(2);
        streamIdBytes32 = `0x${hexPart.padStart(64, '0')}` as `0x${string}`;
      } else {
        // If it's not a hex string, pad it
        streamIdBytes32 = `0x${streamId.padStart(64, '0')}` as `0x${string}`;
      }

      // Convert targetPrice to int256 (8 decimals like Chainlink prices)
      const targetPriceBigInt = targetPrice ? BigInt(Math.floor(targetPrice * 1e8)) : BigInt(0);

      const tx = prepareContractCall({
        contract,
        method: 'configureMarketStream',
        params: [BigInt(marketId), streamIdBytes32, targetPriceBigInt],
      });

      const result = await sendTransaction(tx);
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: result.transactionHash });

      toast.success(`Stream ID configured successfully for market #${marketId}`);
      return { transactionHash: result.transactionHash };
    } catch (error: any) {
      console.error('Error configuring market stream:', error);
      
      const errorString = error.toString?.() || error.message || String(error);
      const errorCode = error.code || error.data?.code || error.error?.code;
      
      // Check for user rejection
      if (errorString.includes('user rejected') || errorString.includes('User rejected')) {
        throw new Error('Transaction cancelled by user');
      }
      
      // Handle ABI error signature not found (this can happen with custom errors)
      if (errorString.includes('AbiErrorSignatureNotFound') || errorString.includes('not found on ABI')) {
        // Check if it's the OwnableUnauthorizedAccount error (0x118cdaa7)
        // This error means the contract still has onlyOwner restriction
        if (errorString.includes('0x118cdaa7')) {
          const currentAddress = CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION;
          const expectedAddress = '0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3';
          
          console.error('[ChainlinkDataStreams] Error 0x118cdaa7 detected');
          console.error('[ChainlinkDataStreams] Dirección actual:', currentAddress);
          console.error('[ChainlinkDataStreams] Dirección esperada:', expectedAddress);
          
          if (currentAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
            throw new Error(
              `El contrato en la dirección ${currentAddress} todavía tiene la restricción onlyOwner. ` +
              `Por favor, actualiza tu archivo .env.local con: NEXT_PUBLIC_DATA_STREAMS_INTEGRATION_ADDRESS=${expectedAddress} ` +
              `y reinicia completamente el servidor de desarrollo.`
            );
          } else {
            throw new Error(
              'El contrato desplegado todavía tiene la restricción onlyOwner. ' +
              'Por favor, verifica que el contrato fue desplegado correctamente con el código actualizado.'
            );
          }
        }
        // Generic ABI error
        throw new Error('Failed to configure Stream ID. Please check that the contract is deployed correctly.');
      }
      
      // Check for authorization errors (should not occur with new contract)
      if (
        errorString.includes('onlyOwner') || 
        errorString.includes('Unauthorized') ||
        errorString.includes('OwnableUnauthorizedAccount') ||
        errorString.includes('0x118cdaa7') || // OpenZeppelin OwnableUnauthorizedAccount error signature
        errorCode === 'UNAUTHORIZED' ||
        errorCode === 'ONLY_OWNER'
      ) {
        console.warn('[ChainlinkDataStreams] Authorization error detected - contract may have onlyOwner restriction');
        throw new Error('Authorization error. Please ensure you are using the latest deployed contract without onlyOwner restriction.');
      }
      
      throw new Error(`Failed to configure Stream ID: ${error.message || errorString}`);
    } finally {
      setIsPending(false);
    }
  };

  return { configureStream, isPending };
}

/**
 * Hook to verify a Chainlink Data Streams price report on-chain
 */
export function useVerifyPriceReport() {
  const [isPending, setIsPending] = useState(false);
  const account = useActiveAccount();
  const { mutateAsync: sendTransaction } = useSendTransaction();

  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION) return null;
    return getContract({
      client,
      chain: opBNBTestnet,
      address: CONTRACT_ADDRESSES.DATA_STREAMS_INTEGRATION,
      abi: ChainlinkDataStreamsABI as any,
    });
  }, []);

  const verifyPrice = async (marketId: number, reportHex: string) => {
    if (!account) {
      throw new Error('No account connected');
    }
    if (!contract) {
      throw new Error('Data Streams Integration contract not configured');
    }

    try {
      setIsPending(true);

      // Convert hex string to bytes
      // Remove 0x prefix if present
      const cleanReport = reportHex.startsWith('0x') ? reportHex.slice(2) : reportHex;
      // Convert hex string to bytes array
      const reportBytes = `0x${cleanReport}` as `0x${string}`;

      const tx = prepareContractCall({
        contract,
        method: 'verifyPriceReport',
        params: [BigInt(marketId), reportBytes],
      });

      const result = await sendTransaction(tx);
      await waitForReceipt({ client, chain: opBNBTestnet, transactionHash: result.transactionHash });

      toast.success(`Price verified successfully for market #${marketId}`);
      return { transactionHash: result.transactionHash };
    } catch (error: any) {
      console.error('Error verifying price report:', error);
      
      const errorString = error.toString?.() || error.message || String(error);
      
      // Check for user rejection
      if (errorString.includes('user rejected') || errorString.includes('User rejected')) {
        throw new Error('Transaction cancelled by user');
      }
      
      // Handle specific errors
      if (errorString.includes('InvalidPriceId')) {
        throw new Error('Stream ID not configured for this market. Please configure it first.');
      }
      
      if (errorString.includes('InvalidPriceReport')) {
        throw new Error('Invalid price report. Please check the report format.');
      }
      
      if (errorString.includes('PythPriceStale') || errorString.includes('stale')) {
        throw new Error('Price report is stale. Please fetch a newer report.');
      }
      
      throw new Error(`Failed to verify price report: ${error.message || errorString}`);
    } finally {
      setIsPending(false);
    }
  };

  return { verifyPrice, isPending };
}

