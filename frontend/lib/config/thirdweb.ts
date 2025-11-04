import { createThirdwebClient } from 'thirdweb';

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID?.trim() || '';

// Obtener el Client ID, usando un placeholder si no está configurado
const getClientId = () => {
  if (!clientId) {
    // Solo mostrar advertencia en el cliente, no lanzar error fatal
    if (typeof window !== 'undefined') {
      console.warn(
        '⚠️ ADVERTENCIA: NEXT_PUBLIC_THIRDWEB_CLIENT_ID no está configurado.\n' +
        '\n' +
        '📋 Pasos para solucionarlo:\n' +
        '   1. Ve a https://thirdweb.com/dashboard\n' +
        '   2. Crea un proyecto nuevo o selecciona uno existente\n' +
        '   3. Copia tu Client ID (se encuentra en la configuración del proyecto)\n' +
        '   4. Configura la variable de entorno NEXT_PUBLIC_THIRDWEB_CLIENT_ID en Vercel\n' +
        '   5. Reinicia el despliegue\n' +
        '\n' +
        '💡 Nota: El Client ID es gratuito y solo toma unos minutos obtenerlo.\n'
      );
    }
    // Usar un placeholder para que la aplicación no falle
    return 'placeholder-client-id';
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

