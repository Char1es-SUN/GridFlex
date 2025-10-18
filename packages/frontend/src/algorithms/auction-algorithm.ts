// ========== Auction Algorithm Module ==========
// Industry-standard auction algorithm implementation
// Separated from frontend for easy maintenance and modification

import { Bid, Auction, AuctionResult, RedispatchEvent, ParticipantResolution } from '../types/grid-flexibility';

// ========== Algorithm Configuration ==========

export interface AuctionConfig {
  // Economic parameters
  maxAcceptedBids: number;
  minBidPowerMW: number;
  maxBidPowerMW: number;
  
  // Pricing parameters
  costPerMWThreshold: number; // Redispatch cost per MW
  priceCompetitivenessFactor: number; // How much cheaper than redispatch cost
  
  // Selection criteria
  selectionStrategy: 'price_first' | 'power_first' | 'balanced';
  allowPartialBids: boolean;
}

// ========== Algorithm Input/Output ==========

export interface AuctionInput {
  auction: Auction;
  redispatchEvent: RedispatchEvent;
  bids: Bid[];
  config: AuctionConfig;
}

export interface AuctionOutput {
  result: AuctionResult;
  selectedBids: Bid[];
  rejectedBids: Bid[];
  algorithmMetrics: AlgorithmMetrics;
}

export interface AlgorithmMetrics {
  totalBidPower: number;
  totalBidValue: number;
  averageBidPrice: number;
  costSavings: number;
  efficiency: number; // Percentage of redispatch cost saved
}

// ========== Default Configuration ==========

export const DEFAULT_AUCTION_CONFIG: AuctionConfig = {
  maxAcceptedBids: 10,
  minBidPowerMW: 1,
  maxBidPowerMW: 1000,
  costPerMWThreshold: 50, // €50/MW redispatch cost
  priceCompetitivenessFactor: 0.8, // Bids must be at least 20% cheaper
  selectionStrategy: 'price_first',
  allowPartialBids: false
};

// ========== Core Auction Algorithm ==========

export class AuctionAlgorithm {
  private config: AuctionConfig;

  constructor(config: AuctionConfig = DEFAULT_AUCTION_CONFIG) {
    this.config = config;
  }

  /**
   * Main auction processing method
   * Processes all bids and determines winners
   */
  public processAuction(input: AuctionInput): AuctionOutput {
    const { auction, redispatchEvent, bids, config } = input;
    
    // Validate input
    this.validateInput(input);
    
    // Filter valid bids
    const validBids = this.filterValidBids(bids, config);
    
    // Sort bids by selection strategy
    const sortedBids = this.sortBids(validBids, config);
    
    // Select winning bids
    const { selectedBids, rejectedBids } = this.selectWinningBids(
      sortedBids, 
      redispatchEvent, 
      config
    );
    
    // Calculate results
    const result = this.calculateAuctionResult(
      auction, 
      selectedBids, 
      redispatchEvent, 
      config,
      bids // Use all bids for resolution generation, not just valid ones
    );
    
    // Calculate metrics
    const metrics = this.calculateMetrics(
      validBids, 
      selectedBids, 
      redispatchEvent
    );
    
    return {
      result,
      selectedBids,
      rejectedBids,
      algorithmMetrics: metrics
    };
  }

  /**
   * Validate auction input parameters
   */
  private validateInput(input: AuctionInput): void {
    const { auction, redispatchEvent, bids } = input;
    
    if (!auction || !redispatchEvent || !bids) {
      throw new Error('Invalid auction input: missing required data');
    }
    
    if (bids.length === 0) {
      throw new Error('No bids provided for auction');
    }
    
    if (redispatchEvent.powerMW <= 0) {
      throw new Error('Invalid redispatch event: power must be positive');
    }
  }

