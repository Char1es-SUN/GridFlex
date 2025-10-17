import { RedispatchEvent, Auction, Bid, AuctionResult, GridFlexibilityEvent } from '../types/grid-flexibility';

// ========== Model State Interface ==========

export interface GridFlexibilityState {
  redispatchEvent: RedispatchEvent;
  auction: Auction | null;
  bid: Omit<Bid, 'id' | 'timestamp' | 'status'>;
  auctionResult: AuctionResult | null;
  bidPlaced: boolean;
  notification: string;
  events: GridFlexibilityEvent[];
}

// ========== Model Actions ==========

export type GridFlexibilityAction =
  | { type: 'SET_AUCTION'; payload: Auction | null }
  | { type: 'SET_BID'; payload: Omit<Bid, 'id' | 'timestamp' | 'status'> }
  | { type: 'SET_AUCTION_RESULT'; payload: AuctionResult | null }
  | { type: 'SET_BID_PLACED'; payload: boolean }
  | { type: 'SET_NOTIFICATION'; payload: string }
  | { type: 'ADD_EVENT'; payload: GridFlexibilityEvent }
  | { type: 'RESET_AUCTION' };

// ========== Model Class ==========

export class GridFlexibilityModel {
  private state: GridFlexibilityState;
  private listeners: ((state: GridFlexibilityState) => void)[] = [];

  constructor(initialRedispatchEvent: RedispatchEvent) {
    this.state = {
      redispatchEvent: initialRedispatchEvent,
      auction: null,
      bid: {
        auctionId: '',
        participantId: 'participant-1',
        powerMW: 0,
        priceEUR: 0
      },
      auctionResult: null,
      bidPlaced: false,
      notification: '',
      events: []
    };
  }

  // ========== State Management ==========

  getState(): GridFlexibilityState {
    return { ...this.state };
  }

  subscribe(listener: (state: GridFlexibilityState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  // ========== Action Handlers ==========

  dispatch(action: GridFlexibilityAction): void {
    switch (action.type) {
      case 'SET_AUCTION':
        this.state = { ...this.state, auction: action.payload };
        break;
      case 'SET_BID':
        this.state = { ...this.state, bid: action.payload };
        break;
      case 'SET_AUCTION_RESULT':
        this.state = { ...this.state, auctionResult: action.payload };
        break;
      case 'SET_BID_PLACED':
        this.state = { ...this.state, bidPlaced: action.payload };
        break;
      case 'SET_NOTIFICATION':
        this.state = { ...this.state, notification: action.payload };
        break;
      case 'ADD_EVENT':
        console.log('Adding event to model:', action.payload.eventType, 'ID:', action.payload.eventId);
        console.log('Current events count:', this.state.events.length);
        this.state = { 
          ...this.state, 
          events: [action.payload, ...this.state.events] 
        };
        console.log('New events count:', this.state.events.length);
        break;
      case 'RESET_AUCTION':
        this.state = {
          ...this.state,
          auction: null,
          bid: {
            auctionId: '',
            participantId: 'participant-1',
            powerMW: 0,
            priceEUR: 0
          },
          auctionResult: null,
          bidPlaced: false,
          notification: ''
        };
        break;
      default:
        console.warn('Unknown action type:', action);
    }
    
    this.notifyListeners();
  }

  // ========== Computed Properties ==========

  get isAuctionActive(): boolean {
    return this.state.auction?.status === 'active';
  }

  get canPlaceBid(): boolean {
    return this.isAuctionActive && this.state.bid.powerMW > 0 && this.state.bid.priceEUR > 0;
  }

  get canTriggerAuction(): boolean {
    return this.state.bidPlaced && this.isAuctionActive;
  }

  get hasEvents(): boolean {
    return this.state.events.length > 0;
  }
}
