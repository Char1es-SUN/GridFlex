import { RedispatchEvent, Auction, Bid, AuctionResult, GridFlexibilityEvent, BlockchainTransaction, Participant } from '../types/grid-flexibility';

// ========== Model State Interface ==========

export interface GridFlexibilityState {
  redispatchEvent: RedispatchEvent;
  auction: Auction | null;
  bid: Omit<Bid, 'id' | 'timestamp' | 'status'>;
  auctionResult: AuctionResult | null;
  bidPlaced: boolean;
  notification: string;
  events: GridFlexibilityEvent[];
  transactions: BlockchainTransaction[];
  participants: Participant[];
}

// ========== Model Actions ==========

export type GridFlexibilityAction =
  | { type: 'SET_AUCTION'; payload: Auction | null }
  | { type: 'SET_BID'; payload: Omit<Bid, 'id' | 'timestamp' | 'status'> }
  | { type: 'SET_AUCTION_RESULT'; payload: AuctionResult | null }
  | { type: 'SET_BID_PLACED'; payload: boolean }
  | { type: 'SET_NOTIFICATION'; payload: string }
  | { type: 'ADD_EVENT'; payload: GridFlexibilityEvent }
  | { type: 'ADD_TRANSACTION'; payload: BlockchainTransaction }
  | { type: 'UPDATE_TRANSACTION'; payload: BlockchainTransaction }
  | { type: 'UPDATE_PARTICIPANT'; payload: { id: string; powerMW: number; pricePerMW: number } }
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
        pricePerMW: 0
      },
      auctionResult: null,
      bidPlaced: false,
      notification: '',
      events: [],
      transactions: [],
      participants: [
        { id: 'participant-1', name: 'Participant 1', powerMW: 50, pricePerMW: 10 },
        { id: 'participant-2', name: 'Participant 2', powerMW: 30, pricePerMW: 20 },
        { id: 'participant-3', name: 'Participant 3', powerMW: 40, pricePerMW: 30 },
        { id: 'participant-4', name: 'Participant 4', powerMW: 20, pricePerMW: 80 }
      ]
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
      case 'ADD_TRANSACTION':
        console.log('Adding transaction to model:', action.payload.hash);
        this.state = { 
          ...this.state, 
          transactions: [action.payload, ...this.state.transactions] 
        };
        break;
      case 'UPDATE_TRANSACTION':
        console.log('Updating transaction in model:', action.payload.hash);
        this.state = { 
          ...this.state, 
          transactions: this.state.transactions.map(tx => 
            tx.hash === action.payload.hash ? action.payload : tx
          )
        };
        break;
      case 'UPDATE_PARTICIPANT':
        console.log('Updating participant in model:', action.payload.id);
        this.state = { 
          ...this.state, 
          participants:         this.state.participants.map(p => 
          p.id === action.payload.id 
            ? { ...p, powerMW: action.payload.powerMW, pricePerMW: action.payload.pricePerMW }
            : p
        )
        };
        break;
      case 'RESET_AUCTION':
        this.state = {
          ...this.state,
          auction: null,
          bid: {
            auctionId: '',
            participantId: 'participant-1',
            powerMW: 0,
            pricePerMW: 0
          },
          auctionResult: null,
          bidPlaced: false,
          notification: '',
          transactions: [],
          participants: [
            { id: 'participant-1', name: 'Participant 1', powerMW: 50, pricePerMW: 10 },
            { id: 'participant-2', name: 'Participant 2', powerMW: 30, pricePerMW: 20 },
            { id: 'participant-3', name: 'Participant 3', powerMW: 40, pricePerMW: 30 },
            { id: 'participant-4', name: 'Participant 4', powerMW: 20, pricePerMW: 80 }
          ]
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
    return this.isAuctionActive && this.state.bid.powerMW > 0 && this.state.bid.pricePerMW > 0;
  }

  get canTriggerAuction(): boolean {
    return this.state.bidPlaced && this.isAuctionActive;
  }

  get hasEvents(): boolean {
    return this.state.events.length > 0;
  }

  get canBroadcastBids(): boolean {
    return this.isAuctionActive && this.state.participants.some(p => p.powerMW > 0 && p.pricePerMW > 0);
  }
}
