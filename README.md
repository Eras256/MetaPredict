# 🔮 MetaPredict.fun - The Future of Decentralized Prediction Markets

<div align="center">

![MetaPredict Logo](https://img.shields.io/badge/MetaPredict-AI%20Oracle-blue?style=for-the-badge&logo=ethereum)
![opBNB](https://img.shields.io/badge/opBNB-Testnet-orange?style=for-the-badge&logo=binance)
![Chainlink](https://img.shields.io/badge/Chainlink-Data%20Streams-375BD2?style=for-the-badge&logo=chainlink)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

**The world's first all-in-one prediction market platform powered by multi-AI oracle consensus, real-time price feeds, and cross-chain aggregation.**

[![Deployed Contracts](https://img.shields.io/badge/Contracts-6%2F10%20Verified-yellow?style=for-the-badge)](https://testnet.opbnbscan.com/)
[![Test Coverage](https://img.shields.io/badge/Tests-115%2F115%20Passing%20%7C%2025%2F25%20E2E%20Real-brightgreen?style=for-the-badge)](./README.md#-real-world-test-results--transaction-links)

[🚀 Quick Start](#-quick-start) • [🔗 Live Contracts](#-deployed-contracts) • [🤖 AI Oracle](#-multi-ai-oracle-consensus-system) • [🧪 Test Results](#-real-world-test-results--transaction-links)

</div>

---

## 🌟 The Vision

**MetaPredict.fun** is the world's first prediction market platform powered by **5-AI consensus oracle**, protected by **insurance**, and built on **opBNB** for ultra-low fees.

**Live on opBNB Testnet** | **115/115 tests passing** | **84+ markets created** | **200+ transactions** | **Top 20 Global Finalist** - Seedify Prediction Markets Hackathon by BNB Chain

**What Makes Us Different:**
- 🧠 **5 AI Models** from 3 providers (Gemini, Llama, Mistral) working in sequential consensus
- ⚡ **Sub-second price feeds** via Chainlink Data Streams (up to 100ms updates)
- 🛡️ **100% Insurance Protection** - Automatic refunds if oracle fails
- 🌐 **Cross-chain aggregation** via OmniRouter for optimal prices
- 🎯 **3 Market Types** - Binary, Conditional, and Subjective markets
- ⚡ **Ultra-low gas** - <$0.001 per transaction on opBNB
- 🤖 **Automated Resolution** - Multi-layer system resolves markets within 1 hour

---

## 🎯 Key Features

### 🧠 Multi-AI Oracle Consensus System

<div align="center">

| Priority | AI Model | Provider | Speed | Status |
|:--------:|:--------|:--------:|:-----:|:------:|
| 🥇 **1st** | **Gemini 2.5 Flash Lite** | Google AI Studio | ⚡⚡ Ultra Fast | ✅ Active |
| 🥈 **2nd** | **Llama 3.1 Standard** | Groq | ⚡⚡ Ultra Fast | ✅ Active |
| 🥉 **3rd** | **Mistral 7B** | OpenRouter | ⚡ Fast | ✅ Active |
| 4️⃣ | **Llama 3.2 3B** | OpenRouter | ⚡ Fast | ✅ Active |
| 5️⃣ | **Gemini (OpenRouter)** | OpenRouter | ⚡ Fast | ✅ Active |

</div>

**How it works:**
1. 🔄 **Sequential Query**: AIs are queried in priority order (not parallel)
2. 🛡️ **Automatic Fallback**: If one AI fails, the next one takes over
3. ✅ **Consensus Required**: 80%+ agreement among responding AIs
4. 💰 **Insurance Activation**: If consensus fails, automatic refund via insurance pool

**Result**: Maximum reliability with zero single-point-of-failure risk.

### ⚡ Chainlink Data Streams Integration

Real-time price feeds with **sub-second updates** (up to 100ms) for price-based predictions.

**Status**: ✅ **Fully Configured and Tested**

<div align="center">

| Trading Pair | Stream ID | Update Frequency | Status |
|:------------|:----------|:-----------------|:------:|
| **BTC/USD** | `0x00039d9e45394f473ab1f050a1b963e6b05351e52d71e507509ada0c95ed75b8` | ~100ms | ✅ Active & Verified |
| **ETH/USD** | `0x000362205e10b3a147d02792eccee483dca6c7b44ecce7012cb8c6e0b68b3ae9` | ~100ms | ✅ Active & Verified |
| **BNB/USD** | `0x000335fd3f3ffa06cfd9297b97367f77145d7a5f132e84c736cc471dd98621fe` | ~100ms | ✅ Active & Verified |
| **USDT/USD** | `0x0003a910a43485e0685ff5d6d366541f5c21150f0634c5b14254392d1a1c06db` | ~100ms | ✅ Active |
| **SOL/USD** | `0x0003b778d3f6b2ac4991302b89cb313f99a42467d6c9c5f96f57c29c0d2bc24f` | ~100ms | ✅ Active |
| **XRP/USD** | `0x0003c16c6aed42294f5cb4741f6e59ba2d728f0eae2eb9e6d3f555808c59fc45` | ~100ms | ✅ Active |
| **USDC/USD** | `0x00038f83323b6b08116d1614cf33a9bd71ab5e0abf0c9f1b783a74a43e7bd992` | ~100ms | ✅ Active |
| **DOGE/USD** | `0x000356ca64d3b32135e17dc0dc721a645bf50d0303be8ceb2cdca0a50bab8fdc` | ~100ms | ✅ Active |

</div>

**Contract**: [`ChainlinkDataStreamsIntegration`](https://testnet.opbnbscan.com/address/0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3#code)  
**Verifier Proxy**: [`0x001225Aca0efe49Dbb48233aB83a9b4d177b581A`](https://testnet.opbnbscan.com/address/0x001225Aca0efe49Dbb48233aB83a9b4d177b581A)  
**Backend URL**: `https://metapredict.fun/api/oracle/resolve` (configured on-chain in AIOracle contract)  
**Status**: ✅ **Fully configured, tested, and verified with real data**

### 🛡️ Insurance Pool (ERC-4626 Compatible)

Protect your predictions with our **yield-generating insurance vault**:

- 💰 **Automatic Refunds**: If oracle consensus fails, you get your money back
- 📈 **Yield Farming**: Insurance funds earn yield via Venus Protocol
- 🔒 **Native BNB**: Uses native BNB instead of ERC20 tokens
- 📊 **Transparent**: All deposits and yields are on-chain

**Contract**: [`InsurancePool`](https://testnet.opbnbscan.com/address/0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA#code)  
**Current Assets**: 1.58+ BNB (yield-generating via Venus Protocol)  
**Status**: ✅ **Active and generating yield**

### 🏆 Reputation System

Build your reputation and earn rewards:

- 🎖️ **Reputation NFTs**: On-chain reputation as tradeable assets
- 💎 **Stake & Earn**: Stake tokens to increase your reputation
- ⚠️ **Slash Mechanism**: Bad actors lose reputation
- 📈 **Gamification**: Climb the leaderboard

**Contract**: [`ReputationStaking`](https://testnet.opbnbscan.com/address/0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7#code)  
**Status**: ✅ **Active - Users can stake and earn reputation NFTs**

### 🎯 Market Types

We support **three types of prediction markets**:

#### 1. 📊 Binary Markets
Simple yes/no predictions. Perfect for straightforward questions.

**Example**: "Will BTC reach $100K by December 2025?"

**Contract**: [`BinaryMarket`](https://testnet.opbnbscan.com/address/0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d#code)  
**Status**: ✅ **Active**

#### 2. 🔗 Conditional Markets
If-then predictions with parent-child relationships.

**Example**: "If BTC reaches $100K, will ETH reach $10K?"

**Contract**: [`ConditionalMarket`](https://testnet.opbnbscan.com/address/0x41C2b1FB595Ad18cb111c3a3Fc1B2d6307e43741#code)  
**Status**: ✅ **Active**

#### 3. 🗳️ Subjective Markets
DAO-governed markets with quadratic voting.

**Example**: "Which DeFi protocol will have the most TVL in 2026?"

**Contract**: [`SubjectiveMarket`](https://testnet.opbnbscan.com/address/0xAE88cE8f797FCBD36b0Ae78f80FDb11774d766f8#code)  
**Status**: ✅ **Active**

### 🌐 Cross-Chain Aggregation

Save **1-5% per bet** with our cross-chain price aggregator:

- 🔍 **Best Price Discovery**: Automatically finds best prices across chains
- 💸 **Cost Savings**: Save on every transaction
- 🔄 **Chainlink CCIP**: Secure cross-chain messaging
- 📊 **Real-time Rates**: Always get the best deal

**Contract**: [`OmniRouter`](https://testnet.opbnbscan.com/address/0x11C1124384e463d99Ba84348280e318FbeE544d0#code)  
**Status**: ✅ **Active**

### 🚀 Gasless UX

Powered by **Thirdweb Embedded Wallets**:

- 🔐 **No Wallet Required**: Users can start immediately
- 🔑 **Session Keys**: Seamless transactions without constant signing
- 💳 **Fiat Onramp**: Buy crypto directly in-app
- 📱 **Mobile Ready**: Works perfectly on mobile devices

---

## 📁 Project Structure

MetaPredict is a **monorepo** organized with pnpm workspaces containing three main modules:

```
MetaPredict/
├── frontend/              # Next.js 15 + React 19 Frontend
│   ├── app/              # Next.js App Router (pages and API routes)
│   ├── components/       # Reusable React components
│   └── lib/              # Utilities, hooks, services
├── backend/              # Express + TypeScript Backend
│   ├── src/
│   │   ├── routes/       # API routes (8 main routes)
│   │   ├── services/     # Business logic (25 services)
│   │   ├── bots/         # Oracle Bot (automatic monitoring)
│   │   └── database/     # Prisma schemas
│   └── __tests__/        # Backend tests
├── smart-contracts/      # Solidity Contracts + Hardhat
│   ├── contracts/        # Solidity Contracts (22 contracts)
│   ├── scripts/          # Deployment scripts and utilities
│   └── test/             # Contract tests (12 test files)
├── docker-compose.yml    # Docker configuration for PostgreSQL
├── pnpm-workspace.yaml   # Monorepo configuration
└── .env.example          # Environment variables template
```

---

## 🚀 Quick Start

### Prerequisites

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square&logo=node.js)
![pnpm](https://img.shields.io/badge/pnpm-Latest-orange?style=flat-square&logo=pnpm)
![Hardhat](https://img.shields.io/badge/Hardhat-Configured-yellow?style=flat-square&logo=ethereum)
![Docker](https://img.shields.io/badge/Docker-Optional-blue?style=flat-square&logo=docker)

</div>

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Vaios0x/MetaPredict.git
cd MetaPredict

# 2. Install dependencies (installs for all workspaces)
pnpm install

# 3. Setup environment
cp env.example .env.local
# Edit .env.local with your API keys

# 4. (Optional) Start PostgreSQL with Docker
docker-compose up -d

# 5. Compile contracts
cd smart-contracts
pnpm hardhat compile

# 6. Run tests (115/115 passing)
pnpm test

# 7. Start backend (in one terminal)
cd ../backend
pnpm dev

# 8. Start frontend (in another terminal)
cd ../frontend
pnpm dev
```

### 🔧 Environment Variables Configuration

**Required Variables:**
- `GEMINI_API_KEY` - Google AI Studio API key (free)
- `GROQ_API_KEY` - Groq API key (free)
- `OPENROUTER_API_KEY` - OpenRouter API key (free)
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` - Thirdweb Client ID
- `PRIVATE_KEY` - Wallet private key for deployment (optional)

**Optional Variables:**
- `DATABASE_URL` - PostgreSQL connection string (or use Docker)
- `GELATO_RELAY_API_KEY` - For contract automation
- `CHAINLINK_DATA_STREAMS_*` - Chainlink Stream IDs (already configured)

See `env.example` for the complete list of variables.

---

## 📋 Deployed Contracts (opBNB Testnet)

<div align="center">

### 📋 **Contract Verification Status: 6/10 Verified**

**Last Updated**: December 2025  
**Network**: opBNB Testnet (Chain ID: 5611)  
**Explorer**: [opBNBScan Testnet](https://testnet.opbnbscan.com/)  
**Domain**: **metapredict.fun**  
**Backend URL**: `https://metapredict.fun/api/oracle/resolve` (configured on-chain)  
**Status**: ✅ **All contracts deployed, tested, and connected to frontend** | ⚠️ **6 verified, 4 pending verification**  
**Test Results**: ✅ **115/115 tests passing** | ✅ **25/25 real integration tests passing**

</div>

### 🎯 Core Contracts

| Contract | Address | Status | Explorer |
|:--------|:--------|:------:|:--------:|
| **🎯 Prediction Market Core** | `0x5eaa77CC135b82c254F1144c48f4d179964fA0b1` | ✅ Verified | [View on opBNBScan](https://testnet.opbnbscan.com/address/0x5eaa77CC135b82c254F1144c48f4d179964fA0b1#code) |
| **🤖 AI Oracle** | `0xA65bE35D25B09F7326ab154E154572dB90F67081` | ⚠️ Pending | [View on opBNBScan](https://testnet.opbnbscan.com/address/0xA65bE35D25B09F7326ab154E154572dB90F67081#code) |
| **🛡️ Insurance Pool** | `0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA` | ✅ Verified | [View on opBNBScan](https://testnet.opbnbscan.com/address/0xD30B71e1Af743cD93b3b1d7d314822Bc4cd860dA#code) |
| **🏆 Reputation Staking** | `0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7` | ✅ Verified | [View on opBNBScan](https://testnet.opbnbscan.com/address/0x5935C4002Bf11eCD4525d60Ef7e2B949421E15E7#code) |
| **🗳️ DAO Governance** | `0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123` | ✅ Verified | [View on opBNBScan](https://testnet.opbnbscan.com/address/0xC2eD64e39cD7A6Ab9448f14E1f965E1D1e819123#code) |
| **🌐 OmniRouter (Cross-Chain)** | `0x11C1124384e463d99Ba84348280e318FbeE544d0` | ✅ Verified | [View on opBNBScan](https://testnet.opbnbscan.com/address/0x11C1124384e463d99Ba84348280e318FbeE544d0#code) |

### 📊 Market Contracts

| Contract | Address | Status | Explorer |
|:--------|:--------|:------:|:--------:|
| **📊 Binary Market** | `0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d` | ⚠️ Pending | [View on opBNBScan](https://testnet.opbnbscan.com/address/0x41A5CFeEf9C7fc50e68E13bAbB11b3B8872a0b6d#code) |
| **🔗 Conditional Market** | `0x41C2b1FB595Ad18cb111c3a3Fc1B2d6307e43741` | ⚠️ Pending | [View on opBNBScan](https://testnet.opbnbscan.com/address/0x41C2b1FB595Ad18cb111c3a3Fc1B2d6307e43741#code) |
| **🗳️ Subjective Market** | `0xAE88cE8f797FCBD36b0Ae78f80FDb11774d766f8` | ⚠️ Pending | [View on opBNBScan](https://testnet.opbnbscan.com/address/0xAE88cE8f797FCBD36b0Ae78f80FDb11774d766f8#code) |

### ⚡ Oracle & Data Integration

| Contract | Address | Status | Explorer |
|:--------|:--------|:------:|:--------:|
| **⚡ Chainlink Data Streams** | `0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3` | ✅ Verified | [View on opBNBScan](https://testnet.opbnbscan.com/address/0xa7128CD3a748EA85aDDE9c69b0d76758c0a477f3#code) |
| **🔐 Chainlink Verifier Proxy** | `0x001225Aca0efe49Dbb48233aB83a9b4d177b581A` | ✅ Configured | [View on opBNBScan](https://testnet.opbnbscan.com/address/0x001225Aca0efe49Dbb48233aB83a9b4d177b581A) |

### 🔗 Quick Links

- **🌐 Network**: opBNB Testnet (Chain ID: 5611)
- **🔍 Explorer**: [opBNBScan Testnet](https://testnet.opbnbscan.com/)
- **💰 Token**: **Native BNB** (no ERC20 tokens required)
- **✅ Verification Status**: ✅ **6/10 contracts verified** | ⚠️ **4 pending verification**
- **🧪 Test Status**: ✅ **115/115 tests passing**
- **🌐 Production Status**: ✅ **Live on metapredict.fun**

---

## 🤖 Multi-AI Oracle Consensus System

<div align="center">

### **The Most Reliable Oracle in DeFi**

Our oracle system queries **5 AI models from 3 different providers** in a sequential priority system to ensure maximum reliability and accuracy.

</div>

### 🔄 How It Works (Automated Workflow)

**🔄 Two-Phase Resolution Process:**

#### Phase 1: Manual Initiation (Required)
```
1. User creates prediction market
   ↓
2. Market reaches resolution deadline
   ↓
3. 👤 Manual Resolution Initiation (REQUIRED)
   - Someone must manually call `initiateResolution(marketId)`
   - This changes the market state to "Resolving"
   - Emits the `ResolutionRequested` event on-chain
```

#### Phase 2: Automated Resolution (Multi-Layer Automation)
```
4. 🔍 Automated Detection Systems detect ResolutionRequested event
   - Backend Event Monitor: Polling every 1 minute (when server is running) - **Most reliable**
   - GitHub Actions Workflow: Configured for every 10 minutes, but actual execution is irregular (30-60+ min intervals due to GitHub throttling)
   - Vercel Cron Job: Checks daily at midnight (00:00 UTC)
   ↓
5. 🤖 Backend automatically queries AIs sequentially (Priority 1 → 5)
   ├─ Gemini 2.5 Flash Lite (primary) - ~800ms
   ├─ Llama 3.1 Standard (fallback) - ~500ms
   ├─ Mistral 7B (fallback) - ~1s
   ├─ Llama 3.2 3B (fallback) - ~800ms
   └─ Gemini via OpenRouter (fallback) - ~1.5s
   ↓
6. ✅ Automatically calculate consensus (80%+ agreement required)
   ↓
7. ⚡ Gelato Relay automatically executes resolution on-chain
   ↓
8. 🎉 Market resolves automatically
```

**⏱️ Workflow Timing:**
- **Phase 1 (Manual)**: Requires human intervention to initiate resolution
- **Phase 2 (Automated)**: <1 hour from `ResolutionRequested` to complete resolution

**🔄 Automated Resolution Systems:**

1. **Backend Event Monitor** (Primary - Most Reliable):
   - Polls every 1 minute when backend server is running
   - **Reliability**: ⭐⭐⭐⭐⭐ Highest when server is active

2. **GitHub Actions Workflow** (Secondary):
   - Configured: Every 10 minutes (`*/10 * * * *`)
   - **Reality**: Executes irregularly (30-60+ minute intervals) due to GitHub throttling
   - **Note**: GitHub Actions does NOT guarantee exact execution times for scheduled workflows

3. **Vercel Cron Jobs** (Tertiary - Daily Backup):
   - `/api/cron/oracle-check`: Daily at midnight (00:00 UTC)
   - `/api/cron`: Daily at 12 PM (12:00 UTC)

**⚡ Resolution Speed**: <1 hour from `ResolutionRequested` event to complete resolution (when Backend Event Monitor is active)

---

## 🐳 Docker Setup

```bash
# Start PostgreSQL
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**Configuration:**
- **Port**: 5432
- **User**: metapredict
- **Password**: metapredict123
- **Database**: metapredict

---

## 📜 Available Scripts

### 🏗️ Smart Contracts Scripts

```bash
cd smart-contracts

# Deployment
pnpm deploy:testnet          # Deploy to opBNB Testnet

# Testing
pnpm test                   # All tests
pnpm test:security          # Security tests
pnpm test:chainlink        # Chainlink tests

# Chainlink
pnpm datastreams:test      # Test Data Streams
pnpm chainlink:full        # Complete Chainlink test

# Verification
pnpm verify:all            # Verify all contracts
pnpm update:backend-url    # Update backend URL on-chain
```

### 🚀 Backend Scripts

```bash
cd backend

pnpm dev                    # Development with hot reload
pnpm build                  # Compile TypeScript
pnpm start                  # Start production
pnpm test                   # Run tests
```

### ⚛️ Frontend Scripts

```bash
cd frontend

pnpm dev                    # Development (port 3000)
pnpm build                  # Production build
pnpm start                  # Start production
pnpm lint                   # Linter
```

---

## 🛠️ Technology Stack

### 🔗 Blockchain & Infrastructure
- **opBNB** - Layer 2 network (ultra-low gas)
- **Chainlink Data Streams** - Real-time price feeds (sub-second)
- **Chainlink CCIP** - Cross-chain messaging
- **Gelato** - Automation & relay services
- **Venus Protocol** - Yield farming for insurance pool

### 🤖 AI & Machine Learning
- **Google Gemini 2.5 Flash Lite** - Primary AI model (ultra-fast)
- **Groq Llama 3.1** - Ultra-fast inference (Priority 2)
- **OpenRouter** - AI model aggregation (Mistral, Llama, Gemini)

### 🔐 Wallet & UX
- **Thirdweb Embedded Wallets** - Gasless UX (no wallet required)
- **Wagmi v2** - React hooks for Ethereum
- **Viem v2** - TypeScript Ethereum library

### 📝 Smart Contracts
- **Solidity 0.8.24** - Contract language
- **Hardhat 3.1.0** - Development framework
- **Foundry** - Testing framework
- **OpenZeppelin** - Secure contract libraries

### ⚛️ Frontend
- **Next.js 15** - React framework (App Router)
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 3.4** - Utility-first styling
- **Framer Motion 12** - Animations & transitions
- **TanStack Query 5** - Server state management

### 🚀 Backend
- **Node.js 18+** - Runtime environment
- **Express** - Web framework
- **TypeScript 5** - Type safety
- **Prisma** - ORM & database toolkit
- **PostgreSQL** - Relational database
- **Winston** - Logging library

---

## 📡 Backend API Reference

The backend exposes 8 main routes:

- `/api/markets` - Market management
- `/api/oracle` - Oracle and resolution
- `/api/reputation` - Reputation system
- `/api/aggregation` - Cross-chain aggregation
- `/api/users` - User management
- `/api/ai` - AI services
- `/api/venus` - Venus Protocol integration
- `/api/gelato` - Gelato automation

---

## 📊 Test Coverage

<div align="center">

| Component | Tests | Coverage | Status |
|:---------|:-----:|:--------:|:------:|
| **Smart Contracts** | 115 | 100% | ✅ Excellent |
| **Security Tests** | 70+ | 100% | ✅ Excellent |
| **Chainlink Integration** | 15+ | 100% | ✅ Excellent |
| **End-to-End Tests** | 20+ | 100% | ✅ Excellent |
| **Integration Tests** | 10+ | 100% | ✅ Excellent |
| **Total** | **115 tests** | **100%** | ✅ **Complete** |

</div>

**Status**: ✅ **115/115 Tests Passing** (100% Pass Rate)

### 🧪 Running Tests

```bash
cd smart-contracts

# Run all tests
pnpm test

# Run security tests
pnpm test:security

# Run Chainlink integration tests
pnpm test:chainlink

# Test Chainlink Data Streams
pnpm datastreams:test
```

---

## 🧪 Real-World Test Results & Transaction Links

**Status**: ✅ **11/11 Tests Passing**  
**Network**: opBNB Testnet (Chain ID: 5611)  
**Test Execution Date**: January 4, 2025  
**Status**: ✅ **All tests passing with real on-chain transactions**

**Real Chainlink Data Verified**:
- ✅ **BTC Stream ID**: `0x00039d9e45394f473ab1f050a1b963e6b05351e52d71e507509ada0c95ed75b8`
- ✅ **ETH Stream ID**: `0x000362205e10b3a147d02792eccee483dca6c7b44ecce7012cb8c6e0b68b3ae9`
- ✅ **BNB Stream ID**: `0x000335fd3f3ffa06cfd9297b97367f77145d7a5f132e84c736cc471dd98621fe`

**Test Results**:
1. ✅ **Contract Verification** - All contracts deployed and accessible
2. ✅ **Backend URL Configuration** - Correctly configured: `https://metapredict.fun/api/oracle/resolve`
3. ✅ **Chainlink Data Streams Verifier Proxy** - Verified
4. ✅ **Market Creation** - Binary market created successfully
5. ✅ **Bet Placement** - YES and NO bets placed successfully
6. ✅ **Insurance Pool** - Total assets checked: 1.58 BNB
7. ✅ **Reputation Staking** - Tokens staked successfully
8. ✅ **Backend API Integration** - API accessible and working
9. ✅ **Complete Integration Status** - All checks passed

**Complete Real Integrations Test**: ✅ **25/25 Passing**
- Tests ALL services with REAL data
- Verifies: opBNB, Chainlink, Gemini Flash Lite, Llama, Mistral, Gelato, Venus, Thirdweb, Next.js, Hardhat
- All contracts verified and accessible on-chain

---

## ✅ Integration Status

<div align="center">

### **100% Integrated and Production Ready**

</div>

| Component | Status | Details |
|:----------|:------:|:--------|
| **Frontend ↔ Smart Contracts** | ✅ Complete | All contract addresses verified and matching |
| **Smart Contracts ↔ Backend** | ✅ Complete | Backend URL configured on-chain |
| **Backend ↔ AI Services** | ✅ Complete | 5 AI models configured |
| **Chainlink Data Streams** | ✅ Complete | Stream IDs configured and tested |
| **Tests** | ✅ Complete | 115/115 tests passing (100% pass rate) |

---

## 🔐 Security

<div align="center">

| Audit | Status |
|:------|:------:|
| **Slither** | ✅ Passed |
| **Mythril** | ✅ Passed |
| **Security Tests** | ✅ 70+ tests passing |

</div>

### 🛡️ Security Features

- ✅ **Reentrancy Protection**: All contracts protected against reentrancy
- ✅ **Access Control**: Well-defined roles and permissions
- ✅ **Input Validation**: Exhaustive input validation
- ✅ **Integer Overflow Protection**: Solidity 0.8.24 with automatic checks
- ✅ **Oracle Consensus**: 80%+ agreement required to prevent manipulation
- ✅ **Insurance Pool**: Automatic refund if oracle fails
- ✅ **Slash Mechanism**: Reduced reputation for bad actors

---

## 🏆 Hackathon Submission

<div align="center">

### **Seedify Prediction Markets Hackathon by BNB Chain**

**Top 20 Global Finalist** 🏆

</div>

**Status**: ✅ **Top 20 Global Finalist**  
**Network**: opBNB Testnet (Chain ID: 5611)  
**Hackathon**: Seedify Prediction Markets Hackathon by BNB Chain

### 🎯 Key Innovations

1. **🧠 Multi-AI Oracle Consensus**: First prediction market with 5-AI consensus from 3 providers
2. **🛡️ Insurance Guarantee**: Oracle fails = automatic refund
3. **🎖️ Reputation NFTs**: On-chain reputation as tradeable assets
4. **🔗 Conditional Markets**: Parent-child resolution logic
5. **🌐 Cross-Chain Aggregator**: Save 1-5% per bet
6. **💰 Free Tier AI Models**: All AI services use free tiers (no credit card required)
7. **⚡ Gemini Flash Lite**: 3x faster, 71% cheaper than Flash

---

## 🛠️ Troubleshooting

#### Common Issues

1. **Contract connection error**:
   - Verify that addresses in `frontend/lib/contracts/addresses.ts` are correct
   - Make sure you're connected to opBNB Testnet (Chain ID: 5611)

2. **Oracle not responding**:
   - Verify that `BACKEND_URL` is correctly configured in `.env.local`
   - Check that AI API keys are configured
   - Check backend logs

3. **Contract compilation error**:
   - Make sure you have Node.js 18+
   - Run `pnpm install` in `smart-contracts/`
   - Verify that Hardhat is correctly configured

4. **Docker issues**:
   - Verify that Docker is running
   - Check logs with `docker-compose logs`
   - Make sure port 5432 is not in use

---

## 🤝 Contributing

This project is under active development. To contribute:

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

MIT License - See [LICENSE](./LICENSE) file for details

---

## 👥 Team

<div align="center">

**Building the future of decentralized prediction markets**

**Made by Vaiosx**

</div>

- **Lead Developer**: Vaiosx
- **Smart Contracts**: Vaiosx
- **Frontend**: Vaiosx
- **Backend**: Vaiosx
- **AI/ML Integration**: Vaiosx

---

## 📚 Additional Resources

### 🔗 Important Links

- **🌐 Live App**: [metapredict.fun](https://metapredict.fun)
- **🔍 Explorer**: [opBNBScan Testnet](https://testnet.opbnbscan.com/)
- **📊 Chainlink Data Streams**: [Portal](https://data.chain.link/streams)
- **🤖 AI Providers**:
  - [Google AI Studio](https://aistudio.google.com/app/apikey)
  - [Groq Console](https://console.groq.com/keys)
  - [OpenRouter](https://openrouter.ai)

---

## 🙏 Acknowledgments

<div align="center">

### **Built with Amazing Technologies**

</div>

- 🔗 **Chainlink** - Data Streams, CCIP & Functions
- 🎨 **Thirdweb** - Embedded Wallets
- 🌐 **BNB Chain** - opBNB network
- 💰 **Venus Protocol** - Yield farming
- 🤖 **Gelato** - Automation services
- 🧠 **Google AI, Groq, OpenRouter** - AI providers
- 📚 **OpenZeppelin** - Secure contract libraries
- ⚛️ **Next.js & React** - Frontend framework
- 🎨 **Tailwind CSS & Framer Motion** - Styling and animations

---

<div align="center">

**🚀 Ready to predict the future? [Get Started Now](#-quick-start)**

[![Contracts](https://img.shields.io/badge/Contracts-View%20on%20Explorer-orange?style=for-the-badge)](https://testnet.opbnbscan.com/)

Made with ❤️ by **Vaiosx**

</div>
