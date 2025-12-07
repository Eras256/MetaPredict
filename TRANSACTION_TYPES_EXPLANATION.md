# 📋 Complete Transaction Types Explanation

## Overview

When creating markets using the complete MetaPredict.fun stack, the following on-chain transactions should be generated and tracked with links:

## Transaction Types Per Market

### 1. **Market Creation** ✅
- **Type**: `Market Creation`
- **Contract**: `PredictionMarketCore`
- **Function**: `createBinaryMarket()` or `createSubjectiveMarket()`
- **Count**: 1 per market
- **Description**: Creates a new prediction market on-chain
- **Link Format**: `https://testnet.opbnbscan.com/tx/{txHash}`

### 2. **Bet Placements** ✅
- **Type**: `Bet Placement`
- **Contract**: `PredictionMarketCore`
- **Function**: `placeBet(marketId, isYes)`
- **Count**: 2 per market (YES + NO bets)
- **Description**: Places YES and NO bets on each market
- **Link Format**: `https://testnet.opbnbscan.com/tx/{txHash}`
- **Note**: Each bet automatically triggers:
  - Insurance premium deposit (internal call to `InsurancePool.receiveInsurancePremium`)
  - Fee collection (internal call)

### 3. **Insurance Pool Deposits** ✅
- **Type**: `Insurance Pool Deposit`
- **Contract**: `InsurancePool`
- **Function**: `deposit(receiver)`
- **Count**: 1 per test run (can be multiple)
- **Description**: Direct deposit to insurance pool for yield farming
- **Link Format**: `https://testnet.opbnbscan.com/tx/{txHash}`
- **Note**: This is separate from automatic insurance premiums collected from bets

### 4. **Reputation Staking** ✅
- **Type**: `Reputation Staking`
- **Contract**: `PredictionMarketCore` → `ReputationStaking`
- **Function**: `stakeReputation()` (via Core)
- **Count**: 1 per user (can be multiple)
- **Description**: Stake BNB to earn reputation and participate in disputes
- **Link Format**: `https://testnet.opbnbscan.com/tx/{txHash}`
- **Note**: Required to vote in DAO governance

### 5. **DAO Proposal Creation** ✅
- **Type**: `DAO Proposal Creation`
- **Contract**: `PredictionMarketCore` → `DAOGovernance`
- **Function**: `initiateResolution(marketId)` (for subjective markets)
- **Count**: 1 per subjective market
- **Description**: Creates a DAO proposal to resolve subjective markets
- **Link Format**: `https://testnet.opbnbscan.com/tx/{txHash}`
- **Note**: Only for subjective markets (not binary markets)

### 6. **DAO Votes** ✅
- **Type**: `DAO Vote`
- **Contract**: `DAOGovernance`
- **Function**: `castVote(proposalId, support, expertiseDomain)`
- **Count**: Multiple per proposal (one per voter)
- **Description**: Vote on DAO proposals for market resolution
- **Link Format**: `https://testnet.opbnbscan.com/tx/{txHash}`
- **Note**: Requires reputation staking

### 7. **Chainlink Data Streams Configuration** ✅
- **Type**: `Data Streams Configuration`
- **Contract**: `ChainlinkDataStreamsIntegration`
- **Function**: `configureMarketStream(marketId, streamId, targetPrice)`
- **Count**: 1 per market (if owner)
- **Description**: Configures Chainlink Data Streams for price verification
- **Link Format**: `https://testnet.opbnbscan.com/tx/{txHash}`
- **Note**: Requires contract owner permissions

## Expected Transaction Count Per Market

### For Binary Markets (using Chainlink Data Streams):

1. **Market Creation**: 1 transaction
2. **YES Bet**: 1 transaction
3. **NO Bet**: 1 transaction
4. **Chainlink Configuration**: 1 transaction (if owner)
5. **Insurance Premium** (automatic): Internal call (no separate TX)
6. **Fee Collection** (automatic): Internal call (no separate TX)

**Total per Binary Market**: ~4 transactions (3 if not owner)

### For Subjective Markets (using DAO Governance):

1. **Market Creation**: 1 transaction
2. **YES Bet**: 1 transaction
3. **NO Bet**: 1 transaction
4. **DAO Proposal Creation**: 1 transaction (via `initiateResolution`)
5. **DAO Votes**: N transactions (one per voter)

**Total per Subjective Market**: 4+ transactions (depending on voters)

## Additional Transactions (Per Test Run)

### Insurance Pool:
- **Direct Deposit**: 1+ transactions (optional, for yield farming)

### Reputation System:
- **Staking**: 1+ transactions (required for DAO voting)

## Complete Stack Integration

When using the complete stack with all integrations:

### Stack Components:
1. ✅ **opBNB** - Layer 2 network (all transactions)
2. ✅ **Chainlink Data Streams** - Price verification (configuration TX)
3. ✅ **Chainlink CCIP** - Cross-chain (if used)
4. ✅ **Gemini AI** - Oracle resolution (backend call, no on-chain TX)
5. ✅ **Llama AI** - Oracle resolution (backend call, no on-chain TX)
6. ✅ **Mistral AI** - Oracle resolution (backend call, no on-chain TX)
7. ✅ **Gelato Automation** - Relay transactions (if used)
8. ✅ **Venus Protocol** - Yield farming (via Insurance Pool)
9. ✅ **Thirdweb** - Gasless wallets (if used)
10. ✅ **Next.js** - Frontend (no on-chain TX)
11. ✅ **Hardhat** - Development framework (no on-chain TX)

### Transaction Flow Example:

```
1. Create Market (Core Contract)
   ↓
2. Place YES Bet (Core Contract)
   ├─→ Insurance Premium (automatic, internal)
   └─→ Fee Collection (automatic, internal)
   ↓
3. Place NO Bet (Core Contract)
   ├─→ Insurance Premium (automatic, internal)
   └─→ Fee Collection (automatic, internal)
   ↓
4. Configure Chainlink Data Streams (if owner)
   ↓
5. Deposit to Insurance Pool (optional)
   ↓
6. Stake Reputation (for DAO participation)
   ↓
7. Create DAO Proposal (for subjective markets)
   ↓
8. Vote on DAO Proposal (multiple voters)
```

## Summary

**For 6 Binary Markets:**
- Market Creations: 6 transactions
- Bet Placements: 12 transactions (6 markets × 2 bets)
- Chainlink Configurations: 0-6 transactions (depends on owner)
- Insurance Deposits: 0+ transactions (optional)
- Reputation Staking: 0+ transactions (optional)
- **Total Expected**: 18-30+ transactions

**For 1 Subjective Market:**
- Market Creation: 1 transaction
- Bet Placements: 2 transactions
- DAO Proposal: 1 transaction
- DAO Votes: N transactions (depends on voters)
- **Total Expected**: 4+ transactions

## Notes

- **Automatic Transactions**: Insurance premiums and fees are collected automatically during bet placement (internal calls, no separate TX)
- **Owner Requirements**: Chainlink Data Streams configuration requires contract owner permissions
- **Balance Requirements**: All transactions require BNB for gas fees
- **Backend Calls**: AI Oracle resolution happens off-chain via backend API (no on-chain TX until `fulfillResolutionManual`)

## Current Script Status

The script `create-6-markets-chainlink-real.ts` now captures ALL transaction types:
- ✅ Market Creations
- ✅ Bet Placements (YES + NO)
- ✅ Insurance Pool Deposits
- ✅ Reputation Staking
- ✅ DAO Proposal Creation
- ✅ DAO Votes
- ✅ Chainlink Data Streams Configuration

All transaction links are collected and displayed in the summary output.

