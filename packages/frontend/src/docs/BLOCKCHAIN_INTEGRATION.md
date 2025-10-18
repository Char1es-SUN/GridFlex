# Hardhat Blockchain Integration Documentation

## Overview

This document explains how blockchain transactions are integrated into the Grid Flexibility Market application using Hardhat and how to easily swap transaction construction logic.

## Architecture

The blockchain integration follows the Model-Controller architecture pattern:

```
Event → Controller → Transaction Builder → Hardhat Service → EventStorage Contract → Model → UI
```

## Prerequisites

1. **Hardhat Node Running**: Start the local Hardhat node
2. **EventStorage Contract Deployed**: Contract must be deployed to store events
3. **Ethers.js**: Frontend uses ethers.js to interact with the blockchain

## Quick Start

### 1. Start Hardhat Node and Deploy Contracts

```bash
# Run the startup script
./scripts/start-hardhat.sh
```

This will:
- Start Hardhat node on `http://localhost:8545`
- Compile and deploy the EventStorage contract
- Update the frontend service with the contract address

### 2. Start Frontend

```bash
cd packages/frontend
npm install  # Install ethers.js dependency
npm run dev
```

### 3. Test Blockchain Integration

1. Open the frontend at `http://localhost:3000`
2. Click any button (Broadcast Auction, Place Bid, etc.)
3. Check the "Blockchain Transactions" section for on-chain events

## Key Components

### 1. EventStorage Contract

**Location**: `packages/hardhat/contracts/EventStorage.sol`

A simple smart contract that stores events on-chain:

```solidity
contract EventStorage {
    function storeEvent(
        string memory eventType,
        string memory eventId,
        string memory payload
    ) external;
}
```

### 2. Transaction Construction Point

**Location**: `packages/frontend/src/controllers/grid-flexibility-controller.ts`

The transaction construction happens in the `createTransactionFromEvent` method:

```typescript
/**
 * TRANSACTION CONSTRUCTION POINT
 * 
 * This method creates blockchain transactions from event data.
 * The transaction construction logic is isolated here and can be easily swapped.
 * 
 * To change transaction construction:
 * 1. Replace the transactionBuilder in the constructor
 * 2. Or modify the buildTransaction call below
 * 3. The event payload contains all necessary data
 */
private async createTransactionFromEvent(event: any): Promise<void> {
  // Check if Hardhat is running
  const isRunning = await this.blockchainService.isHardhatRunning();
  if (!isRunning) {
    console.warn('⚠️ Hardhat node is not running. Skipping transaction creation.');
    return;
  }

  // Build transaction from event data
  const context: TransactionConstructionContext = {
    eventType: event.eventType,
    eventPayload: event.payload,
    timestamp: event.timestamp,
    eventId: event.eventId
  };

  const transactionData = this.transactionBuilder.buildTransaction(context);
  
  // Store event on-chain
  const transaction = await this.blockchainService.storeEvent(
    transactionData.eventType,
    transactionData.eventId,
    transactionData.payload
  );
}
```

### 3. Hardhat Service

**Location**: `packages/frontend/src/services/hardhat-service.ts`

Handles interaction with the local Hardhat node:

- **Wallet Management**: Uses first Hardhat account (deployer)
- **Contract Interaction**: Calls EventStorage contract methods
- **Transaction Handling**: Sends and tracks transactions

### 4. Transaction Builder

**Location**: `packages/frontend/src/services/hardhat-service.ts`

Current implementation: `HardhatTransactionBuilder`

- Serializes event data as JSON string
- Stores in EventStorage contract
- Uses Hardhat's first account for transactions

## How to Swap Transaction Construction Logic

### Method 1: Replace Transaction Builder

In `packages/frontend/src/controllers/grid-flexibility-controller.ts`:

```typescript
// Current implementation
this.transactionBuilder = new GridFlexibilityTransactionBuilder();

// Replace with different builder
this.transactionBuilder = new SimpleHashTransactionBuilder();
// or
this.transactionBuilder = new EncryptedTransactionBuilder();
```

### Method 2: Create Custom Transaction Builder

1. Create a new class implementing `TransactionBuilder`:

