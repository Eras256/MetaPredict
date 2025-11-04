import { createConfig, http } from 'wagmi';
import { opBNBTestnet } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Wagmi config con connectors para wallets
export const wagmiConfig = createConfig({
  chains: [opBNBTestnet],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
      showQrModal: true,
    }),
  ],
  transports: {
    [opBNBTestnet.id]: http(),
  },
  ssr: false, // Deshabilitar SSR para evitar problemas con wallets
});

