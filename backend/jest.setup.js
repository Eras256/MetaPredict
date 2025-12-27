// Jest setup for backend tests
process.env.NODE_ENV = 'test';

// Mock environment variables
process.env.PORT = '3001';
process.env.TRUTH_CHAIN_ADDRESS = '0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B';
process.env.AI_ORACLE_ADDRESS = '0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c';
process.env.INSURANCE_POOL_ADDRESS = '0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA';
process.env.REPUTATION_STAKING_ADDRESS = '0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7';
process.env.DAO_GOVERNANCE_ADDRESS = '0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123';
process.env.OMNI_ROUTER_ADDRESS = '0x11C1124384e463d99Ba84348280e318FbeE544d0';
process.env.BINARY_MARKET_ADDRESS = '0xA62769c5C4D3f9EB64964241cB1F145bB0294F7E';
process.env.CONDITIONAL_MARKET_ADDRESS = '0xd0FBDB61F04Cee610bF53eD1Bef4Bd2356EffF1b';
process.env.SUBJECTIVE_MARKET_ADDRESS = '0xE933FB3bc9BfD23c0061E38a88b81702345E65d3';
process.env.DATA_STREAMS_INTEGRATION_ADDRESS = '0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3';

// opBNB Testnet RPC
process.env.RPC_URL = process.env.RPC_URL || 'https://opbnb-testnet-rpc.bnbchain.org';
process.env.CHAIN_ID = '5611';

// API Keys (mock for testing)
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-key';
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'test-groq-key';
process.env.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'test-openrouter-key';

// Chainlink
process.env.CHAINLINK_DATA_STREAMS_VERIFIER_PROXY = '0x001225Aca0efe49Dbb48233aB83a9b4d177b581A';

// Increase timeout for async operations
jest.setTimeout(30000);

