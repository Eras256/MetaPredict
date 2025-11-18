# 🔮 MetaPredict.ai - The Oracle of the Future

## Overview

MetaPredict.ai is the first decentralized prediction market platform that combines **5 AI models in a sequential consensus with fallback**, protected by an **on-chain insurance pool** and connected across multiple blockchains via **cross-chain aggregation**. Built on **opBNB** for fast transactions and near-zero gas costs.

---

## 🎯 Vision Statement

We are building the future of prediction markets where:

- **AI consensus** replaces single points of failure
- **Insurance** protects users from oracle manipulation
- **Cross-chain aggregation** finds the best prices
- **Gasless UX** removes friction
- **Reputation** becomes a tradeable on-chain asset

---

## 💡 Core Innovation

MetaPredict.ai solves the $7M+ oracle manipulation problem through:

### 1. Sequential Multi-AI Consensus
- **5 AI models** from 3 providers queried in priority order
- **Automatic fallback system**: If one model fails, the next one takes over
- **Consensus required**: 80%+ agreement among responding models
- **Models used**:
  1. 🥇 **Gemini 2.5 Flash** (Google AI Studio) - Free, fast
  2. 🥈 **Llama 3.1 Standard** (Groq) - Ultra fast, free
  3. 🥉 **Mistral 7B** (OpenRouter) - Free
  4. 4️⃣ **Llama 3.2 3B** (OpenRouter) - Free
  5. 5️⃣ **Gemini** (OpenRouter) - Free

### 2. Insurance Guarantee
- **100% automatic refund** if oracle fails (<60% consensus)
- **On-chain insurance pool** with yield generation
- **Automatic activation** when confidence is <80%
- **ERC-4626-style system** adapted for native BNB

### 3. Cross-Chain Aggregation
- **Automatic best price discovery** across chains
- **Save 1-5% per bet** by comparing prices
- **Chainlink CCIP integration** for secure messaging
- **Automatic arbitrage detection**

### 4. Gasless UX
- **Thirdweb Embedded Wallets**: Email login, no wallet required
- **Session Keys**: Transactions without repeated signing
- **Fiat Onramp**: Buy crypto directly in-app
- **Mobile ready**: Works perfectly on mobile devices

### 5. Reputation as NFT
- **Tradeable reputation NFTs** on-chain
- **Staking and slashing**: Stake tokens to increase reputation, lose if you vote wrong
- **Reputation tiers**: Bronze, Silver, Gold, Platinum, Diamond
- **Cross-chain portability** of reputation

---

## 🏗️ Technical Architecture

### Smart Contracts (Solidity 0.8.24)

**Core Contracts:**
- `PredictionMarketCore.sol` - Main orchestrator contract
- `AIOracle.sol` - Oracle that queries backend via Chainlink Functions
- `InsurancePool.sol` - Insurance pool with yield farming (native BNB)
- `ReputationStaking.sol` - Reputation system with NFTs (ERC-721)
- `OmniRouter.sol` - Cross-chain price aggregator
- `DAOGovernance.sol` - Decentralized governance with quadratic voting

**Market Types:**
- `BinaryMarket.sol` - Standard binary markets (YES/NO)
- `ConditionalMarket.sol` - Conditional markets (if-then)
- `SubjectiveMarket.sol` - Subjective markets (DAO-resolved)

**Integrations:**
- `ChainlinkDataStreamsIntegration.sol` - Real-time price feeds (sub-second)

### Backend (Node.js + TypeScript + Express)

**AI Services:**
- `consensus.service.ts` - Multi-AI consensus coordinator
- `google.service.ts` - Gemini 2.5 Flash integration
- `groq-llama.service.ts` - Groq Llama 3.1 integration
- `openrouter-mistral.service.ts` - Mistral 7B integration
- `openrouter-llama.service.ts` - Llama 3.2 3B integration
- `openrouter-gemini.service.ts` - Gemini via OpenRouter integration

**Core Services:**
- `oracleService.ts` - Market resolution management
- `marketService.ts` - Market management
- `reputationService.ts` - Reputation management
- `aggregationService.ts` - Cross-chain aggregation
- `gelatoService.ts` - On-chain task automation

**API Endpoints:**
- `/api/oracle/resolve` - Market resolution via AI consensus
- `/api/markets` - Market CRUD
- `/api/reputation` - Reputation management
- `/api/aggregation/compare` - Cross-chain price comparison

### Frontend (Next.js 15 + React 19 + TypeScript)

