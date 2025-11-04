'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { opBNBTestnet } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { ThirdwebProvider } from 'thirdweb/react';
import { client } from '@/lib/config/thirdweb';

const config = createConfig({
  chains: [opBNBTestnet],
  connectors: [
    injected(),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '' }),
  ],
  transports: {
    [opBNBTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThirdwebProvider client={client}>
          {children}
        </ThirdwebProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
