import { createThirdwebClient } from 'thirdweb';

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID?.trim() || '';

// Validar que el clientId esté configurado solo en tiempo de ejecución
const getClient = () => {
  if (!clientId) {
    const errorMessage = 
      '\n' +
      '❌ ERROR: NEXT_PUBLIC_THIRDWEB_CLIENT_ID no está configurado.\n' +
      '\n' +
      '📋 Pasos para solucionarlo:\n' +
      '   1. Ve a https://thirdweb.com/dashboard\n' +
      '   2. Crea un proyecto nuevo o selecciona uno existente\n' +
      '   3. Copia tu Client ID (se encuentra en la configuración del proyecto)\n' +
      '   4. Abre el archivo: frontend/.env.local\n' +
      '   5. Agrega o actualiza: NEXT_PUBLIC_THIRDWEB_CLIENT_ID=tu_client_id_aqui\n' +
      '   6. Guarda el archivo y reinicia el servidor de desarrollo\n' +
      '\n' +
      '💡 Nota: El Client ID es gratuito y solo toma unos minutos obtenerlo.\n' +
      '\n';
    
    throw new Error(errorMessage);
  }
  
  return createThirdwebClient({
    clientId,
  });
};

// Crear el client de Thirdweb (solo en tiempo de ejecución, no durante el build)
export const client = typeof window !== 'undefined' || process.env.NODE_ENV === 'development' 
  ? getClient() 
  : createThirdwebClient({ clientId: 'placeholder' }); // Placeholder para build

export const chain = {
  id: 5611, // opBNB Testnet
  rpc: 'https://opbnb-testnet-rpc.bnbchain.org',
};

