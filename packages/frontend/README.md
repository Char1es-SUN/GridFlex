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

### System Changes (Right Half)

- **Real-time Status Updates**: Shows all changes happening under the hood
- **Step-by-step Process**: Tracks the complete auction lifecycle
- **System Status**: Current auction status, bid status, and resolution status

## Features

- **Responsive Design**: Works on desktop and mobile devices
- **Interactive UI**: Real-time updates and state management
- **Mock Data**: Realistic simulation with predefined values
- **Clean Interface**: Simple text inputs and clear visual feedback
- **State Management**: React hooks for managing application state

## Technology Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management

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

# Or from frontend directory
cd packages/frontend
npm run dev
```

The demo will be available at http://localhost:3000

### Build for Production
```bash
# From root directory
npm run build

# Or from frontend directory
cd packages/frontend
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

## Mock Data

The demo uses the following mock data:
- **Redispatch Event**: 100 MW at 14:30 with €5,000 total cost
- **Auction Logic**: Simple first-come-first-served with price acceptance
- **Bid Validation**: Requires positive power and price values

## Project Structure

```
packages/frontend/
├── src/
│   └── app/
│       ├── page.tsx          # Main demo page
│       ├── layout.tsx        # Root layout
│       └── globals.css       # Global styles
├── public/                   # Static assets
├── package.json
└── README.md
```

## License

MIT License
