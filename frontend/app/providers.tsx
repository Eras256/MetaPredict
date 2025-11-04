'use client';

import { ThirdwebProvider } from 'thirdweb/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/lib/config/wagmi';
import { Toaster } from '@/components/ui/toaster';
import { ErrorHandler } from './error-handler';
import { useState } from 'react';

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <ThirdwebProvider clientId={clientId}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ErrorHandler />
          {children}
          <Toaster />
        </QueryClientProvider>
      </WagmiProvider>
    </ThirdwebProvider>
  );
}
