# @ethrome2025/frontend

Next.js frontend demo for the local grid flexibility market.

## Overview

A one-page demo showcasing a local grid flexibility market with inputs and outputs for both the grid operator and one participant. The interface is divided into three main sections:

- **Left Upper Half**: Grid Operator perspective
- **Left Lower Half**: Grid Participant perspective  
- **Right Half**: System changes and status updates

## Interface Layout

### Grid Operator Section (Left Upper Half)

1. **Upcoming Redispatch Event**
   - Displays time (t), total power (p), and total cost (c)
   - Shows mock data: 14:30, 100 MW, €5,000

2. **Broadcast Auction Button**
   - Creates a new auction with redispatch event parameters
   - When clicked, participant sees the auction details

3. **Trigger Auction Button**
   - Only clickable when a bid has been placed by participant
   - Resolves the auction and shows results

4. **Resolved Auction View**
   - Shows accepted participant power
   - Displays remaining total power and cost
   - Updates when auction is triggered

### Grid Participant Section (Left Lower Half)

1. **Current Ongoing Auction**
   - Displays when grid operator broadcasts an auction
   - Shows auction parameters: time, power, cost

2. **Bid Input Fields**
   - Bid Power (MW) input field
   - Bid Price (€/MW) input field
   - Both fields positioned side by side

3. **Broadcast Bid Button**
   - Located next to the input fields
   - Submits participant's bid

4. **Notification Field**
   - Shows bid status (won/lost)
   - Updates when auction is executed by grid operator


## Getting Started

### Prerequisites
- Node.js >= 20
- npm >= 7.0.0

### Installation
```bash
# From root directory
npm run install:all

# Or from frontend directory
cd packages/frontend
npm install
```

### Development
```bash
# From root directory
npm run dev
```

### Build for Production
```bash
# From root directory
npm run build
```

## Usage

1. **Start the Demo**: Run `npm run dev` from the root directory
2. **Grid Operator Workflow**:
   - View the upcoming redispatch event
   - Click "Broadcast Auction" to create an auction
   - Wait for participant to place a bid
   - Click "Trigger Auction" to resolve the auction
   - View the auction results

3. **Participant Workflow**:
   - Wait for grid operator to broadcast an auction
   - Enter bid power and price in the input fields
   - Click "Broadcast Bid" to submit your bid
   - Wait for grid operator to trigger the auction
   - View notification about auction results

4. **Monitor System Changes**:
   - Watch the right panel for real-time updates
   - Track the complete auction lifecycle
   - Monitor current system status


## License

MIT License
