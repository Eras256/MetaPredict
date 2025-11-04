import { createConfig, http } from 'wagmi';
import { opBNBTestnet } from 'wagmi/chains';
import { createThirdwebClient, getRpcClient } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';

// Thirdweb client
export const thirdwebClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '',
});

// opBNB Testnet chain config
export const opBNBTestnetChain = defineChain({
  id: 5611,
  name: 'opBNB Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpc: 'https://opbnb-testnet-rpc.bnbchain.org',
  blockExplorers: [
    {
      name: 'opBNB Testnet Explorer',
      url: 'https://opbnb-testnet.bscscan.com',
    },
  ],
});

// Wagmi config
export const wagmiConfig = createConfig({
  chains: [opBNBTestnet],
  transports: {
    [opBNBTestnet.id]: http(),
  },
});

