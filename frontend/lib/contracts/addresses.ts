const getAddress = (envVar: string | undefined, defaultAddr: `0x${string}`): `0x${string}` => {
  const address = envVar || defaultAddr;
  // Asegurar que la dirección comience con 0x
  if (!address.startsWith('0x')) {
    return defaultAddr;
  }
  return address as `0x${string}`;
};

export const CONTRACT_ADDRESSES: {
  readonly PREDICTION_MARKET: `0x${string}`;
  readonly CORE_CONTRACT: `0x${string}`;
  readonly AI_ORACLE: `0x${string}`;
  readonly INSURANCE_POOL: `0x${string}`;
  readonly USDC: `0x${string}`;
} = {
  // Usar CORE_CONTRACT_ADDRESS como PREDICTION_MARKET (es el contrato principal)
  PREDICTION_MARKET: getAddress(process.env.NEXT_PUBLIC_CORE_CONTRACT_ADDRESS, '0x8BD96cfd4E9B9ad672698D6C18cece8248Fd34F8'),
  CORE_CONTRACT: getAddress(process.env.NEXT_PUBLIC_CORE_CONTRACT_ADDRESS, '0x8BD96cfd4E9B9ad672698D6C18cece8248Fd34F8'),
  AI_ORACLE: getAddress(process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS, '0xB937f6a00bE40500B3Da15795Dc72783b05c1D18'),
  INSURANCE_POOL: getAddress(process.env.NEXT_PUBLIC_INSURANCE_POOL_ADDRESS, '0x4fec42A17F54870d104bEf233688dc9904Bbd58d'),
  USDC: getAddress(process.env.NEXT_PUBLIC_USDC_ADDRESS, '0x845E27B8A4ad1Fe3dc0b41b900dC8C1Bb45141C3'),
};

