# Blockchain Integration Setup

## Overview

The Grid Flexibility Market now includes blockchain integration using Hardhat. Every button click creates a real blockchain transaction that stores event data on-chain.

## Quick Start

### 1. Start Hardhat Node and Deploy Contracts

```bash
# Make sure you're in the project root
./scripts/start-hardhat.sh
```

This script will:
- ✅ Install Hardhat dependencies
- ✅ Compile smart contracts
- ✅ Start Hardhat node on `http://localhost:8545`
- ✅ Deploy EventStorage contract
- ✅ Update frontend with contract address

### 2. Install Frontend Dependencies

```bash
cd packages/frontend
npm install
```

### 3. Start Frontend

```bash
npm run dev
```

### 4. Test Blockchain Integration

1. Open `http://localhost:3000`
2. Click any button (Broadcast Auction, Place Bid, etc.)
3. Watch the "Blockchain Transactions" section for real on-chain events!

## What Happens

1. **User Action** → Button click triggers an event
2. **Event Published** → Event is published to the system
3. **Transaction Created** → Event data is prepared for blockchain
4. **Blockchain Transaction** → Data is stored on-chain using Hardhat
5. **UI Update** → Transaction appears in the UI with hash, gas info, etc.

## Architecture

```
Frontend → Controller → Hardhat Service → EventStorage Contract → Hardhat Node
```

## Files Created/Modified

### New Files:
- `packages/hardhat/contracts/EventStorage.sol` - Smart contract for storing events
- `packages/hardhat/deploy/EventStorage.ts` - Deployment script
- `packages/frontend/src/services/hardhat-service.ts` - Hardhat integration service
- `scripts/start-hardhat.sh` - Startup script
- `packages/frontend/src/docs/BLOCKCHAIN_INTEGRATION.md` - Detailed documentation

### Modified Files:
- `packages/frontend/src/controllers/grid-flexibility-controller.ts` - Added transaction creation
- `packages/frontend/src/hooks/useGridFlexibility.ts` - Added Hardhat service
- `packages/frontend/src/models/grid-flexibility-model.ts` - Added transaction state
- `packages/frontend/src/app/page.tsx` - Added transaction display UI
- `packages/frontend/package.json` - Added ethers.js dependency

## Transaction Construction Point

The transaction construction logic is clearly marked and easily swappable:

**Location**: `packages/frontend/src/controllers/grid-flexibility-controller.ts`

```typescript
/**
 * TRANSACTION CONSTRUCTION POINT
 * 
 * This method creates blockchain transactions from event data.
 * The transaction construction logic is isolated here and can be easily swapped.
 */
private async createTransactionFromEvent(event: any): Promise<void> {
  // ... transaction creation logic
}
```

## Troubleshooting

### Hardhat Node Not Running
- Error: "Hardhat node not running"
- Solution: Run `./scripts/start-hardhat.sh`

### Contract Not Deployed
- Error: "EventStorage contract not available"
- Solution: Check that deployment completed successfully

### Frontend Build Errors
- Error: "Export BlockchainService doesn't exist"
- Solution: Make sure you're using the updated files (old blockchain service was removed)

## Development

### Adding New Transaction Logic

1. **Modify Transaction Builder** in `hardhat-service.ts`
2. **Update Contract** if needed in `EventStorage.sol`
3. **Redeploy** using `./scripts/start-hardhat.sh`

### Using Different Hardhat Account

Edit `hardhat-service.ts`:
```typescript
// Change account index (0-4 available)
const privateKey = this.getHardhatPrivateKey(1); // Use account #1 instead of #0
```

## Production Considerations

For production deployment:
1. Replace Hardhat with real blockchain (Ethereum, Polygon, etc.)
2. Use real wallet connection (MetaMask, WalletConnect)
3. Implement proper error handling and retry logic
4. Add gas optimization
5. Consider transaction batching for efficiency

## Next Steps

- ✅ Basic blockchain integration complete
- ✅ Transaction construction point clearly marked
- ✅ Easy swapping architecture implemented
- 🔄 Ready for production blockchain integration
- 🔄 Ready for custom transaction logic
