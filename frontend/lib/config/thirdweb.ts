import { createThirdwebClient, defineChain } from 'thirdweb';

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID?.trim() || '';

// Validar que el clientId esté configurado solo en tiempo de ejecución en el cliente
const getClientId = () => {
  // Durante el build, usar un placeholder para evitar errores
  if (typeof window === 'undefined' && !clientId) {
    return 'placeholder-build-id';
  }
  
  if (!clientId) {
    const errorMessage = 
      '\n' +
      '❌ ERROR: NEXT_PUBLIC_THIRDWEB_CLIENT_ID no está configurado.\n' +
      '\n' +
      '📋 Pasos para solucionarlo:\n' +
      '   1. Ve a https://thirdweb.com/dashboard\n' +
      '   2. Crea un proyecto nuevo o selecciona uno existente\n' +
      '   3. Copia tu Client ID (se encuentra en la configuración del proyecto)\n' +
      '   4. Configura la variable de entorno NEXT_PUBLIC_THIRDWEB_CLIENT_ID en Vercel\n' +
      '   5. Reinicia el despliegue\n' +
      '\n' +
      '💡 Nota: El Client ID es gratuito y solo toma unos minutos obtenerlo.\n' +
      '\n';
    
    throw new Error(errorMessage);
  }
  
  return clientId;
};

// Crear el client de Thirdweb
export const client = createThirdwebClient({
  clientId: getClientId(),
});

// Definir opBNB Testnet
export const opBNBTestnet = defineChain({
  id: 5611,
  name: 'opBNB Testnet',
  rpc: 'https://opbnb-testnet-rpc.bnbchain.org',
  nativeCurrency: {
    name: 'BNB Chain Native Token',
    symbol: 'tBNB',
    decimals: 18,
  },
  blockExplorers: [
    {
      name: 'bscscan-opbnb-testnet',
      url: 'https://opbnb-testnet.bscscan.com',
    },
  ],
});

// Definir opBNB Mainnet
export const opBNBMainnet = defineChain({
  id: 204,
  name: 'opBNB Mainnet',
  rpc: 'https://opbnb-mainnet-rpc.bnbchain.org',
  nativeCurrency: {
    name: 'BNB Chain Native Token',
    symbol: 'BNB',
    decimals: 18,
  },
  blockExplorers: [
    {
      name: 'opbnbscan',
      url: 'https://mainnet.opbnbscan.com',
    },
  ],
});

// Exportar ambas chains como array para usar en ConnectButton
export const chains = [opBNBTestnet, opBNBMainnet];

// Exportar chain por defecto (testnet) para compatibilidad con código existente
export const chain = opBNBTestnet;

