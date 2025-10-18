# Auction Algorithm Architecture

## Overview

The auction algorithm has been separated from the frontend layout and implemented using industry-standard patterns for easy maintenance and modification. The architecture is lightweight yet extensible.

## Architecture Components

### 1. Core Algorithm (`/src/algorithms/auction-algorithm.ts`)

**Purpose**: Contains the pure business logic for auction processing.

**Key Features**:
- **Configurable**: Supports different auction strategies and parameters
- **Testable**: Pure functions with no side effects
- **Extensible**: Easy to add new selection strategies or criteria
- **Type-Safe**: Full TypeScript support with strict typing

**Main Classes**:
- `AuctionAlgorithm`: Core algorithm implementation
- `AuctionAlgorithmFactory`: Factory for creating different algorithm types

### 2. Service Layer (`/src/services/auction-service.ts`)

**Purpose**: Provides a clean interface between the frontend and algorithm.

**Key Features**:
- **Abstraction**: Hides algorithm complexity from frontend
- **Error Handling**: Robust error handling and logging
- **Metrics**: Tracks algorithm performance
- **Configuration**: Easy algorithm configuration updates

**Main Classes**:
- `StandardAuctionService`: Default service implementation
- `AuctionServiceFactory`: Factory for creating different service types

### 3. Integration (`/src/services/grid-flexibility-service.ts`)

**Purpose**: Integrates the auction algorithm with the existing grid flexibility service.

**Key Features**:
- **Seamless Integration**: Uses auction service in existing workflow
- **Backward Compatibility**: Maintains existing API contracts
- **Error Propagation**: Proper error handling and reporting

## Algorithm Configuration

### Default Configuration
```typescript
{
  maxAcceptedBids: 10,
  minBidPowerMW: 1,
  maxBidPowerMW: 1000,
  costPerMWThreshold: 50, // €50/MW redispatch cost
  priceCompetitivenessFactor: 0.8, // Bids must be at least 20% cheaper
  selectionStrategy: 'price_first',
  allowPartialBids: false
}
```

### Selection Strategies

1. **`price_first`**: Selects bids with lowest price per MW first
2. **`power_first`**: Selects bids with highest power first
3. **`balanced`**: Balances price and power using a scoring system

### Algorithm Types

1. **`cost_savings`**: Optimized for maximum cost savings
2. **`power_maximization`**: Optimized for maximum power procurement
3. **`balanced`**: Balanced approach between cost and power

## Usage Examples

### Basic Usage
```typescript
import { defaultAuctionService } from './services/auction-service';

const result = await defaultAuctionService.processAuction(
  auction,
  redispatchEvent,
  bids
);
```

### Custom Configuration
```typescript
import { AuctionServiceFactory } from './services/auction-service';

const service = AuctionServiceFactory.createCustom({
  selectionStrategy: 'balanced',
  priceCompetitivenessFactor: 0.7
});
```

### Algorithm-Specific Service
```typescript
const costSavingsService = AuctionServiceFactory.createOptimized('cost_savings');
```

## Algorithm Process Flow

1. **Input Validation**: Validates auction, redispatch event, and bids
2. **Bid Filtering**: Filters bids based on validity criteria
3. **Bid Sorting**: Sorts bids according to selection strategy
4. **Bid Selection**: Selects winning bids based on available power
5. **Result Calculation**: Calculates auction results and metrics
6. **Output Generation**: Returns structured results with metrics

## Metrics and Performance

The algorithm tracks several performance metrics:

- **Total Bid Power**: Sum of all bid power
- **Total Bid Value**: Sum of all bid values
- **Average Bid Price**: Average price per MW across all bids
- **Cost Savings**: Amount saved compared to redispatch cost
- **Efficiency**: Percentage of redispatch cost saved

## Extensibility

### Adding New Selection Strategies

1. Add new strategy to `AuctionConfig['selectionStrategy']`
2. Implement strategy in `sortBids()` method
3. Update factory methods if needed

### Adding New Algorithm Types

1. Add new type to factory method
2. Define specific configuration
3. Create optimized algorithm instance

### Adding New Metrics

1. Add metric to `AlgorithmMetrics` interface
2. Calculate metric in `calculateMetrics()` method
3. Update service to expose metric

## Testing

The algorithm is designed for easy testing:

- **Unit Tests**: Test individual methods with mock data
- **Integration Tests**: Test service layer with real data
- **Performance Tests**: Benchmark algorithm performance
- **Configuration Tests**: Test different configurations

## Maintenance

### Common Modifications

1. **Adjust Pricing Logic**: Modify `priceCompetitivenessFactor`
2. **Change Selection Criteria**: Update `sortBids()` method
3. **Add New Constraints**: Extend `filterValidBids()` method
4. **Modify Metrics**: Update `calculateMetrics()` method

### Code Organization

- **Algorithm Logic**: `/src/algorithms/auction-algorithm.ts`
- **Service Interface**: `/src/services/auction-service.ts`
- **Integration**: `/src/services/grid-flexibility-service.ts`
- **Types**: `/src/types/grid-flexibility.ts`

## Benefits

1. **Separation of Concerns**: Business logic separated from UI
2. **Maintainability**: Easy to modify and extend
3. **Testability**: Pure functions with clear interfaces
4. **Reusability**: Algorithm can be used in different contexts
5. **Performance**: Optimized for different use cases
6. **Type Safety**: Full TypeScript support
7. **Documentation**: Well-documented and self-explanatory

## Future Enhancements

- **Machine Learning**: Add ML-based bid prediction
- **Real-time Optimization**: Dynamic algorithm adjustment
- **Advanced Metrics**: More sophisticated performance tracking
- **A/B Testing**: Support for algorithm comparison
- **Caching**: Optimize repeated calculations
