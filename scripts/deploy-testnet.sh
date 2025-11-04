#!/bin/bash

echo "🚀 Deploying TruthChain to opBNB Testnet..."

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "❌ .env file not found. Please create one from .env.example"
    exit 1
fi

# Compile contracts
echo "📝 Compiling contracts..."
cd smart-contracts
npx hardhat compile

# Deploy contracts
echo "🔨 Deploying contracts..."
npx hardhat run scripts/deploy.ts --network opBNBTestnet

# Extract deployed addresses (if deploy script outputs them)
echo "📋 Contract addresses:"
echo "Check the deployment output above for contract addresses"

echo "✅ Deployment complete!"
echo "🎉 Update your .env file with the deployed contract addresses"

