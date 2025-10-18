// ========== Auction Service ==========
// Service layer that uses the auction algorithm
// Provides clean interface between frontend and algorithm

import { 
  AuctionAlgorithm, 
  AuctionAlgorithmFactory, 
  AuctionInput, 
  AuctionOutput,
  AuctionConfig,
  AlgorithmMetrics
} from '../algorithms/auction-algorithm';
import { Bid, Auction, AuctionResult, RedispatchEvent } from '../types/grid-flexibility';

// ========== Service Interface ==========

export interface AuctionService {
  processAuction(auction: Auction, redispatchEvent: RedispatchEvent, bids: Bid[]): Promise<AuctionResult>;
  updateAlgorithmConfig(config: Partial<AuctionConfig>): void;
  getAlgorithmMetrics(): AlgorithmMetrics | null;
}

// ========== Implementation ==========

export class StandardAuctionService implements AuctionService {
  private algorithm: AuctionAlgorithm;
  private lastMetrics: AlgorithmMetrics | null = null;

  constructor(algorithmType: 'default' | 'cost_savings' | 'power_maximization' | 'balanced' = 'default') {
    this.algorithm = this.createAlgorithm(algorithmType);
  }

  /**
   * Process auction using the algorithm
   */
  async processAuction(
    auction: Auction, 
    redispatchEvent: RedispatchEvent, 
    bids: Bid[]
  ): Promise<AuctionResult> {
    try {
      const input: AuctionInput = {
        auction,
        redispatchEvent,
        bids,
        config: this.algorithm.getConfig()
      };

      const output: AuctionOutput = this.algorithm.processAuction(input);
      
      // Store metrics for later retrieval
      this.lastMetrics = output.algorithmMetrics;
      
      // Log algorithm performance
      console.log('🎯 Auction Algorithm Results:', {
        totalBids: bids.length,
        selectedBids: output.selectedBids.length,
        rejectedBids: output.rejectedBids.length,
        acceptedPower: output.result.acceptedPowerMW,
        costSavings: output.algorithmMetrics.costSavings,
        efficiency: `${output.algorithmMetrics.efficiency.toFixed(1)}%`
      });

      return output.result;
    } catch (error) {
      console.error('❌ Auction processing failed:', error);
      throw new Error(`Auction processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update algorithm configuration
   */
  updateAlgorithmConfig(config: Partial<AuctionConfig>): void {
    this.algorithm.updateConfig(config);
    console.log('🔧 Algorithm configuration updated:', config);
  }

  /**
   * Get last algorithm metrics
   */
  getAlgorithmMetrics(): AlgorithmMetrics | null {
    return this.lastMetrics;
  }

  /**
   * Create algorithm based on type
   */
  private createAlgorithm(type: string): AuctionAlgorithm {
    switch (type) {
      case 'cost_savings':
        return AuctionAlgorithmFactory.createOptimized('cost_savings');
      case 'power_maximization':
        return AuctionAlgorithmFactory.createOptimized('power_maximization');
      case 'balanced':
        return AuctionAlgorithmFactory.createOptimized('balanced');
      default:
        return AuctionAlgorithmFactory.createDefault();
    }
  }
}

// ========== Service Factory ==========

export class AuctionServiceFactory {
  /**
   * Create standard auction service
   */
  static createStandard(): AuctionService {
    return new StandardAuctionService('default');
  }

  /**
   * Create optimized auction service
   */
  static createOptimized(type: 'cost_savings' | 'power_maximization' | 'balanced'): AuctionService {
    return new StandardAuctionService(type);
  }

  /**
   * Create custom auction service with specific configuration
   */
  static createCustom(config: Partial<AuctionConfig>): AuctionService {
    const service = new StandardAuctionService('default');
    service.updateAlgorithmConfig(config);
    return service;
  }
}

// ========== Default Service Instance ==========

export const defaultAuctionService = AuctionServiceFactory.createStandard();
