# ETHRome 2025 - Grid Flexibility Market Demo

A comprehensive demo showcasing a local grid flexibility market with FHEVM smart contracts and a Next.js frontend interface.

## 🏗️ Project Structure

This is a monorepo containing two main packages:

```
ethrome2025/
├── packages/
│   ├── hardhat/          # FHEVM Smart Contracts
│   │   ├── contracts/    # Solidity contracts
│   │   ├── deploy/       # Deployment scripts
│   │   ├── tasks/        # Hardhat tasks
│   │   ├── test/         # Contract tests
│   │   └── ...
│   └── frontend/         # Next.js Frontend Demo
│       ├── src/
│       │   └── app/      # Next.js app directory
│       └── ...
└── package.json          # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- npm >= 7.0.0

### Installation
```bash
# Install all dependencies
npm run install:all
```

### Running the Demo

In separate terminals:

Start local chain
```bash
npm run chain
```

Deploy contracts
```bash
npm run deploy
```

Start the frontend demo
```bash
npm run dev
```

## 📦 Packages

### @ethrome2025/hardhat
FHEVM-based smart contracts for grid flexibility market operations.

**Key Features:**
- FHEVM integration for privacy-preserving computations
- Comprehensive testing suite
- Deployment scripts for local and testnet

**Available Scripts:**
```bash
npm run hardhat:compile    # Compile contracts
npm run hardhat:test       # Run tests
npm run hardhat:chain      # Start local blockchain
npm run hardhat:deploy:localhost  # Deploy to localhost
npm run hardhat:deploy:sepolia    # Deploy to Sepolia testnet
```

### @ethrome2025/frontend
Next.js frontend demo showcasing the grid flexibility market interface.

**Key Features:**
- Grid operator interface
- Participant interface
- Real-time system status
- Interactive auction simulation
- Responsive design with Tailwind CSS

**Available Scripts:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
```

## 🎯 Grid Flexibility Market Demo

The frontend demo simulates a local grid flexibility market with:

### Grid Operator Interface
- **Redispatch Event Display**: Shows upcoming events with time, power, and cost
- **Auction Management**: Broadcast and trigger auctions
- **Results Visualization**: View accepted bids and remaining requirements

### Participant Interface
- **Auction View**: See active auctions from grid operators
- **Bid Submission**: Enter power and price for flexibility services
- **Status Notifications**: Real-time feedback on bid acceptance

### System Monitoring
- **Real-time Updates**: Track all system changes
- **Process Flow**: Step-by-step auction lifecycle
- **Status Dashboard**: Current system state overview

## 🛠️ Development

### Workspace Commands
```bash
# Frontend development
npm run dev

# Hardhat development
npm run hardhat:compile
npm run hardhat:test
npm run hardhat:chain

# Linting and formatting
npm run lint
npm run typecheck

# Clean all build artifacts
npm run clean
```

### Individual Package Development
```bash
# Work on hardhat package
cd packages/hardhat
npm run compile
npm run test

# Work on frontend package
cd packages/frontend
npm run dev
npm run build
```

## 🧪 Testing

### Smart Contracts
```bash
npm run hardhat:test
```

### Frontend
```bash
cd packages/frontend
npm run lint
```

## 📚 Documentation

- [Frontend Demo Guide](./packages/frontend/README.md)
- [Smart Contracts Documentation](./packages/hardhat/README.md)

## 🔧 Configuration

### Environment Variables
Create `.env` files in the respective package directories:

**packages/hardhat/.env:**
```env
SEPOLIA_RPC_URL=your_sepolia_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**packages/frontend/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request