**Technologies:**
- **Next.js 15** with App Router
- **Thirdweb SDK v5** for embedded wallets
- **Wagmi v2** for contract reading
- **Viem v2** for blockchain interaction
- **TanStack Query** for state management
- **Tailwind CSS** for styling
- **Framer Motion** for animations

**Main Pages:**
- `/` - Main dashboard
- `/markets` - Market list
- `/markets/[id]` - Market details
- `/create` - Create new market
- `/reputation` - Reputation system
- `/insurance` - Insurance pool
- `/dao` - DAO governance
- `/portfolio` - User portfolio

**Custom Hooks:**
- `useMarkets.ts` - Market management
- `usePlaceBet.ts` - Place bets
- `useReputation.ts` - Reputation management
- `useInsurance.ts` - Insurance management
- `useDAO.ts` - DAO governance
- `useAggregator.ts` - Cross-chain aggregation

---

## 🔄 Operation Flow

### 1. Market Creation

```
User → Frontend → PredictionMarketCore.createBinaryMarket()
                    ↓
              Event emitted
                    ↓
              Backend detects event
                    ↓
              Market registered in DB
```

### 2. Placing a Bet

```
User → Frontend (Thirdweb Wallet)
                    ↓
              placeBet() with native BNB
                    ↓
              Fee calculation (0.5% trading + 0.1% insurance)
                    ↓
              Transfer to InsurancePool
                    ↓
              Bet registered in BinaryMarket
```

### 3. Market Resolution

```
Deadline reached → initiateResolution()
                            ↓
                    AIOracle.requestResolution()
                            ↓
                    Chainlink Functions → Backend API
                            ↓
                    ConsensusService.getConsensus()
                            ↓
                    Sequential query to 5 AIs:
                    1. Gemini 2.5 Flash
                    2. Groq Llama 3.1
                    3. OpenRouter Mistral
                    4. OpenRouter Llama
                    5. OpenRouter Gemini
                            ↓
                    Consensus calculation (80%+ required)
                            ↓
                    If <80% → Insurance activated
                    If ≥80% → On-chain resolution
```

### 4. Insurance System

```
Confidence <80% → InsurancePool.activateInsurance()
                        ↓
                Users can claim
                        ↓
                InsurancePool.processClaim()
                        ↓
                Automatic BNB refund
```

### 5. Cross-Chain Aggregation

```
User wants to bet → OmniRouter.findBestPrice()
                                ↓
                        Compare prices across all chains
                                ↓
                        Find best price
                                ↓
                        OmniRouter.routeBet()
                                ↓
                        Chainlink CCIP → Cross-chain execution
```

---

## 📊 Detailed Technical Features

### AI Consensus System

**Architecture:**
- **Sequential query** (not parallel) to prioritize fast and free models
- **Automatic fallback** if a model fails
- **Consensus calculation**: `(maxVotes / totalModels) * 100`
- **Required threshold**: 80% minimum agreement

**Advantages:**
- ✅ Prioritizes free models (reduces costs)
- ✅ Multiple perspectives from same model with different configurations
- ✅ Redundancy with automatic fallback
- ✅ Better performance by avoiding waiting for slow models

### Insurance Pool

**Features:**
- **ERC-4626-style system** adapted for native BNB
- **Automatic yield generation** (~5% APY)
- **Automatic activation** when consensus <80%
- **Guaranteed refund** of 100% of bet amount

**Metrics:**
- `totalAssets()` - Total BNB in pool
- `totalInsured` - Total insured
- `utilizationRateBP` - Utilization rate (max 80%)
- `yieldAPY` - Generated APY

### Reputation System

**Tiers:**
- **Bronze**: 0.1 BNB staked
- **Silver**: 1 BNB staked
- **Gold**: 10 BNB staked (mint NFT)
- **Platinum**: 50 BNB staked
- **Diamond**: 100 BNB staked

**Mechanics:**
- **Staking**: Stake BNB to increase reputation
- **Voting**: Vote on oracle disputes
- **Rewards**: Earn BNB if you vote correctly
- **Slashing**: Lose 20% if you vote incorrectly
- **NFTs**: Tradeable reputation NFTs on-chain

### Chainlink Data Streams Integration

**Configured Streams:**
- BTC/USD, ETH/USD, USDT/USD, BNB/USD, SOL/USD, XRP/USD, USDC/USD, DOGE/USD
- **Frequency**: ~100ms (sub-second)
- **Contract**: `0x1758d4da0bAd4DB90Dfd56Be259C19cabDcF03fd`

