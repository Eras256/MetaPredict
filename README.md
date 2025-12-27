# 🔮 MetaPredict.fun - Decentralized Prediction Markets

<div align="center">

![MetaPredict Logo](https://img.shields.io/badge/MetaPredict-AI%20Oracle-blue?style=for-the-badge&logo=ethereum)
![opBNB](https://img.shields.io/badge/opBNB-Testnet-orange?style=for-the-badge&logo=binance)
![Chainlink](https://img.shields.io/badge/Chainlink-Data%20Streams-375BD2?style=for-the-badge&logo=chainlink)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

**The world's first prediction market platform powered by multi-AI oracle consensus, real-time price feeds, and cross-chain aggregation.**

[![Deployed Contracts](https://img.shields.io/badge/Contracts-6%2F10%20Verified-yellow?style=for-the-badge)](https://testnet.opbnbscan.com/)
[![Test Coverage](https://img.shields.io/badge/Tests-115%2F115%20Passing-brightgreen?style=for-the-badge)](./README.md#-test-coverage)

[🚀 Quick Start](#-quick-start) • [🔗 Contracts](#-deployed-contracts) • [🤖 AI Oracle](#-multi-ai-oracle) • [📊 Tests](#-test-coverage)

</div>

---

## 🌟 Overview

**MetaPredict.fun** is a decentralized prediction market platform powered by **5-AI consensus oracle**, protected by **insurance**, and built on **opBNB** for ultra-low fees.

**Status**: ✅ **Live on opBNB Testnet** | **115/115 tests passing** | **Top 20 Global Finalist** - Seedify Prediction Markets Hackathon

**Key Features**:
- 🧠 **5 AI Models** from 3 providers (Gemini, Llama, Mistral) in sequential consensus
- ⚡ **Sub-second price feeds** via Chainlink Data Streams (100ms updates)
- 🛡️ **100% Insurance Protection** - Automatic refunds if oracle fails
- 🌐 **Cross-chain aggregation** via OmniRouter for optimal prices
- 🎯 **3 Market Types** - Binary, Conditional, and Subjective markets
- ⚡ **Ultra-low gas** - <$0.001 per transaction on opBNB
- 🤖 **Automated Resolution** - Multi-layer system resolves markets within 1 hour

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Docker (optional, for local PostgreSQL)

### Installation

```bash
# Clone repository
git clone https://github.com/Eras256/MetaPredict.git
cd MetaPredict

# Install dependencies
pnpm install

# Setup environment
cp env.example .env.local
# Edit .env.local with your API keys

# Compile contracts
cd smart-contracts
pnpm hardhat compile

# Run tests
pnpm test

# Start backend (terminal 1)
cd ../backend
pnpm dev

# Start frontend (terminal 2)
cd ../frontend
pnpm dev
```

### Environment Variables

**Required**:
- `GEMINI_API_KEY` - Google AI Studio API key
- `GROQ_API_KEY` - Groq API key
- `OPENROUTER_API_KEY` - OpenRouter API key
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` - Thirdweb Client ID
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (frontend)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase publishable key

**Optional**:
- `PRIVATE_KEY` - Wallet private key for deployment
- `GELATO_RELAY_API_KEY` - For contract automation

See `env.example` for complete list.

---

## 📋 Deployed Contracts (opBNB Testnet)

**Network**: opBNB Testnet (Chain ID: 5611)  
**Explorer**: [opBNBScan Testnet](https://testnet.opbnbscan.com/)  
**Domain**: **metapredict.fun**  
**Status**: ✅ **6/10 verified** | ✅ **115/115 tests passing**

### Core Contracts

| Contract | Address | Status |
|:--------|:--------|:------:|
| **Prediction Market Core** | `0x5eaa77CC135b82c254F1144c48f4d179964fA0b1` | ✅ Verified |
| **AI Oracle** | `0xA65bE35D25B09F7326ab154E154572dB90F67081` | ⚠️ Pending |
| **Insurance Pool** | `0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA` | ✅ Verified |
| **Reputation Staking** | `0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7` | ✅ Verified |
| **DAO Governance** | `0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123` | ✅ Verified |
| **OmniRouter** | `0x11C1124384e463d99Ba84348280e318FbeE544d0` | ✅ Verified |

### Market Contracts

| Contract | Address | Status |
|:--------|:--------|:------:|
| **Binary Market** | `0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d` | ⚠️ Pending |
| **Conditional Market** | `0x41C2b1FB595Ad18cb111c3a3Fc1B2d6307e43741` | ⚠️ Pending |
| **Subjective Market** | `0xAE88cE8f797FCBD36b0Ae78f80FDb11774d766f8` | ⚠️ Pending |

### Oracle & Data Integration

| Contract | Address | Status |
|:--------|:--------|:------:|
| **Chainlink Data Streams** | `0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3` | ✅ Verified |
| **Chainlink Verifier Proxy** | `0x001225Aca0efe49Dbb48233aB83a9b4d177b581A` | ✅ Configured |

---

## 🤖 Multi-AI Oracle

### AI Models (Sequential Priority)

| Priority | Model | Provider | Speed | Status |
|:--------:|:------|:--------:|:-----:|:------:|
| 🥇 **1st** | Gemini 2.5 Flash Lite | Google AI | ⚡⚡ Ultra Fast | ✅ Active |
| 🥈 **2nd** | Llama 3.1 Standard | Groq | ⚡⚡ Ultra Fast | ✅ Active |
| 🥉 **3rd** | Mistral 7B | OpenRouter | ⚡ Fast | ✅ Active |
| 4️⃣ | Llama 3.2 3B | OpenRouter | ⚡ Fast | ✅ Active |
| 5️⃣ | Gemini (OpenRouter) | OpenRouter | ⚡ Fast | ✅ Active |

### How It Works

1. **Sequential Query**: AIs queried in priority order (not parallel)
2. **Automatic Fallback**: If one AI fails, next one takes over
3. **Consensus Required**: 80%+ agreement among responding AIs
4. **Insurance Activation**: If consensus fails, automatic refund via insurance pool

**Result**: Maximum reliability with zero single-point-of-failure risk.

### Chainlink Data Streams

Real-time price feeds with **sub-second updates** (up to 100ms) for price-based predictions.

**Configured Streams**:
- BTC/USD: `0x00039d9e45394f473ab1f050a1b963e6b05351e52d71e507509ada0c95ed75b8`
- ETH/USD: `0x000362205e10b3a147d02792eccee483dca6c7b44ecce7012cb8c6e0b68b3ae9`
- BNB/USD: `0x000335fd3f3ffa06cfd9297b97367f77145d7a5f132e84c736cc471dd98621fe`
- USDT/USD, SOL/USD, XRP/USD, USDC/USD, DOGE/USD

**Backend URL**: `https://metapredict.fun/api/oracle/resolve` (configured on-chain)

---

## 🎯 Market Types

### 1. Binary Markets
Simple yes/no predictions.  
**Example**: "Will BTC reach $100K by December 2025?"

### 2. Conditional Markets
If-then predictions with parent-child relationships.  
**Example**: "If BTC reaches $100K, will ETH reach $10K?"

### 3. Subjective Markets
DAO-governed markets with quadratic voting.  
**Example**: "Which DeFi protocol will have the most TVL in 2026?"

---

## 🛡️ Key Features

### Insurance Pool (ERC-4626 Compatible)
- 💰 **Automatic Refunds**: If oracle consensus fails, you get your money back
- 📈 **Yield Farming**: Insurance funds earn yield via Venus Protocol
- 🔒 **Native BNB**: Uses native BNB instead of ERC20 tokens
- **Current Assets**: 1.58+ BNB (yield-generating)

### Reputation System
- 🎖️ **Reputation NFTs**: On-chain reputation as tradeable assets
- 💎 **Stake & Earn**: Stake tokens to increase your reputation
- ⚠️ **Slash Mechanism**: Bad actors lose reputation
- 📈 **Gamification**: Climb the leaderboard

### Cross-Chain Aggregation
- 🔍 **Best Price Discovery**: Automatically finds best prices across chains
- 💸 **Cost Savings**: Save 1-5% per bet
- 🔄 **Chainlink CCIP**: Secure cross-chain messaging

### Gasless UX
Powered by **Thirdweb Embedded Wallets**:
- 🔐 **No Wallet Required**: Users can start immediately
- 🔑 **Session Keys**: Seamless transactions without constant signing
- 💳 **Fiat Onramp**: Buy crypto directly in-app
- 📱 **Mobile Ready**: Works perfectly on mobile devices

---

## 📁 Project Structure

```
MetaPredict/
├── frontend/              # Next.js 15 + React 19 Frontend
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   └── lib/              # Utilities, hooks, services
├── backend/              # Express + TypeScript Backend
│   ├── src/
│   │   ├── routes/       # API routes (9 routes)
│   │   ├── services/     # Business logic (26 services)
│   │   ├── bots/         # Oracle Bot (automatic monitoring)
│   │   └── lib/          # Supabase client
│   └── __tests__/        # Backend tests
├── smart-contracts/      # Solidity Contracts + Hardhat
│   ├── contracts/        # Solidity Contracts (22 contracts)
│   ├── scripts/          # Deployment scripts
│   └── test/             # Contract tests (12 test files)
└── pnpm-workspace.yaml   # Monorepo configuration
```

---

## 🛠️ Technology Stack

### Blockchain & Infrastructure
- **opBNB** - Layer 2 network (ultra-low gas)
- **Chainlink Data Streams** - Real-time price feeds (sub-second)
- **Chainlink CCIP** - Cross-chain messaging
- **Gelato** - Automation & relay services
- **Venus Protocol** - Yield farming for insurance pool

### AI & Machine Learning
- **Google Gemini 2.5 Flash Lite** - Primary AI model (ultra-fast)
- **Groq Llama 3.1** - Ultra-fast inference (Priority 2)
- **OpenRouter** - AI model aggregation (Mistral, Llama, Gemini)

### Wallet & UX
- **Thirdweb Embedded Wallets** - Gasless UX (no wallet required)
- **Wagmi v2** - React hooks for Ethereum
- **Viem v2** - TypeScript Ethereum library

### Smart Contracts
- **Solidity 0.8.24** - Contract language
- **Hardhat 3.1.0** - Development framework
- **OpenZeppelin** - Secure contract libraries

### Frontend
- **Next.js 15** - React framework (App Router)
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 3.4** - Utility-first styling
- **Framer Motion 12** - Animations & transitions
- **TanStack Query 5** - Server state management

### Backend
- **Node.js 18+** - Runtime environment
- **Express** - Web framework
- **TypeScript 5** - Type safety
- **Supabase** - Backend-as-a-Service (PostgreSQL + Auth + API)
- **Winston** - Logging library

---

## 📡 Backend API

**9 Main Routes**:
- `/api/markets` - Market management
- `/api/oracle` - Oracle and resolution
- `/api/reputation` - Reputation system
- `/api/aggregation` - Cross-chain aggregation
- `/api/users` - User management
- `/api/ai` - AI services
- `/api/venus` - Venus Protocol integration
- `/api/gelato` - Gelato automation
- `/api/insurance` - Insurance claims

### Supabase Integration

**Status**: ✅ **100% Integrated**

- ✅ **8 Tables Created**: users, markets, bets, resolutions, reputation_history, insurance_claims, disputes, dispute_votes
- ✅ **Row Level Security (RLS)**: Enabled on all tables
- ✅ **6 Services Migrated**: All backend services use Supabase
- ✅ **33 API Endpoints**: All endpoints configured and ready
- ✅ **Frontend Sync**: Automatic synchronization after on-chain transactions

**Database Status**:
- Tables: 8/8 ✅
- RLS Policies: ✅ Enabled
- Security: ✅ No critical vulnerabilities
- Indexes: 23 indexes created

---

## 📊 Test Coverage

| Component | Tests | Status |
|:---------|:-----:|:------:|
| **Smart Contracts** | 115 | ✅ 100% Passing |
| **Security Tests** | 70+ | ✅ 100% Passing |
| **Chainlink Integration** | 15+ | ✅ 100% Passing |
| **End-to-End Tests** | 20+ | ✅ 100% Passing |
| **Supabase Integration** | 9 | ✅ 100% Passing |
| **Total** | **124+** | ✅ **Complete** |

### Supabase Integration Test Results

**Status**: ✅ **9/9 Tests Passing** (100% Pass Rate)

- ✅ **Database Connection**: Supabase accessible via MCP
- ✅ **Schema**: 8 tables, 77 columns, 23 indexes
- ✅ **RLS**: Enabled on all 8 tables
- ✅ **CRUD**: Insert, Select, Update, Delete tested and working
- ✅ **Backend**: 33 endpoints structured correctly
- ✅ **Frontend**: 8 sync functions + 5 hooks integrated

**Full Results**: 
- [PRUEBAS_ENDPOINTS_RESULTADOS.md](./PRUEBAS_ENDPOINTS_RESULTADOS.md)
- [RESULTADOS_PRUEBAS_FINALES.md](./RESULTADOS_PRUEBAS_FINALES.md)

### Running Tests

```bash
cd smart-contracts

# Run all tests
pnpm test

# Run security tests
pnpm test:security

# Run Chainlink integration tests
pnpm test:chainlink
```

---

## ✅ Integration Status

| Component | Status | Details |
|:----------|:------:|:--------|
| **Frontend ↔ Smart Contracts** | ✅ Complete | All contract addresses verified |
| **Smart Contracts ↔ Backend** | ✅ Complete | Backend URL configured on-chain |
| **Backend ↔ AI Services** | ✅ Complete | 5 AI models configured |
| **Backend ↔ Supabase** | ✅ Complete | 8 tables, 33 endpoints |
| **Frontend ↔ Supabase** | ✅ Complete | Auto-sync after transactions |
| **Chainlink Data Streams** | ✅ Complete | Stream IDs configured and tested |
| **Tests** | ✅ Complete | 115/115 contract + 9/9 Supabase tests |

---

## 🔐 Security

| Audit | Status |
|:------|:------:|
| **Slither** | ✅ Passed |
| **Mythril** | ✅ Passed |
| **Security Tests** | ✅ 70+ tests passing |

### Security Features

- ✅ **Reentrancy Protection**: All contracts protected
- ✅ **Access Control**: Well-defined roles and permissions
- ✅ **Input Validation**: Exhaustive input validation
- ✅ **Integer Overflow Protection**: Solidity 0.8.24 with automatic checks
- ✅ **Oracle Consensus**: 80%+ agreement required
- ✅ **Insurance Pool**: Automatic refund if oracle fails
- ✅ **Slash Mechanism**: Reduced reputation for bad actors

---

## 🏆 Hackathon Submission

**Seedify Prediction Markets Hackathon by BNB Chain**

**Status**: ✅ **Top 20 Global Finalist** 🏆

### Key Innovations

1. **🧠 Multi-AI Oracle Consensus**: First prediction market with 5-AI consensus from 3 providers
2. **🛡️ Insurance Guarantee**: Oracle fails = automatic refund
3. **🎖️ Reputation NFTs**: On-chain reputation as tradeable assets
4. **🔗 Conditional Markets**: Parent-child resolution logic
5. **🌐 Cross-Chain Aggregator**: Save 1-5% per bet
6. **💰 Free Tier AI Models**: All AI services use free tiers
7. **⚡ Gemini Flash Lite**: 3x faster, 71% cheaper than Flash

---

## 📜 Available Scripts

### Smart Contracts

```bash
cd smart-contracts

pnpm deploy:testnet          # Deploy to opBNB Testnet
pnpm test                   # All tests
pnpm test:security          # Security tests
pnpm verify:all            # Verify all contracts
```

### Backend

```bash
cd backend

pnpm dev                    # Development with hot reload
pnpm build                  # Compile TypeScript
pnpm start                  # Start production
pnpm test                   # Run tests
```

### Frontend

```bash
cd frontend

pnpm dev                    # Development (port 3000)
pnpm build                  # Production build
pnpm start                  # Start production
pnpm lint                   # Linter
```

---

## 🛠️ Troubleshooting

1. **Contract connection error**:
   - Verify addresses in `frontend/lib/contracts/addresses.ts`
   - Ensure connected to opBNB Testnet (Chain ID: 5611)

2. **Oracle not responding**:
   - Verify `BACKEND_URL` in `.env.local`
   - Check AI API keys are configured
   - Check backend logs

3. **Contract compilation error**:
   - Ensure Node.js 18+
   - Run `pnpm install` in `smart-contracts/`
   - Verify Hardhat configuration

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

MIT License - See [LICENSE](./LICENSE) file for details

---

## 👥 Team

**Made by Vaiosx**

- **Lead Developer**: Vaiosx
- **Smart Contracts**: Vaiosx
- **Frontend**: Vaiosx
- **Backend**: Vaiosx
- **AI/ML Integration**: Vaiosx

---

## 📚 Additional Resources

### Important Links

- **🌐 Live App**: [metapredict.fun](https://metapredict.fun)
- **🔍 Explorer**: [opBNBScan Testnet](https://testnet.opbnbscan.com/)
- **📊 Chainlink Data Streams**: [Portal](https://data.chain.link/streams)
- **🤖 AI Providers**:
  - [Google AI Studio](https://aistudio.google.com/app/apikey)
  - [Groq Console](https://console.groq.com/keys)
  - [OpenRouter](https://openrouter.ai)

---

## 🙏 Acknowledgments

- 🔗 **Chainlink** - Data Streams, CCIP & Functions
- 🎨 **Thirdweb** - Embedded Wallets
- 🌐 **BNB Chain** - opBNB network
- 💰 **Venus Protocol** - Yield farming
- 🤖 **Gelato** - Automation services
- 🧠 **Google AI, Groq, OpenRouter** - AI providers
- 📚 **OpenZeppelin** - Secure contract libraries
- ⚛️ **Next.js & React** - Frontend framework

---

<div align="center">

**🚀 Ready to predict the future? [Get Started Now](#-quick-start)**

[![Contracts](https://img.shields.io/badge/Contracts-View%20on%20Explorer-orange?style=for-the-badge)](https://testnet.opbnbscan.com/)

Made with ❤️ by **Vaiosx**

</div>
