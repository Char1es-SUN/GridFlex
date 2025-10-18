// ========== Core Domain Types ==========

export interface RedispatchEvent {
  id: string;
  timestamp: string;
  powerMW: number;
  costPerMW: number;
  status: 'pending' | 'active' | 'completed';
}

export interface Auction {
  id: string;
  redispatchEventId: string;
  timestamp: string;
  powerMW: number;
  costPerMW: number;
  status: 'active' | 'completed' | 'cancelled';
  participantId?: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  participantId: string;
  powerMW: number;
  pricePerMW: number;
  timestamp: string;
  status: 'submitted' | 'accepted' | 'rejected';
}

export interface Participant {
  id: string;
  name: string;
  powerMW: number;
  pricePerMW: number;
}

export interface AuctionResult {
  auctionId: string;
  bidId: string;
  acceptedPowerMW: number;
  remainingPowerMW: number;
  remainingCostPerMW: number;
  participantPayoutEUR: number;
  bidStatus: 'accepted' | 'rejected';
  reason?: string;
}

export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  data: string;
  timestamp: number;
  blockNumber?: number;
  status: 'pending' | 'confirmed' | 'failed';
}

// ========== Event Types for Backend Communication ==========

export interface BaseEvent {
  eventId: string;
  timestamp: string;
  eventType: string;
  version: string;
}

export interface RedispatchEventCreated extends BaseEvent {
  eventType: 'redispatch.created';
  payload: {
    redispatchEvent: RedispatchEvent;
  };
}

export interface AuctionBroadcasted extends BaseEvent {
  eventType: 'auction.broadcasted';
  payload: {
    auction: Auction;
    redispatchEvent: RedispatchEvent;
  };
}

export interface BidSubmitted extends BaseEvent {
  eventType: 'bid.submitted';
  payload: {
    bid: Bid;
    auction: Auction;
  };
}

export interface AuctionTriggered extends BaseEvent {
  eventType: 'auction.triggered';
  payload: {
    auctionId: string;
    bidId: string;
  };
}

export interface AuctionResolved extends BaseEvent {
  eventType: 'auction.resolved';
  payload: {
    result: AuctionResult;
    auction: Auction;
    bid: Bid;
  };
}

export interface AuctionReset extends BaseEvent {
  eventType: 'auction.reset';
  payload: {
    reason: string;
  };
}

// Union type for all events
export type GridFlexibilityEvent = 
  | RedispatchEventCreated
  | AuctionBroadcasted
  | BidSubmitted
  | AuctionTriggered
  | AuctionResolved
  | AuctionReset;

// ========== API Response Types ==========

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface EventResponse extends ApiResponse<GridFlexibilityEvent> {
  eventId: string;
}