```typescript
export class CustomTransactionBuilder implements TransactionBuilder {
  private readonly CONTRACT_ADDRESS = '0xYourContractAddress';

  buildTransaction(context: TransactionConstructionContext): TransactionRequest {
    // Your custom logic here
    const customData = this.processEventData(context.eventPayload);
    
    return {
      to: this.CONTRACT_ADDRESS,
      data: `0x${customData}`,
      gasLimit: '200000'
    };
  }

  private processEventData(payload: any): string {
    // Your custom data processing logic
    return Buffer.from(JSON.stringify(payload)).toString('hex');
  }
}
```

2. Replace the builder in the controller:

```typescript
this.transactionBuilder = new CustomTransactionBuilder();
```

### Method 3: Modify Transaction Construction Directly

You can also modify the `createTransactionFromEvent` method directly:

```typescript
private async createTransactionFromEvent(event: any): Promise<void> {
  // ... wallet connection logic ...
  
  // Custom transaction construction logic
  const customTransactionRequest = {
    to: '0xYourCustomContract',
    data: `0x${this.customDataProcessor(event.payload)}`,
    gasLimit: '300000',
    gasPrice: '25000000000'
  };
  
  const transaction = await this.blockchainService.signAndSendTransaction(customTransactionRequest);
  // ... rest of the method ...
}
```

## Event Data Structure

Each event contains the following data for transaction construction:

```typescript
interface TransactionConstructionContext {
  eventType: string;        // e.g., 'auction.broadcasted', 'bid.submitted'
  eventPayload: any;        // The actual event data
  timestamp: string;        // ISO timestamp
  eventId: string;          // Unique event identifier
}
```

### Example Event Payloads

#### Auction Broadcasted Event
```json
{
  "eventType": "auction.broadcasted",
  "eventPayload": {
    "auction": {
      "id": "auction-1",
      "redispatchEventId": "redispatch-1",
      "powerMW": 100,
      "costPerMW": 50
    }
  },
  "timestamp": "2024-01-15T14:30:00.000Z",
  "eventId": "evt_1234567890"
}
```

#### Bid Submitted Event
```json
{
  "eventType": "bid.submitted",
  "eventPayload": {
    "bid": {
      "auctionId": "auction-1",
      "participantId": "participant-1",
      "powerMW": 50,
      "pricePerMW": 40
    }
  },
  "timestamp": "2024-01-15T14:35:00.000Z",
  "eventId": "evt_1234567891"
}
```

## Blockchain Service Interface

The `BlockchainService` interface provides:

```typescript
interface BlockchainService {
  connectWallet(): Promise<WalletInfo>;
  getWalletInfo(): Promise<WalletInfo | null>;
  signAndSendTransaction(request: TransactionRequest): Promise<BlockchainTransaction>;
  getTransaction(hash: string): Promise<BlockchainTransaction | null>;
  onTransactionConfirmed(callback: (tx: BlockchainTransaction) => void): void;
  onTransactionFailed(callback: (tx: BlockchainTransaction) => void): void;
}
```

## Transaction Lifecycle

1. **Event Published**: When a user action triggers an event
2. **Transaction Construction**: Event data is processed by the transaction builder
3. **Transaction Creation**: Transaction request is created with wallet connection
4. **Transaction Signing**: Transaction is signed and sent to blockchain
5. **Transaction Tracking**: Transaction status is tracked and updated in the UI
6. **Confirmation**: Transaction confirmation updates the UI

## UI Integration

Transactions are displayed in the "Blockchain Transactions" section showing:

- Transaction hash
- From/To addresses
- Gas usage and price
- Block number (when confirmed)
- Transaction data
- Status (pending/confirmed/failed)

## Testing

The current implementation uses `MockBlockchainService` which:

- Simulates wallet connection
- Creates mock transaction hashes
- Simulates transaction confirmation after 2 seconds
- Provides realistic blockchain transaction data

## Production Considerations

For production deployment:

1. Replace `MockBlockchainService` with real blockchain integration (e.g., Web3, ethers.js)
2. Implement proper error handling for network issues
3. Add transaction retry logic
4. Implement gas price optimization
5. Add transaction monitoring and alerting
6. Consider using transaction batching for efficiency

## Security Considerations

- Validate all event data before creating transactions
- Implement proper input sanitization
- Use secure random number generation for transaction hashes
- Implement proper key management for wallet operations
- Add transaction validation before broadcasting

## Performance Considerations

- Consider batching multiple events into single transactions
- Implement transaction queuing for high-frequency events
- Add transaction caching for frequently accessed data
- Monitor gas costs and optimize transaction size
- Implement transaction prioritization based on event importance
