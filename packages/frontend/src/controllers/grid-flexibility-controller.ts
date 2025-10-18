import { GridFlexibilityService } from '../services/grid-flexibility-service';
import { GridFlexibilityModel } from '../models/grid-flexibility-model';
import { HardhatBlockchainService } from '../services/hardhat-service';
import { GridFlexibilityEvent } from '../types/grid-flexibility';
import { AuctionAlgorithm, AuctionAlgorithmFactory, DEFAULT_AUCTION_CONFIG } from '../algorithms/auction-algorithm';

// ========== Controller Class ==========

export class GridFlexibilityController {
  private service: GridFlexibilityService;
  private model: GridFlexibilityModel;
  private blockchainService: HardhatBlockchainService;
  private isSubscribed: boolean = false;

  constructor(service: GridFlexibilityService, model: GridFlexibilityModel, blockchainService: HardhatBlockchainService) {
    this.service = service;
    this.model = model;
    this.blockchainService = blockchainService;
    this.setupEventSubscription();
  }

  // ========== Event Subscription ==========

  private setupEventSubscription(): void {
    if (this.isSubscribed) {
      console.log('Already subscribed to events, skipping duplicate subscription');
      return;
    }

    console.log('Setting up event subscription');
    
    // Set up direct event published callback for UI display
    this.service.setEventPublishedCallback(async (event: GridFlexibilityEvent) => {
      console.log('Event published, adding to UI:', event);
      this.model.dispatch({ type: 'ADD_EVENT', payload: event });
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
  // Blockchain transactions are now handled directly in the business logic methods
  // (broadcastAuction, broadcastAllBids, triggerAuction)

  // ========== Business Logic Methods ==========

  async broadcastAuction(): Promise<void> {
    try {
      const redispatchEvent = this.model.getState().redispatchEvent;
      
      // Call startCollection on DataCollector contract
      const transaction = await this.blockchainService.startCollection();
      
      // Add transaction to model
      this.model.dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      
      // Still call the service for frontend events (keeping model-controller architecture intact)
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
    if (!state.auction || state.bid.powerMW <= 0 || state.bid.pricePerMW <= 0) return;

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
      // Step 1: Call endCollection on DataCollector contract
      const endCollectionTransaction = await this.blockchainService.endCollection();
      this.model.dispatch({ type: 'ADD_TRANSACTION', payload: endCollectionTransaction });
      
      // Step 2: Get collected data from DataCollector contract
      const collectedData = await this.blockchainService.getCollectedData();
      
      // Step 3: Convert collected data to bids for auction algorithm
      const bids = state.participants.map((participant, index) => ({
        id: `bid-${participant.id}-${Date.now()}`,
        auctionId: state.auction!.id,
        participantId: participant.id,
        powerMW: participant.powerMW,
        pricePerMW: participant.pricePerMW,
        timestamp: new Date().toISOString(),
        status: 'submitted' as const
      }));
      
      // Step 4: Run auction algorithm
      const algorithm = AuctionAlgorithmFactory.createDefault();
      const auctionInput = {
        auction: state.auction,
        redispatchEvent: state.redispatchEvent,
        bids: bids,
        config: {
          ...DEFAULT_AUCTION_CONFIG,
          costPerMWThreshold: state.redispatchEvent.costPerMW
        }
      };
      
      const auctionOutput = algorithm.processAuction(auctionInput);
      const result = auctionOutput.result;
      
      // Step 5: Update model with auction result
      this.model.dispatch({ type: 'SET_AUCTION_RESULT', payload: result });
      this.model.dispatch({ 
        type: 'SET_AUCTION', 
        payload: state.auction ? { ...state.auction, status: 'completed' } : null 
      });
      
      if (result.bidStatus === 'accepted') {
        this.model.dispatch({ 
          type: 'SET_NOTIFICATION', 
          payload: `Auction completed. ${result.acceptedPowerMW} MW accepted at €${result.participantPayoutEUR.toLocaleString()} total.` 
        });
      } else {
        this.model.dispatch({ 
          type: 'SET_NOTIFICATION', 
          payload: 'Auction completed. No competitive bids received.' 
        });
      }
      
      // Still call the service for frontend events (keeping model-controller architecture intact)
      const mockBidId = 'bid-' + Date.now();
      const response = await this.service.triggerAuction(state.auction.id, mockBidId);
      if (response.success && response.data) {
        console.log('Service trigger auction completed:', response.data);
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

  updateBidPrice(pricePerMW: number): void {
    const currentBid = this.model.getState().bid;
    this.model.dispatch({ 
      type: 'SET_BID', 
      payload: { ...currentBid, pricePerMW } 
    });
  }

  clearNotification(): void {
    this.model.dispatch({ type: 'SET_NOTIFICATION', payload: '' });
  }

  // ========== Participant Management ==========

  updateParticipant(participantId: string, powerMW: number, pricePerMW: number): void {
    this.model.dispatch({ 
      type: 'UPDATE_PARTICIPANT', 
      payload: { id: participantId, powerMW, pricePerMW } 
    });
  }

  async broadcastAllBids(): Promise<void> {
    try {
      const state = this.model.getState();
      if (!state.auction) return;

      const validParticipants = state.participants.filter(p => p.powerMW > 0 && p.pricePerMW > 0);
      
      if (validParticipants.length === 0) {
        this.model.dispatch({ type: 'SET_NOTIFICATION', payload: 'No valid bids to broadcast' });
        return;
      }

      // Submit data to DataCollector contract for each participant
      for (let i = 0; i < validParticipants.length; i++) {
        const participant = validParticipants[i];
        try {
          // Call submitData on DataCollector contract (one transaction per participant)
          const transaction = await this.blockchainService.submitData(
            participant.pricePerMW,
            participant.powerMW,
            participant.id
          );
          
          // Add transaction to model
          this.model.dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
          
          console.log(`Data submitted for ${participant.name}:`, transaction.hash);
          
          // Add small delay between transactions to avoid nonce conflicts
          if (i < validParticipants.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`Failed to submit data for ${participant.name}:`, error);
        }
      }

      // Still call the service for frontend events (keeping model-controller architecture intact)
      for (const participant of validParticipants) {
        const bid = {
          auctionId: state.auction.id,
          participantId: participant.id,
          powerMW: participant.powerMW,
          pricePerMW: participant.pricePerMW
        };

        const response = await this.service.submitBid(bid);
        if (response.success && response.data) {
          console.log(`Bid submitted for ${participant.name}:`, response.data);
        }
      }

      this.model.dispatch({ type: 'SET_BID_PLACED', payload: true });
      this.model.dispatch({ type: 'SET_NOTIFICATION', payload: `Successfully broadcasted ${validParticipants.length} bids` });
      
    } catch (error) {
      console.error('Broadcast all bids error:', error);
      this.model.dispatch({ type: 'SET_NOTIFICATION', payload: 'Failed to broadcast bids' });
    }
  }
}
