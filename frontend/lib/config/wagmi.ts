import { createConfig, http } from 'wagmi';
import { opBNBTestnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Wagmi config - Thirdweb maneja las conexiones de wallet
// Solo usamos wagmi para leer contratos y datos on-chain
export const wagmiConfig = createConfig({
  chains: [opBNBTestnet],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [opBNBTestnet.id]: http(),
  },
  ssr: false, // Deshabilitar SSR para evitar problemas con wallets
});

