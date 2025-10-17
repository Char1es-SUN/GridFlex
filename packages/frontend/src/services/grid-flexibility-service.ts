import {
  GridFlexibilityEvent,
  RedispatchEvent,
  Auction,
  Bid,
  AuctionResult,
  ApiResponse,
  EventResponse,
  RedispatchEventCreated,
  AuctionBroadcasted,
  BidSubmitted,
  AuctionTriggered,
  AuctionResolved,
  AuctionReset
} from '../types/grid-flexibility';

// ========== Backend Service Interface ==========

export interface GridFlexibilityService {
  // Event publishing
  publishEvent(event: GridFlexibilityEvent): Promise<EventResponse>;
  
  // Redispatch management
  createRedispatchEvent(event: RedispatchEvent): Promise<ApiResponse<RedispatchEvent>>;
  getRedispatchEvent(id: string): Promise<ApiResponse<RedispatchEvent>>;
  
  // Auction management
  broadcastAuction(redispatchEventId: string): Promise<ApiResponse<Auction>>;
  getAuction(id: string): Promise<ApiResponse<Auction>>;
  triggerAuction(auctionId: string, bidId: string): Promise<ApiResponse<AuctionResult>>;
  resetAuction(): Promise<ApiResponse<void>>;
  
  // Bid management
  submitBid(bid: Omit<Bid, 'id' | 'timestamp' | 'status'>): Promise<ApiResponse<Bid>>;
  getBid(id: string): Promise<ApiResponse<Bid>>;
  
  // Event subscription
  subscribeToEvents(callback: (event: GridFlexibilityEvent) => void): () => void;
}

// ========== Utility Functions ==========

let idCounter = 0;

export const generateId = (): string => {
  // Use a more SSR-friendly approach
  if (typeof window === 'undefined') {
    // Server-side: use a simple counter
    idCounter++;
    return `evt_ssr_${idCounter}`;
  } else {
    // Client-side: use timestamp and random
    idCounter++;
    return `evt_${Date.now()}_${idCounter}_${Math.random().toString(36).substr(2, 6)}`;
  }
};

export const createEvent = <T extends GridFlexibilityEvent>(
  eventType: T['eventType'],
  payload: T['payload']
): T => ({
  eventId: generateId(),
  timestamp: typeof window === 'undefined' 
    ? '2024-01-15T14:30:00.000Z' // Fixed timestamp for SSR
    : new Date().toISOString(), // Dynamic timestamp for client
  eventType,
  version: '1.0.0',
  payload
} as T);

// ========== Mock Backend Service Implementation ==========

export class MockGridFlexibilityService implements GridFlexibilityService {
  private events: GridFlexibilityEvent[] = [];
  private subscribers: ((event: GridFlexibilityEvent) => void)[] = [];
  private onEventPublished?: (event: GridFlexibilityEvent) => void;

  async publishEvent(event: GridFlexibilityEvent): Promise<EventResponse> {
    console.log('publishEvent called with event:', event.eventType, 'ID:', event.eventId);
    console.log('Number of subscribers:', this.subscribers.length);
    
    this.events.push(event);
    
    // Notify the UI directly about the published event (for display)
    if (this.onEventPublished) {
      this.onEventPublished(event);
    }
    
    // Notify all subscribers (for business logic)
    this.subscribers.forEach((callback, index) => {
      try {
        console.log(`Calling subscriber ${index} for event ${event.eventId}`);
        callback(event);
      } catch (error) {
        console.error('Error in event subscriber:', error);
      }
    });
    
    return {
      success: true,
      eventId: event.eventId,
      data: event,
      timestamp: new Date().toISOString()
    };
  }

  async createRedispatchEvent(event: RedispatchEvent): Promise<ApiResponse<RedispatchEvent>> {
    const createdEvent = createEvent<RedispatchEventCreated>('redispatch.created', { redispatchEvent: event });
    await this.publishEvent(createdEvent);
    
    return {
      success: true,
      data: event,
      timestamp: new Date().toISOString()
    };
  }

  async getRedispatchEvent(id: string): Promise<ApiResponse<RedispatchEvent>> {
    // Mock implementation
    return {
      success: true,
      data: {
        id,
        timestamp: new Date().toISOString(),
        powerMW: 100,
        costEUR: 5000,
        status: 'pending'
      },
      timestamp: new Date().toISOString()
    };
  }

