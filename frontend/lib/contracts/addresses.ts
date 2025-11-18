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
  readonly REPUTATION_STAKING: `0x${string}`;
  readonly DAO_GOVERNANCE: `0x${string}`;
  readonly BINARY_MARKET: `0x${string}`;
  readonly CONDITIONAL_MARKET: `0x${string}`;
  readonly SUBJECTIVE_MARKET: `0x${string}`;
  readonly OMNI_ROUTER: `0x${string}`;
  readonly DATA_STREAMS_INTEGRATION: `0x${string}`;
  readonly USDC: `0x${string}`;
} = {
  // Usar CORE_CONTRACT_ADDRESS como PREDICTION_MARKET (es el contrato principal)
  PREDICTION_MARKET: getAddress(process.env.NEXT_PUBLIC_CORE_CONTRACT_ADDRESS, '0x8BD96cfd4E9B9ad672698D6C18cece8248Fd34F8'),
  CORE_CONTRACT: getAddress(process.env.NEXT_PUBLIC_CORE_CONTRACT_ADDRESS, '0x8BD96cfd4E9B9ad672698D6C18cece8248Fd34F8'),
  AI_ORACLE: getAddress(process.env.NEXT_PUBLIC_AI_ORACLE_ADDRESS, '0xB937f6a00bE40500B3Da15795Dc72783b05c1D18'),
  INSURANCE_POOL: getAddress(process.env.NEXT_PUBLIC_INSURANCE_POOL_ADDRESS, '0x4fec42A17F54870d104bEf233688dc9904Bbd58d'),
  REPUTATION_STAKING: getAddress(process.env.NEXT_PUBLIC_REPUTATION_STAKING_ADDRESS, '0xa62ba5700E24554D342133e326D7b5496F999108'),
  DAO_GOVERNANCE: getAddress(process.env.NEXT_PUBLIC_DAO_GOVERNANCE_ADDRESS, '0x6B6a0Ad18f8E13299673d960f7dCeAaBfd64d82c'),
  BINARY_MARKET: getAddress(process.env.NEXT_PUBLIC_BINARY_MARKET_ADDRESS, '0x4755014b4b34359c27B8A289046524E0987833F9'),
  CONDITIONAL_MARKET: getAddress(process.env.NEXT_PUBLIC_CONDITIONAL_MARKET_ADDRESS, '0x7597bdb2A69FA1D42b4fE8d3F08BF23688DA908a'),
  SUBJECTIVE_MARKET: getAddress(process.env.NEXT_PUBLIC_SUBJECTIVE_MARKET_ADDRESS, '0x3973A4471D1CB66274E33dD7f9802b19D7bF6CDc'),
  OMNI_ROUTER: getAddress(process.env.NEXT_PUBLIC_OMNI_ROUTER_ADDRESS, '0xeC153A56E676a34360B884530cf86Fb53D916908'),
  DATA_STREAMS_INTEGRATION: getAddress(process.env.NEXT_PUBLIC_DATA_STREAMS_INTEGRATION_ADDRESS, '0xe1a2ac2d4269400904A7240B2B3Cef20DBE7939F'),
  USDC: getAddress(process.env.NEXT_PUBLIC_USDC_ADDRESS, '0x845E27B8A4ad1Fe3dc0b41b900dC8C1Bb45141C3'),
};
