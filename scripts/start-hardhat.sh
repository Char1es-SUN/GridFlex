#!/bin/bash

# Start Hardhat node and deploy contracts
echo "🚀 Starting Hardhat node and deploying contracts..."

# Navigate to hardhat package
cd packages/hardhat

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Hardhat dependencies..."
    npm install
fi

# Compile contracts
echo "🔨 Compiling contracts..."
npm run compile

# Start Hardhat node in background
echo "🌐 Starting Hardhat node..."
npm run chain &
HARDHAT_PID=$!

# Wait for Hardhat to start
echo "⏳ Waiting for Hardhat node to start..."
sleep 5

# Deploy contracts
echo "📄 Deploying EventStorage contract..."
npm run deploy:localhost

# Get the contract address and update the frontend service
echo "🔧 Updating frontend with contract address..."
CONTRACT_ADDRESS=$(grep -o '"address":"[^"]*"' deployments/localhost/EventStorage.json | cut -d'"' -f4)
echo "Contract deployed at: $CONTRACT_ADDRESS"

# Update the hardhat service with the actual contract address
if [ ! -z "$CONTRACT_ADDRESS" ]; then
    sed -i "s/0x5FbDB2315678afecb367f032d93F642f64180aa3/$CONTRACT_ADDRESS/g" ../frontend/src/services/hardhat-service.ts
    echo "✅ Updated frontend service with contract address: $CONTRACT_ADDRESS"
fi

echo "🎉 Hardhat setup complete!"
echo "📝 Hardhat node PID: $HARDHAT_PID"
echo "🌐 RPC URL: http://localhost:8545"
echo "📄 Contract Address: $CONTRACT_ADDRESS"
echo ""
echo "To stop Hardhat node, run: kill $HARDHAT_PID"
echo "To start frontend, run: cd packages/frontend && npm run dev"
