import { useState, useEffect } from 'react';
import { GridFlexibilityModel } from '../models/grid-flexibility-model';
import { GridFlexibilityController } from '../controllers/grid-flexibility-controller';
import { GridFlexibilityService } from '../services/grid-flexibility-service';
import { RedispatchEvent } from '../types/grid-flexibility';
import { HardhatBlockchainService } from '../services/hardhat-service';

// ========== Custom Hook ==========

export function useGridFlexibility(
  service: GridFlexibilityService,
  initialRedispatchEvent: RedispatchEvent
) {
  const [model] = useState(() => new GridFlexibilityModel(initialRedispatchEvent));
  const [blockchainService] = useState(() => new HardhatBlockchainService());
  const [controller] = useState(() => new GridFlexibilityController(service, model, blockchainService));
  const [state, setState] = useState(model.getState());

  useEffect(() => {
    const unsubscribe = model.subscribe(setState);
    return unsubscribe;
  }, [model]);

  // Create test event only after hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const testEvent = {
        eventId: `evt_${Date.now()}_test`,
        timestamp: new Date().toISOString(),
        eventType: 'auction.reset' as const,
        version: '1.0.0',
        payload: { reason: 'System initialized' }
      };
      service.publishEvent(testEvent);
    }
  }, [service]);

  return {
    state,
    controller,
    // Computed properties
    isAuctionActive: model.isAuctionActive,
    canPlaceBid: model.canPlaceBid,
    canTriggerAuction: model.canTriggerAuction,
    hasEvents: model.hasEvents,
    canBroadcastBids: model.canBroadcastBids
  };
}
