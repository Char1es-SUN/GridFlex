'use client';

import { useState } from 'react';

interface RedispatchEvent {
  time: string;
  power: number;
  cost: number;
}

interface Auction {
  time: string;
  power: number;
  cost: number;
  isActive: boolean;
}

interface Bid {
  power: number;
  price: number;
}

interface AuctionResult {
  acceptedPower: number;
  remainingPower: number;
  remainingCost: number;
  bidWon: boolean;
}

export default function GridFlexibilityMarket() {
  // Mock data for redispatch event
  const [redispatchEvent] = useState<RedispatchEvent>({
    time: "14:30",
    power: 100, // MW
    cost: 5000 // EUR
  });

  // State for auction
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bid, setBid] = useState<Bid>({ power: 0, price: 0 });
  const [auctionResult, setAuctionResult] = useState<AuctionResult | null>(null);
  const [bidPlaced, setBidPlaced] = useState(false);
  const [notification, setNotification] = useState<string>('');

  const broadcastAuction = () => {
    const newAuction: Auction = {
      time: redispatchEvent.time,
      power: redispatchEvent.power,
      cost: redispatchEvent.cost,
      isActive: true
    };
    setAuction(newAuction);
    setAuctionResult(null);
    setBidPlaced(false);
    setNotification('');
  };

  const placeBid = () => {
    if (bid.power > 0 && bid.price > 0) {
      setBidPlaced(true);
      setNotification('Bid placed successfully!');
    }
  };

  const triggerAuction = () => {
    if (auction && bidPlaced) {
      // Mock auction resolution logic
      const acceptedPower = Math.min(bid.power, auction.power);
      const remainingPower = auction.power - acceptedPower;
      const remainingCost = auction.cost - (acceptedPower * bid.price);
      const bidWon = acceptedPower > 0;

      const result: AuctionResult = {
        acceptedPower,
        remainingPower,
        remainingCost,
        bidWon
      };

      setAuctionResult(result);
      setAuction({ ...auction, isActive: false });
      setNotification(bidWon ? 'Congratulations! Your bid won the auction!' : 'Your bid did not win the auction.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Local Grid Flexibility Market
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Demo with Grid Operator and Participant Interface
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Grid Operator and Participant */}
          <div className="space-y-8">
            {/* Grid Operator Section - Left Upper Half */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 h-96">
              <h2 className="text-xl font-semibold mb-4 text-blue-700">Grid Operator</h2>
              
              {/* Initial State */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Initial State</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Time:</span>
                    <span className="text-sm text-gray-800">{redispatchEvent.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Total Power:</span>
                    <span className="text-sm text-gray-800">{redispatchEvent.power} MW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Total Cost:</span>
                    <span className="text-sm text-gray-800">€{redispatchEvent.cost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Broadcast Auction Button */}
              <div className="mb-6">
                <button
                  onClick={broadcastAuction}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Broadcast Auction
                </button>
              </div>

              {/* Trigger Auction Button */}
              <div className="mb-6">
                <button
                  onClick={triggerAuction}
                  disabled={!bidPlaced}
                  className={`w-full font-medium py-2 px-4 rounded-lg transition-colors ${
                    bidPlaced
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Trigger Auction
                </button>
              </div>

              {/* Auction Result */}
              {auctionResult && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Auction Resolved</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Accepted Participant Power:</span> {auctionResult.acceptedPower} MW</p>
                    <p><span className="font-medium">Remaining Total Power:</span> {auctionResult.remainingPower} MW</p>
                    <p><span className="font-medium">Remaining Total Cost:</span> €{auctionResult.remainingCost.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Participant Section - Left Lower Half */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 h-96">
              <h2 className="text-xl font-semibold mb-4 text-green-700">Grid Participant</h2>
              
              {/* Current Auction */}
              {auction && auction.isActive && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Current Ongoing Auction</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Time:</span> {auction.time}</p>
                    <p><span className="font-medium">Total Power:</span> {auction.power} MW</p>
                    <p><span className="font-medium">Total Cost:</span> €{auction.cost.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Bid Input */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Place Your Bid</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Bid Power (MW)
                      </label>
                      <input
                        type="number"
                        value={bid.power}
                        onChange={(e) => setBid({ ...bid, power: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter power in MW"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Bid Price (€/MW)
                      </label>
                      <input
                        type="number"
                        value={bid.price}
                        onChange={(e) => setBid({ ...bid, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter price per MW"
                      />
                    </div>
                  </div>
                  <button
                    onClick={placeBid}
                    disabled={!auction || !auction.isActive}
                    className={`w-full font-medium py-2 px-4 rounded-lg transition-colors ${
                      auction && auction.isActive
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Broadcast Bid
                  </button>
                </div>
              </div>

              {/* Notification */}
              {notification && (
                <div className={`p-4 rounded-lg ${
                  notification.includes('won') || notification.includes('successfully')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <p className="font-medium">{notification}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - System Changes - Right Half */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500 h-full">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">System Changes</h2>
            
            <div className="space-y-6">
              {/* Auction Broadcast */}
              {auction && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Auction Broadcast</h3>
                  <p className="text-sm text-blue-700">
                    Grid operator has broadcast an auction for {auction.power} MW at {auction.time} 
                    with total cost €{auction.cost.toLocaleString()}. Participants can now place bids.
                  </p>
                </div>
              )}

              {/* Bid Placed */}
              {bidPlaced && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Bid Placed</h3>
                  <p className="text-sm text-green-700">
                    Participant has placed a bid for {bid.power} MW at €{bid.price}/MW.
                  </p>
                </div>
              )}

              {/* Auction Resolution */}
              {auctionResult && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-800 mb-2">Auction Resolved</h3>
                  <div className="text-sm text-purple-700 space-y-1">
                    <p>• {auctionResult.acceptedPower} MW accepted from participant</p>
                    <p>• {auctionResult.remainingPower} MW remaining for grid operator</p>
                    <p>• Remaining cost: €{auctionResult.remainingCost.toLocaleString()}</p>
                    <p>• Participant bid: {auctionResult.bidWon ? 'WON' : 'LOST'}</p>
                  </div>
                </div>
              )}

              {/* System Status */}
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">Current System Status</h3>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>• Auction Status: {auction ? (auction.isActive ? 'Active' : 'Completed') : 'Not Started'}</p>
                  <p>• Bids Placed: {bidPlaced ? 'Yes' : 'No'}</p>
                  <p>• Resolution: {auctionResult ? 'Completed' : 'Pending'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}