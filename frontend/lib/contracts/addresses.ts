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
  readonly AI_ORACLE: `0x${string}`;
  readonly INSURANCE_POOL: `0x${string}`;
  readonly USDC: `0x${string}`;
} = {
  PREDICTION_MARKET: getAddress(process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS, '0x0000000000000000000000000000000000000000'),
  AI_ORACLE: getAddress(process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS, '0x0000000000000000000000000000000000000000'),
  INSURANCE_POOL: getAddress(process.env.NEXT_PUBLIC_INSURANCE_POOL_ADDRESS, '0x0000000000000000000000000000000000000000'),
  USDC: getAddress(process.env.NEXT_PUBLIC_USDC_ADDRESS, '0x0000000000000000000000000000000000000000'),
};

