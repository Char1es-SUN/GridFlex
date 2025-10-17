import { useState, useEffect } from 'react';
import { GridFlexibilityModel } from '../models/grid-flexibility-model';
import { GridFlexibilityController } from '../controllers/grid-flexibility-controller';
import { GridFlexibilityService } from '../services/grid-flexibility-service';
import { RedispatchEvent } from '../types/grid-flexibility';

// ========== Custom Hook ==========

export function useGridFlexibility(
  service: GridFlexibilityService,
  initialRedispatchEvent: RedispatchEvent
) {
  const [model] = useState(() => new GridFlexibilityModel(initialRedispatchEvent));
  const [controller] = useState(() => new GridFlexibilityController(service, model));
  const [state, setState] = useState(model.getState());

  useEffect(() => {
    const unsubscribe = model.subscribe(setState);
    return unsubscribe;
  }, [model]);

  // No need to create test event here - it will be created by the controller

  return {
    state,
    controller,
    // Computed properties
    isAuctionActive: model.isAuctionActive,
    canPlaceBid: model.canPlaceBid,
    canTriggerAuction: model.canTriggerAuction,
    hasEvents: model.hasEvents
  };
}