  /**
   * Filter bids based on validity criteria
   */
  private filterValidBids(bids: Bid[], config: AuctionConfig): Bid[] {
    return bids.filter(bid => {
      // Check power constraints
      if (bid.powerMW < config.minBidPowerMW || bid.powerMW > config.maxBidPowerMW) {
        return false;
      }
      
      // Check price competitiveness
      const isCompetitive = bid.pricePerMW <= (config.costPerMWThreshold * config.priceCompetitivenessFactor);
      
      return isCompetitive;
    });
  }

  /**
   * Sort bids based on selection strategy
   */
  private sortBids(bids: Bid[], config: AuctionConfig): Bid[] {
    const sorted = [...bids];
    
    switch (config.selectionStrategy) {
      case 'price_first':
        return sorted.sort((a, b) => a.pricePerMW - b.pricePerMW);
      
      case 'power_first':
        return sorted.sort((a, b) => b.powerMW - a.powerMW);
      
      case 'balanced':
        return sorted.sort((a, b) => {
          // Score based on both price and power
          const scoreA = (config.costPerMWThreshold - a.pricePerMW) * a.powerMW;
          const scoreB = (config.costPerMWThreshold - b.pricePerMW) * b.powerMW;
          return scoreB - scoreA;
        });
      
      default:
        return sorted;
    }
  }

  /**
   * Select winning bids based on available power
   */
  private selectWinningBids(
    sortedBids: Bid[], 
    redispatchEvent: RedispatchEvent, 
    config: AuctionConfig
  ): { selectedBids: Bid[]; rejectedBids: Bid[] } {
    const selectedBids: Bid[] = [];
    const rejectedBids: Bid[] = [];
    let remainingPower = redispatchEvent.powerMW;
    
    for (const bid of sortedBids) {
      if (selectedBids.length >= config.maxAcceptedBids) {
        rejectedBids.push(bid);
        continue;
      }
      
      if (remainingPower <= 0) {
        rejectedBids.push(bid);
        continue;
      }
      
      if (bid.powerMW <= remainingPower) {
        // Accept full bid
        selectedBids.push(bid);
        remainingPower -= bid.powerMW;
      } else if (config.allowPartialBids) {
        // Accept partial bid (not implemented in this version)
        rejectedBids.push(bid);
      } else {
        rejectedBids.push(bid);
      }
    }
    
    return { selectedBids, rejectedBids };
  }

  /**
   * Calculate auction result based on selected bids
   */
  private calculateAuctionResult(
    auction: Auction,
    selectedBids: Bid[],
    redispatchEvent: RedispatchEvent,
    config: AuctionConfig,
    allBids: Bid[]
  ): AuctionResult {
    const totalAcceptedPower = selectedBids.reduce((sum, bid) => sum + bid.powerMW, 0);
    const remainingPower = Math.max(0, redispatchEvent.powerMW - totalAcceptedPower);
    const remainingCostPerMW = config.costPerMWThreshold;
    
    // Calculate participant payout (sum of all accepted bids)
    const participantPayout = selectedBids.reduce((sum, bid) => {
      return sum + (bid.powerMW * bid.pricePerMW);
    }, 0);
    
    // Generate participant resolutions
    const participantResolutions = this.generateParticipantResolutions(allBids, selectedBids, config);
    
    // Determine if auction was successful
    const bidStatus = selectedBids.length > 0 ? 'accepted' : 'rejected';
    const reason = selectedBids.length > 0 
      ? `Accepted ${selectedBids.length} bids totaling ${totalAcceptedPower} MW`
      : 'No competitive bids received';
    
    return {
      auctionId: auction.id,
      bidId: selectedBids[0]?.id || 'none',
      acceptedPowerMW: totalAcceptedPower,
      remainingPowerMW: remainingPower,
      remainingCostPerMW: remainingCostPerMW,
      participantPayoutEUR: participantPayout,
      bidStatus,
      reason,
      participantResolutions
    };
  }

