// ========== Hardhat-based Blockchain Service ==========

import { ethers } from 'ethers';
import { BlockchainTransaction } from '../types/grid-flexibility';

// ========== Hardhat Configuration ==========

const HARDHAT_RPC_URL = 'http://localhost:8545';
const CHAIN_ID = 31337;

// Hardhat default accounts are available via private keys

// EventStorage contract ABI (minimal interface)
const EVENT_STORAGE_ABI = [
  "function storeEvent(string memory eventType, string memory eventId, string memory payload) external",
  "function getEventCount() external view returns (uint256)",
  "function getEvent(uint256 index) external view returns (tuple(string eventType, string eventId, uint256 timestamp, string payload, address sender, uint256 blockNumber))",
  "event EventStored(uint256 indexed index, string eventType, string eventId, address indexed sender)"
];

// ========== Hardhat Blockchain Service ==========

export class HardhatBlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null;
  private eventStorageContract: ethers.Contract | null = null;
  private eventStorageAddress: string | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
  }

  /**
   * Connect to Hardhat network and get the first account
   */
  async connectWallet(): Promise<void> {
    try {
      // Use the first Hardhat account (deployer)
      const privateKey = this.getHardhatPrivateKey(0);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      console.log('🔗 Connected to Hardhat network');
      console.log('📍 Wallet address:', this.wallet.address);
      
      // Get the EventStorage contract address from deployment
      await this.setupEventStorageContract();
    } catch (error) {
      console.error('❌ Failed to connect to Hardhat:', error);
      throw new Error('Failed to connect to Hardhat network. Make sure Hardhat node is running.');
    }
  }

  /**
   * Get wallet information
   */
  async getWalletInfo(): Promise<{ address: string; balance: string; chainId: number } | null> {
    if (!this.wallet) {
      await this.connectWallet();
    }

    if (!this.wallet) return null;

    const balance = await this.provider.getBalance(this.wallet.address);
    const network = await this.provider.getNetwork();

    return {
      address: this.wallet.address,
      balance: ethers.formatEther(balance),
      chainId: Number(network.chainId)
    };
  }

  /**
   * Store an event on-chain using the EventStorage contract
   */
  async storeEvent(
    eventType: string,
    eventId: string,
    payload: string
  ): Promise<BlockchainTransaction> {
    if (!this.wallet) {
      await this.connectWallet();
    }

    if (!this.eventStorageContract) {
      throw new Error('EventStorage contract not available');
    }

    try {
      console.log('📝 Storing event on-chain:', eventType, eventId);
      
      // Estimate gas
      const gasEstimate = await this.eventStorageContract.storeEvent.estimateGas(
        eventType,
        eventId,
        payload
      );

      // Send transaction
      const tx = await this.eventStorageContract.storeEvent(
        eventType,
        eventId,
        payload,
        {
          gasLimit: gasEstimate + BigInt(10000), // Add some buffer
        }
      );

      console.log('🚀 Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction failed');
      }

      const transaction: BlockchainTransaction = {
        hash: tx.hash,
        from: this.wallet!.address,
        to: this.eventStorageAddress!,
        value: '0',
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString() || '0',
        data: tx.data,
        timestamp: Date.now(),
        blockNumber: receipt.blockNumber,
        status: 'confirmed'
      };

      console.log('✅ Transaction confirmed:', tx.hash);
      return transaction;

    } catch (error) {
      console.error('❌ Failed to store event:', error);
      throw error;
    }
  }

  /**
   * Get the EventStorage contract address from deployment
   */
  private async setupEventStorageContract(): Promise<void> {
    try {
      // Get the contract address from Hardhat's deployment system
      this.eventStorageAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // EventStorage contract address
      
      if (this.wallet && this.eventStorageAddress) {
        this.eventStorageContract = new ethers.Contract(
          this.eventStorageAddress,
          EVENT_STORAGE_ABI,
          this.wallet
        );
        console.log('📄 EventStorage contract connected:', this.eventStorageAddress);
      }
    } catch (error) {
      console.warn('⚠️ Could not connect to EventStorage contract:', error);
    }
  }

  /**
   * Get Hardhat private key for account index
   */
  private getHardhatPrivateKey(accountIndex: number): string {
    // These are the well-known Hardhat private keys
    const privateKeys = [
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
      '0x5de4111daa5ba4e0a4da4a480485a311069d29d4e7852e2724db0bd17c3c0cd6',
      '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6d',
      '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f4cbd98424e51'
    ];

    if (accountIndex >= privateKeys.length) {
      throw new Error(`Account index ${accountIndex} not available`);
    }

    return privateKeys[accountIndex];
  }

  /**
   * Check if Hardhat node is running
   */
  async isHardhatRunning(): Promise<boolean> {
    try {
      const network = await this.provider.getNetwork();
      return Number(network.chainId) === CHAIN_ID;
    } catch {
      return false;
    }
  }

  /**
   * Get contract address (for debugging)
   */
  getContractAddress(): string | null {
    return this.eventStorageAddress;
  }
}

// ========== Transaction Construction ==========

export interface TransactionConstructionContext {
  eventType: string;
  eventPayload: unknown;
  timestamp: string;
  eventId: string;
}

/**
 * TRANSACTION CONSTRUCTION POINT
 * 
 * This is where blockchain transaction construction takes place.
 * The buildTransaction method creates a transaction request from event data.
 * 
 * To swap with different business logic:
 * 1. Create a new class implementing TransactionBuilder
 * 2. Replace the transactionBuilder in GridFlexibilityController
 * 3. Update the buildTransaction method with your specific logic
 * 
 * The event payload contains all necessary data for transaction construction.
 */
export class HardhatTransactionBuilder {
  buildTransaction(context: TransactionConstructionContext): {
    eventType: string;
    eventId: string;
    payload: string;
  } {
    console.log('🔨 Building Hardhat transaction for event:', context.eventType);
    
    // Create transaction data from event payload
    const eventData = {
      eventType: context.eventType,
      eventId: context.eventId,
      timestamp: context.timestamp,
      payload: context.eventPayload
    };

    // Serialize event data as JSON string for contract storage
    const payload = JSON.stringify(eventData);

    return {
      eventType: context.eventType,
      eventId: context.eventId,
      payload
    };
  }
}
