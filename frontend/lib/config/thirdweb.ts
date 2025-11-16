import { createThirdwebClient } from 'thirdweb';

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

export const chain = {
  id: 5611, // opBNB Testnet
  rpc: 'https://opbnb-testnet-rpc.bnbchain.org',
};