  /**
   * Generate participant resolutions for all bids
   */
  private generateParticipantResolutions(
    allBids: Bid[],
    selectedBids: Bid[],
    config: AuctionConfig
  ): ParticipantResolution[] {
    const selectedBidIds = new Set(selectedBids.map(bid => bid.id));
    
    return allBids.map(bid => {
      const isAccepted = selectedBidIds.has(bid.id);
      const acceptedPowerMW = isAccepted ? bid.powerMW : 0;
      const payoutEUR = isAccepted ? (bid.powerMW * bid.pricePerMW) : 0;
      
      let reason: string;
      if (isAccepted) {
        reason = 'Bid accepted - competitive price';
      } else {
        // Check if bid was filtered out due to high price
        if (bid.pricePerMW > (config.costPerMWThreshold * config.priceCompetitivenessFactor)) {
          reason = 'Bid rejected - price too high';
        } else {
          reason = 'Bid rejected - insufficient capacity';
        }
      }
      
      return {
        participantId: bid.participantId,
        participantName: `Participant ${bid.participantId.split('-')[1]}`, // Extract participant number
        bidPowerMW: bid.powerMW,
        bidPricePerMW: bid.pricePerMW,
        status: isAccepted ? 'accepted' : 'rejected',
        acceptedPowerMW,
        payoutEUR,
        reason
      };
    });
  }

  /**
   * Calculate algorithm performance metrics
   */
  private calculateMetrics(
    allBids: Bid[],
    selectedBids: Bid[],
    redispatchEvent: RedispatchEvent
  ): AlgorithmMetrics {
    const totalBidPower = allBids.reduce((sum, bid) => sum + bid.powerMW, 0);
    const totalBidValue = allBids.reduce((sum, bid) => sum + (bid.powerMW * bid.pricePerMW), 0);
    const averageBidPrice = allBids.length > 0 ? totalBidValue / totalBidPower : 0;
    
    const redispatchCost = redispatchEvent.powerMW * redispatchEvent.costPerMW;
    const selectedCost = selectedBids.reduce((sum, bid) => sum + (bid.powerMW * bid.pricePerMW), 0);
    const costSavings = redispatchCost - selectedCost;
    const efficiency = redispatchCost > 0 ? (costSavings / redispatchCost) * 100 : 0;
    
    return {
      totalBidPower,
      totalBidValue,
      averageBidPrice,
      costSavings,
      efficiency
    };
  }

  /**
   * Update algorithm configuration
   */
  public updateConfig(newConfig: Partial<AuctionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): AuctionConfig {
    return { ...this.config };
  }
}

// ========== Algorithm Factory ==========

export class AuctionAlgorithmFactory {
  /**
   * Create algorithm with default configuration
   */
  static createDefault(): AuctionAlgorithm {
    return new AuctionAlgorithm();
  }

  /**
   * Create algorithm with custom configuration
   */
  static createCustom(config: Partial<AuctionConfig>): AuctionAlgorithm {
    const mergedConfig = { ...DEFAULT_AUCTION_CONFIG, ...config };
    return new AuctionAlgorithm(mergedConfig);
  }

  /**
   * Create algorithm optimized for specific use case
   */
  static createOptimized(useCase: 'cost_savings' | 'power_maximization' | 'balanced'): AuctionAlgorithm {
    switch (useCase) {
      case 'cost_savings':
        return new AuctionAlgorithm({
          ...DEFAULT_AUCTION_CONFIG,
          selectionStrategy: 'price_first',
          priceCompetitivenessFactor: 0.7 // More aggressive cost savings
        });
      
      case 'power_maximization':
        return new AuctionAlgorithm({
          ...DEFAULT_AUCTION_CONFIG,
          selectionStrategy: 'power_first',
          maxAcceptedBids: 20
        });
      
      case 'balanced':
        return new AuctionAlgorithm({
          ...DEFAULT_AUCTION_CONFIG,
          selectionStrategy: 'balanced'
        });
      
      default:
        return new AuctionAlgorithm();
    }
  }
}
