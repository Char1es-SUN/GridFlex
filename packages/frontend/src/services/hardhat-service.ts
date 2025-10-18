// ========== Hardhat-based Blockchain Service ==========

import { ethers } from 'ethers';
import { BlockchainTransaction } from '../types/grid-flexibility';

// ========== Hardhat Configuration ==========

const HARDHAT_RPC_URL = 'http://localhost:8545';
const CHAIN_ID = 31337;

// Hardhat default accounts are available via private keys

// DataCollector contract ABI
const DATA_COLLECTOR_ABI = [
  "function startCollection() external",
  "function submitData(uint32 price, uint32 quantity) external",
  "function endCollection() external",
  "function getCollectedData() external view returns (uint32[] memory, uint32[] memory)",
  "function getBroadcastData() external view returns (string[] memory)",
  "function collecting() external view returns (bool)",
  "function owner() external view returns (address)"
];

// ========== Hardhat Blockchain Service ==========

export class HardhatBlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null;
  private dataCollectorContract: ethers.Contract | null = null;
  private dataCollectorAddress: string | null = null;
  private participantWallets: Map<string, ethers.Wallet> = new Map();

  constructor() {
    this.provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
    this.setupDataCollectorContract();
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
      
      // Get the DataCollector contract address from deployment
      await this.setupDataCollectorContract();
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
   * Start data collection on DataCollector contract
   */
  async startCollection(): Promise<BlockchainTransaction> {
    if (!this.wallet) {
      await this.connectWallet();
    }

    if (!this.dataCollectorContract) {
      throw new Error('DataCollector contract not available');
    }

    try {
      console.log('📝 Starting data collection on-chain');
      
      // Estimate gas
      const gasEstimate = await this.dataCollectorContract.startCollection.estimateGas();

      // Send transaction
      const tx = await this.dataCollectorContract.startCollection({
        gasLimit: gasEstimate + BigInt(10000), // Add some buffer
      });

      console.log('🚀 Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction failed');
      }

      const transaction: BlockchainTransaction = {
        hash: tx.hash,
        from: this.wallet!.address,
        to: this.dataCollectorAddress!,
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
      console.error('❌ Failed to start collection:', error);
      throw error;
    }
  }

  /**
   * Submit data to DataCollector contract
   */
  async submitData(price: number, quantity: number, participantId: string): Promise<BlockchainTransaction> {
    if (!this.dataCollectorContract) {
      throw new Error('DataCollector contract not available');
    }

    try {
      // Get wallet for this participant
      const participantWallet = this.getParticipantWallet(participantId);
      
      // Create contract instance for this participant
      const participantContract = new ethers.Contract(
        this.dataCollectorAddress!,
        DATA_COLLECTOR_ABI,
        participantWallet
      );

      console.log('📝 Submitting data on-chain:', price, quantity, 'from participant:', participantId);
      
      // Estimate gas
      const gasEstimate = await participantContract.submitData.estimateGas(price, quantity);

      // Send transaction
      const tx = await participantContract.submitData(price, quantity, {
        gasLimit: gasEstimate + BigInt(10000), // Add some buffer
      });

      console.log('🚀 Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction failed');
      }

      const transaction: BlockchainTransaction = {
        hash: tx.hash,
        from: participantWallet.address,
        to: this.dataCollectorAddress!,
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
      console.error('❌ Failed to submit data:', error);
      throw error;
    }
  }

  /**
   * End data collection on DataCollector contract
   */
  async endCollection(): Promise<BlockchainTransaction> {
    if (!this.wallet) {
      await this.connectWallet();
    }

    if (!this.dataCollectorContract) {
      throw new Error('DataCollector contract not available');
    }

    try {
      console.log('📝 Ending data collection on-chain');
      
      // Estimate gas
      const gasEstimate = await this.dataCollectorContract.endCollection.estimateGas();

      // Send transaction
      const tx = await this.dataCollectorContract.endCollection({
        gasLimit: gasEstimate + BigInt(10000), // Add some buffer
      });

      console.log('🚀 Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction failed');
      }

      const transaction: BlockchainTransaction = {
        hash: tx.hash,
        from: this.wallet!.address,
        to: this.dataCollectorAddress!,
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
      console.error('❌ Failed to end collection:', error);
      throw error;
    }
  }

  /**
   * Get collected data from DataCollector contract
   */
  async getCollectedData(): Promise<{ prices: number[], quantities: number[] }> {
    if (!this.wallet) {
      await this.connectWallet();
    }

    if (!this.dataCollectorContract) {
      throw new Error('DataCollector contract not available');
    }

    try {
      console.log('📝 Getting collected data from contract');
      
      const [prices, quantities] = await this.dataCollectorContract.getCollectedData();
      
      return {
        prices: prices.map((p: bigint) => Number(p)),
        quantities: quantities.map((q: bigint) => Number(q))
      };

    } catch (error) {
      console.error('❌ Failed to get collected data:', error);
      throw error;
    }
  }

  /**
   * Get the DataCollector contract address from deployment
   */
  private async setupDataCollectorContract(): Promise<void> {
    try {
      // Get the contract address from Hardhat's deployment system
      this.dataCollectorAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'; // DataCollector contract address
      
      if (this.wallet && this.dataCollectorAddress) {
        this.dataCollectorContract = new ethers.Contract(
          this.dataCollectorAddress,
          DATA_COLLECTOR_ABI,
          this.wallet
        );
        console.log('📄 DataCollector contract connected:', this.dataCollectorAddress);
      }
    } catch (error) {
      console.warn('⚠️ Could not connect to DataCollector contract:', error);
    }
  }

  /**
   * Get Hardhat private key for account index
   */
  private getHardhatPrivateKey(accountIndex: number): string {
    // Hardhat standard accounts (each has 10,000 ETH)
    const privateKeys = [
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // Account #0: Grid Operator
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', // Account #1: Participant 1
      '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a', // Account #2: Participant 2
      '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',  // Account #3: Participant 3
      '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a'  // Account #4: Participant 4
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
   * Get or create a wallet for a specific participant
   * Account mapping:
   * - Account 0: Grid Operator (contract owner)
   * - Account 1: Participant 1
   * - Account 2: Participant 2  
   * - Account 3: Participant 3
   * - Account 4: Participant 4
   */
  private getParticipantWallet(participantId: string): ethers.Wallet {
    if (!this.participantWallets.has(participantId)) {
      // Map participant IDs to account indices
      const participantAccountMap: { [key: string]: number } = {
        'participant-1': 1,
        'participant-2': 2,
        'participant-3': 3,
        'participant-4': 4
      };
      
      const accountIndex = participantAccountMap[participantId];
      if (accountIndex === undefined) {
        throw new Error(`Unknown participant ID: ${participantId}`);
      }
      
      const privateKey = this.getHardhatPrivateKey(accountIndex);
      const wallet = new ethers.Wallet(privateKey, this.provider);
      
      this.participantWallets.set(participantId, wallet);
      console.log(`Created wallet for ${participantId} using account ${accountIndex}:`, wallet.address);
    }
    return this.participantWallets.get(participantId)!;
  }

  /**
   * Get contract address (for debugging)
   */
  getContractAddress(): string | null {
    return this.dataCollectorAddress;
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
