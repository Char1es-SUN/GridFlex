import { GridFlexibilityService } from '../services/grid-flexibility-service';
import { GridFlexibilityModel } from '../models/grid-flexibility-model';
import { HardhatBlockchainService, HardhatTransactionBuilder, TransactionConstructionContext } from '../services/hardhat-service';
import { GridFlexibilityEvent } from '../types/grid-flexibility';

// ========== Controller Class ==========

export class GridFlexibilityController {
  private service: GridFlexibilityService;
  private model: GridFlexibilityModel;
  private blockchainService: HardhatBlockchainService;
  private transactionBuilder: HardhatTransactionBuilder;
  private isSubscribed: boolean = false;

  constructor(service: GridFlexibilityService, model: GridFlexibilityModel, blockchainService: HardhatBlockchainService) {
    this.service = service;
    this.model = model;
    this.blockchainService = blockchainService;
    this.transactionBuilder = new HardhatTransactionBuilder();
    this.setupEventSubscription();
  }

  // ========== Event Subscription ==========

  private setupEventSubscription(): void {
    if (this.isSubscribed) {
      console.log('Already subscribed to events, skipping duplicate subscription');
      return;
    }

    console.log('Setting up event subscription');
    
    // Set up direct event published callback for UI display and blockchain transactions
    this.service.setEventPublishedCallback(async (event: GridFlexibilityEvent) => {
      console.log('Event published, adding to UI:', event);
      this.model.dispatch({ type: 'ADD_EVENT', payload: event });
      
      // Create blockchain transaction for this event
      await this.createTransactionFromEvent(event);
    });
    
    // Subscribe to events for business logic (if needed)
    this.service.subscribeToEvents((event) => {
      console.log('Event received in controller for business logic:', event);
      // Only handle business logic here, not UI updates
    });
    
    this.isSubscribed = true;

    // Test event will be created in the hook after hydration
  }

  // ========== Blockchain Integration ==========

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
  private async createTransactionFromEvent(event: GridFlexibilityEvent): Promise<void> {
    try {

      // Check if Hardhat is running
      const isRunning = await this.blockchainService.isHardhatRunning();
      if (!isRunning) {
        console.warn('⚠️ Hardhat node is not running. Skipping transaction creation.');
        this.model.dispatch({ 
          type: 'SET_NOTIFICATION', 
          payload: 'Hardhat node not running. Start with: npm run chain' 
        });
        return;
      }

      // Ensure wallet is connected
      const walletInfo = await this.blockchainService.getWalletInfo();
      if (!walletInfo) {
        await this.blockchainService.connectWallet();
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
      
      // Add transaction to model
      this.model.dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      
      console.log('🚀 Transaction sent:', transaction.hash);
    } catch (error) {
      console.error('❌ Failed to create transaction:', error);
      this.model.dispatch({ 
        type: 'SET_NOTIFICATION', 
        payload: `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  }

  // ========== Business Logic Methods ==========

  async broadcastAuction(): Promise<void> {
    try {
      const redispatchEvent = this.model.getState().redispatchEvent;
      const response = await this.service.broadcastAuction(redispatchEvent.id);
      
      if (response.success && response.data) {
        this.model.dispatch({ type: 'SET_AUCTION', payload: response.data });
        this.model.dispatch({ type: 'SET_AUCTION_RESULT', payload: null });
        this.model.dispatch({ type: 'SET_BID_PLACED', payload: false });
        this.model.dispatch({ type: 'SET_NOTIFICATION', payload: '' });
        
        // Update bid with auction ID
        const currentBid = this.model.getState().bid;
        this.model.dispatch({ 
          type: 'SET_BID', 
          payload: { ...currentBid, auctionId: response.data.id } 
        });
      }
    } catch (error) {
      console.error('Broadcast auction error:', error);
      this.model.dispatch({ type: 'SET_NOTIFICATION', payload: 'Failed to broadcast auction' });
    }
  }

  async placeBid(): Promise<void> {
    const state = this.model.getState();
    if (!state.auction || state.bid.powerMW <= 0 || state.bid.priceEUR <= 0) return;

    try {
      const bidData = {
        ...state.bid,
        auctionId: state.auction.id
      };
      
      const response = await this.service.submitBid(bidData);
      if (response.success) {
        this.model.dispatch({ type: 'SET_BID_PLACED', payload: true });
        this.model.dispatch({ type: 'SET_NOTIFICATION', payload: 'Bid placed successfully!' });
      }
    } catch (error) {
      console.error('Place bid error:', error);
      this.model.dispatch({ type: 'SET_NOTIFICATION', payload: 'Failed to submit bid' });
    }
  }

  async triggerAuction(): Promise<void> {
    const state = this.model.getState();
    if (!state.auction || !state.bidPlaced) return;

    try {
      // For demo purposes, we'll use a mock bid ID
      const mockBidId = 'bid-' + Date.now();
      
      const response = await this.service.triggerAuction(state.auction.id, mockBidId);
      if (response.success && response.data) {
        const result = response.data;
        this.model.dispatch({ type: 'SET_AUCTION_RESULT', payload: result });
        this.model.dispatch({ 
          type: 'SET_AUCTION', 
          payload: state.auction ? { ...state.auction, status: 'completed' } : null 
        });
        
        if (result.bidStatus === 'accepted') {
          this.model.dispatch({ 
            type: 'SET_NOTIFICATION', 
            payload: `Bid accepted. Provide ${result.acceptedPowerMW} MW at €${result.participantPayoutEUR.toLocaleString()} total.` 
          });
        } else {
          this.model.dispatch({ 
            type: 'SET_NOTIFICATION', 
            payload: 'Bid rejected. Price per MW too high compared to redispatch cost.' 
          });
        }
      }
    } catch (error) {
      console.error('Trigger auction error:', error);
      this.model.dispatch({ type: 'SET_NOTIFICATION', payload: 'Failed to trigger auction' });
    }
  }

  async resetAuction(): Promise<void> {
    try {
      await this.service.resetAuction();
      this.model.dispatch({ type: 'RESET_AUCTION' });
    } catch (error) {
      console.error('Reset auction error:', error);
      this.model.dispatch({ type: 'SET_NOTIFICATION', payload: 'Failed to reset auction' });
    }
  }

  // ========== UI State Updates ==========

  updateBidPower(powerMW: number): void {
    const currentBid = this.model.getState().bid;
    this.model.dispatch({ 
      type: 'SET_BID', 
      payload: { ...currentBid, powerMW } 
    });
  }

  updateBidPrice(priceEUR: number): void {
    const currentBid = this.model.getState().bid;
    this.model.dispatch({ 
      type: 'SET_BID', 
      payload: { ...currentBid, priceEUR } 
    });
  }

  clearNotification(): void {
    this.model.dispatch({ type: 'SET_NOTIFICATION', payload: '' });
  }
}