  async broadcastAuction(redispatchEventId: string): Promise<ApiResponse<Auction>> {
    console.log('broadcastAuction called with redispatchEventId:', redispatchEventId);
    
    const auction: Auction = {
      id: generateId(),
      redispatchEventId,
      timestamp: new Date().toISOString(),
      powerMW: 100,
      costEUR: 5000,
      status: 'active'
    };

    const event = createEvent<AuctionBroadcasted>('auction.broadcasted', {
      auction,
      redispatchEvent: {
        id: redispatchEventId,
        timestamp: new Date().toISOString(),
        powerMW: 100,
        costEUR: 5000,
        status: 'active'
      }
    });

    console.log('Publishing event:', event);
    await this.publishEvent(event);
    
    return {
      success: true,
      data: auction,
      timestamp: new Date().toISOString()
    };
  }

  async getAuction(id: string): Promise<ApiResponse<Auction>> {
    // Mock implementation
    return {
      success: true,
      data: {
        id,
        redispatchEventId: 'redispatch-1',
        timestamp: new Date().toISOString(),
        powerMW: 100,
        costEUR: 5000,
        status: 'active'
      },
      timestamp: new Date().toISOString()
    };
  }

  async triggerAuction(auctionId: string, bidId: string): Promise<ApiResponse<AuctionResult>> {
    // Mock implementation - would contain actual auction logic
    const result: AuctionResult = {
      auctionId,
      bidId,
      acceptedPowerMW: 50,
      remainingPowerMW: 50,
      remainingCostEUR: 2500,
      participantPayoutEUR: 2000,
      bidStatus: 'accepted',
      reason: 'Bid price per MW lower than redispatch cost'
    };

    const event = createEvent<AuctionResolved>('auction.resolved', {
      result,
      auction: {
        id: auctionId,
        redispatchEventId: 'redispatch-1',
        timestamp: new Date().toISOString(),
        powerMW: 100,
        costEUR: 5000,
        status: 'completed'
      },
      bid: {
        id: bidId,
        auctionId,
        participantId: 'participant-1',
        powerMW: 50,
        priceEUR: 2000,
        timestamp: new Date().toISOString(),
        status: 'accepted'
      }
    });

    await this.publishEvent(event);
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
  }

  async resetAuction(): Promise<ApiResponse<void>> {
    const event = createEvent<AuctionReset>('auction.reset', {
      reason: 'User initiated reset'
    });

    await this.publishEvent(event);
    
    return {
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  async submitBid(bid: Omit<Bid, 'id' | 'timestamp' | 'status'>): Promise<ApiResponse<Bid>> {
    const newBid: Bid = {
      ...bid,
      id: generateId(),
      timestamp: new Date().toISOString(),
      status: 'submitted'
    };

    const event = createEvent<BidSubmitted>('bid.submitted', {
      bid: newBid,
      auction: {
        id: bid.auctionId,
        redispatchEventId: 'redispatch-1',
        timestamp: new Date().toISOString(),
        powerMW: 100,
        costEUR: 5000,
        status: 'active'
      }
    });

    await this.publishEvent(event);
    
    return {
      success: true,
      data: newBid,
      timestamp: new Date().toISOString()
    };
  }

  async getBid(id: string): Promise<ApiResponse<Bid>> {
    // Mock implementation
    return {
      success: true,
      data: {
        id,
        auctionId: 'auction-1',
        participantId: 'participant-1',
        powerMW: 50,
        priceEUR: 2000,
        timestamp: new Date().toISOString(),
        status: 'submitted'
      },
      timestamp: new Date().toISOString()
    };
  }

  subscribeToEvents(callback: (event: GridFlexibilityEvent) => void): () => void {
    console.log('subscribeToEvents called, adding subscriber');
    this.subscribers.push(callback);
    console.log('Total subscribers now:', this.subscribers.length);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
        console.log('Subscriber removed, total subscribers now:', this.subscribers.length);
      }
    };
  }

  setEventPublishedCallback(callback: (event: GridFlexibilityEvent) => void): void {
    this.onEventPublished = callback;
  }
}
