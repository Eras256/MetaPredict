const getAddress = (envVar: string | undefined, defaultAddr: `0x${string}`): `0x${string}` => {
  const address = envVar || defaultAddr;
  // Asegurar que la dirección comience con 0x
  if (!address.startsWith('0x')) {
    return defaultAddr;
  }
  
  // Validar formato de dirección (42 caracteres: 0x + 40 hex)
  if (address.length !== 42) {
    console.warn(`Invalid address length: ${address} (${address.length} chars)`);
    return defaultAddr;
  }
  
  // Validar que solo contenga caracteres hexadecimales después de 0x
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    console.warn(`Invalid address format: ${address}`);
    return defaultAddr;
  }
  
  // Validación especial para CORE_CONTRACT_ADDRESS
  // Si se detecta la dirección antigua, automáticamente usar la correcta
  const oldAddresses = [
    '0x46ca523e51783a378fba0d06d05929652d04b19e', // Core anterior (muy antiguo)
    '0x0bb2643ace44bbb4fdcc3a4fc50eecbe3ab4a76b', // Core anterior (reciente)
  ];
  
  if (oldAddresses.includes(address.toLowerCase())) {
    console.warn('⚠️  ADVERTENCIA: Se detectó la dirección antigua del contrato core');
    console.warn('   Dirección antigua:', address);
    console.warn('   Usando dirección correcta automáticamente:', defaultAddr);
    console.warn('   💡 Solución permanente: Actualiza NEXT_PUBLIC_CORE_CONTRACT_ADDRESS en Vercel o .env.local');
    // Retornar la dirección correcta en lugar de la antigua
    return defaultAddr;
  }
  
  return address as `0x${string}`;
};

export const CONTRACT_ADDRESSES: {
  readonly PREDICTION_MARKET: `0x${string}`;
  readonly CORE_CONTRACT: `0x${string}`;
  readonly AI_ORACLE: `0x${string}`;
  readonly INSURANCE_POOL: `0x${string}`;
  readonly REPUTATION_STAKING: `0x${string}`;
  readonly DAO_GOVERNANCE: `0x${string}`;
  readonly BINARY_MARKET: `0x${string}`;
  readonly CONDITIONAL_MARKET: `0x${string}`;
  readonly SUBJECTIVE_MARKET: `0x${string}`;
  readonly OMNI_ROUTER: `0x${string}`;
  readonly DATA_STREAMS_INTEGRATION: `0x${string}`;
} = {
  // Usar CORE_CONTRACT_ADDRESS como PREDICTION_MARKET (es el contrato principal)
  // Todos los contratos ahora usan BNB nativo (no USDC)
  // Updated addresses from opbnb-testnet.json deployment (2025-11-18)
  PREDICTION_MARKET: getAddress(process.env.NEXT_PUBLIC_CORE_CONTRACT_ADDRESS, '0x5eaa77CC135b82c254F1144c48f4d179964fA0b1'),
  CORE_CONTRACT: getAddress(process.env.NEXT_PUBLIC_CORE_CONTRACT_ADDRESS, '0x5eaa77CC135b82c254F1144c48f4d179964fA0b1'),
  AI_ORACLE: getAddress(process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS, '0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c'),
  INSURANCE_POOL: getAddress(process.env.NEXT_PUBLIC_INSURANCE_POOL_ADDRESS, '0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA'),
  REPUTATION_STAKING: getAddress(process.env.NEXT_PUBLIC_REPUTATION_STAKING_ADDRESS, '0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7'),
  DAO_GOVERNANCE: getAddress(process.env.NEXT_PUBLIC_DAO_GOVERNANCE_ADDRESS, '0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123'),
  BINARY_MARKET: getAddress(process.env.NEXT_PUBLIC_BINARY_MARKET_ADDRESS, '0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d'),
  CONDITIONAL_MARKET: getAddress(process.env.NEXT_PUBLIC_CONDITIONAL_MARKET_ADDRESS, '0x41C2b1FB595Ad18cb111c3a3Fc1B2d6307e43741'),
  SUBJECTIVE_MARKET: getAddress(process.env.NEXT_PUBLIC_SUBJECTIVE_MARKET_ADDRESS, '0xAE88cE8f797FCBD36b0Ae78f80FDb11774d766f8'),
  OMNI_ROUTER: getAddress(process.env.NEXT_PUBLIC_OMNI_ROUTER_ADDRESS, '0x11C1124384e463d99Ba84348280e318FbeE544d0'),
  DATA_STREAMS_INTEGRATION: getAddress(process.env.NEXT_PUBLIC_DATA_STREAMS_INTEGRATION_ADDRESS, '0x1758d4da0bAd4DB90Dfd56Be259C19cabDcF03fd'),
};