**Usage:**
- Automatic validation of price-based predictions
- Automatic resolution when target price is reached
- On-chain verification of Data Streams reports

---

## 🎯 Target Market

- **DeFi traders** seeking alpha
- **Crypto enthusiasts** betting on events
- **Traditional investors** exploring Web3
- **DAOs** needing prediction markets for governance
- **Developers** building prediction infrastructure

---

## 🚀 Long-term Vision

Become the infrastructure layer for all prediction markets in Web3, where:

- **Any event** can be predicted
- **AI ensures** fair resolution
- **Insurance protects** users
- **Cross-chain liquidity** is aggregated
- **Reputation is portable** across protocols

---

## 🎯 Key Differentiators

1. **First 5-AI sequential consensus** for prediction markets
2. **Only platform** with automatic insurance refunds
3. **Cross-chain aggregation** saves users money
4. **Gasless UX** removes Web3 friction
5. **Reputation as tradeable NFTs**

---

## 💰 Value Proposition

### For Users:

- **Bet on anything** with AI-backed resolution
- **Protected by insurance** if oracle fails
- **Save money** with cross-chain aggregation
- **No gas fees**, email login
- **Build reputation** as tradeable asset

### For the Ecosystem:

- **Infrastructure** for prediction markets
- **Open-source contracts**, composable
- **Cross-chain compatible**
- **DAO governance ready**
- **Developer-friendly APIs**

---

## 📋 Current Project Status

### Deployed Contracts (opBNB Testnet)

✅ **10/10 contracts verified** on opBNB Testnet (Chain ID: 5611)

**Core Contracts:**
- `PredictionMarketCore`: `0x0bB2643aCE44Bbb4Fdcc3a4fC50eECbe3Ab4a76B`
- `AIOracle`: `0xcc10a98Aa285E7bD16be1Ef8420315725C3dB66c`
- `InsurancePool`: `0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA`
- `ReputationStaking`: `0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7`
- `DAOGovernance`: `0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123`
- `OmniRouter`: `0x11C1124384e463d99Ba84348280e318FbeE544d0`

**Market Contracts:**
- `BinaryMarket`: `0xA62769c5C4D3f9EB64964241cB1F145bB0294F7E`
- `ConditionalMarket`: `0xd0FBDB61F04Cee610bF53eD1Bef4Bd2356EffF1b`
- `SubjectiveMarket`: `0xE933FB3bc9BfD23c0061E38a88b81702345E65d3`

**Integrations:**
- `ChainlinkDataStreamsIntegration`: `0x1758d4da0bAd4DB90Dfd56Be259C19cabDcF03fd`

### Tests

✅ **24/24 tests passing** (100% pass rate)
- Market creation tests
- Betting tests
- Resolution tests
- Insurance tests
- Reputation tests
- Governance tests
- Cross-chain aggregation tests

### Technologies Used

**Blockchain:**
- opBNB Testnet (Chain ID: 5611)
- Native BNB (no ERC20 tokens required)

**Smart Contracts:**
- Solidity 0.8.24
- Hardhat + Foundry
- OpenZeppelin Contracts
- Chainlink Functions & Data Streams

**Backend:**
- Node.js 18+
- TypeScript
- Express
- Prisma (ORM)
- Winston (logging)

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Thirdweb SDK v5
- Wagmi v2
- Viem v2
- Tailwind CSS

**AI:**
- Google Gemini 2.5 Flash (Google AI Studio)
- Groq Llama 3.1 Standard
- OpenRouter (Mistral 7B, Llama 3.2 3B, Gemini)

**Infrastructure:**
- Vercel (deployment)
- Gelato (automation)
- Chainlink (oracles, data streams, CCIP)

---

## 🔐 Security

- ✅ **ReentrancyGuard** on all contracts
- ✅ **Pausable** for emergencies
- ✅ **Access Control** with roles
- ✅ **Input Validation** with Zod schemas
- ✅ **Rate Limiting** on APIs
- ⏳ **CertiK Audit** pending

---

## 📚 Documentation

- [README.md](./README.md) - Main documentation
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System architecture
- [docs/CONSENSUS_SYSTEM.md](./docs/CONSENSUS_SYSTEM.md) - AI consensus system
- [docs/SMART_CONTRACTS.md](./docs/SMART_CONTRACTS.md) - Contract documentation
- [docs/API.md](./docs/API.md) - API reference
- [SERVICES_SETUP.md](./SERVICES_SETUP.md) - Services setup

---

## 🎉 The future of predictions is here. Welcome to MetaPredict.ai.
