import { GridFlexibilityService } from '../services/grid-flexibility-service';
import { GridFlexibilityModel, GridFlexibilityAction } from '../models/grid-flexibility-model';
import { AuctionReset } from '../types/grid-flexibility';

// ========== Controller Class ==========

export class GridFlexibilityController {
  private service: GridFlexibilityService;
  private model: GridFlexibilityModel;

  constructor(service: GridFlexibilityService, model: GridFlexibilityModel) {
    this.service = service;
    this.model = model;
    this.setupEventSubscription();
  }

  // ========== Event Subscription ==========

  private setupEventSubscription(): void {
    this.service.subscribeToEvents((event) => {
      console.log('Event received in controller:', event);
      this.model.dispatch({ type: 'ADD_EVENT', payload: event });
    });
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
