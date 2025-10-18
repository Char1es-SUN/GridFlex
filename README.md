# ETHRome 2025 - Grid Flexibility Market Demo

A comprehensive demo showcasing a local grid flexibility market with FHEVM smart contracts.

## Quick Start

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

## Grid Flexibility Market Demo

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

## Development

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

## Testing

### Smart Contracts
```bash
npm run test
```

### Frontend
```bash
cd packages/frontend
npm run lint
```



**packages/frontend/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request
