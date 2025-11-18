import { useMemo, useEffect, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { defineChain } from 'thirdweb/chains';
import { getRpcClient, eth_getBalance } from 'thirdweb/rpc';
import { client } from '@/lib/config/thirdweb';

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

/**
 * Hook para obtener el balance de BNB nativo
 */
export function useBNBBalance() {
  const account = useActiveAccount();
  const [balanceRaw, setBalanceRaw] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Calcular balance en BNB (18 decimales)
  const balanceNumber = useMemo(() => {
    if (!balanceRaw) return 0;
    try {
      // Convertir de wei a BNB (18 decimales)
      return Number(balanceRaw) / 1e18;
    } catch (err) {
      console.error('Error calculando balance:', err);
      return 0;
    }
  }, [balanceRaw]);

  // Obtener balance usando getBalance de thirdweb
  useEffect(() => {
    if (!account?.address) {
      setBalanceRaw(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchBalance = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const rpcClient = getRpcClient({ client, chain: opBNBTestnet });
        const balance = await eth_getBalance(rpcClient, {
          address: account.address as `0x${string}`,
        });
        
        if (!cancelled) {
          setBalanceRaw(balance);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error obteniendo balance:', err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setIsLoading(false);
        }
      }
    };

    fetchBalance();

    // Refrescar cada 10 segundos
    const interval = setInterval(fetchBalance, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [account?.address]);

  return {
    balance: balanceNumber,
    balanceRaw: balanceRaw || undefined,
    isLoading,
    error,
    decimals: 18, // BNB tiene 18 decimales
    contractAddress: undefined, // BNB nativo no tiene dirección de contrato
  };
}

