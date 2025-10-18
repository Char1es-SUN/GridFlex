'use client';

import { useState } from 'react';
import { MockGridFlexibilityService } from '../services/grid-flexibility-service';
import { useGridFlexibility } from '../hooks/useGridFlexibility';
import { RedispatchEvent } from '../types/grid-flexibility';

export default function GridFlexibilityMarket() {
  // Initialize service
  const [service] = useState(() => new MockGridFlexibilityService());

  // Mock data for redispatch event - use fixed timestamp to avoid hydration issues
  const [redispatchEvent] = useState<RedispatchEvent>({
    id: 'redispatch-1',
    timestamp: '2024-01-15T14:30:00.000Z', // Fixed timestamp
    powerMW: 100,
    costPerMW: 50,
    status: 'pending'
  });

  // Use the custom hook for state management
  const { state, controller, isAuctionActive, canTriggerAuction, hasEvents, canBroadcastBids } = useGridFlexibility(service, redispatchEvent);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Local Grid Flexibility Market
            </h1>
            <p className="text-gray-600 mt-2">
              Demo with Grid Operator and Participant Interface
            </p>
          </div>
          <button
            onClick={() => controller.resetAuction()}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Reset Auction
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Grid Operator and Participant */}
          <div className="space-y-8">
            {/* Grid Operator Section - Left Upper Half */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
              <h2 className="text-xl font-semibold mb-4 text-blue-700">Grid Operator</h2>
              
              {/* Next redispatch event */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Next redispatch event</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Time:</span>
                    <span className="text-sm text-gray-800">{new Date(state.redispatchEvent.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Total Power:</span>
                    <span className="text-sm text-gray-800">{state.redispatchEvent.powerMW} MW</span>
                  </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Cost per MW:</span>
                        <span className="text-sm text-gray-800">€{state.redispatchEvent.costPerMW.toLocaleString()}/MW</span>
                      </div>
                </div>
              </div>

              {/* Broadcast Auction Button */}
              <div className="mb-6">
                <button
                  onClick={() => controller.broadcastAuction()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Broadcast Auction
                </button>
              </div>

              {/* Trigger Auction Button */}
              <div className="mb-6">
                <button
                  onClick={() => controller.triggerAuction()}
                  disabled={!canTriggerAuction}
                  className={`w-full font-medium py-2 px-4 rounded-lg transition-colors ${
                    canTriggerAuction
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Trigger Auction
                </button>
              </div>


              {/* Auction Result */}
              {state.auctionResult && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Auction Resolved</h3>
                  
                  {/* Combined Auction Results */}
                  <div className="p-4 bg-white rounded-lg border-l-4 border-green-400">
                    <div className="space-y-6">
                      {/* Remaining Redispatch Event */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-700">Remaining Redispatch Event</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Time:</span>
                            <span className="text-sm text-gray-800">{new Date(state.redispatchEvent.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Remaining Power:</span>
                            <span className="text-sm text-gray-800">{state.auctionResult.remainingPowerMW} MW</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Remaining Cost per MW:</span>
                            <span className="text-sm text-gray-800">€{state.auctionResult.remainingCostPerMW.toLocaleString()}/MW</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Participant Payout */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-700">Participant Payout</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Accepted Power:</span>
                            <span className="text-sm text-gray-800">{state.auctionResult.acceptedPowerMW} MW</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Payout Amount:</span>
                            <span className="text-sm text-gray-800">€{state.auctionResult.participantPayoutEUR.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Participants Section - Left Lower Half */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
              <h2 className="text-xl font-semibold mb-4 text-green-700">Grid Participants</h2>
              
              {/* Current Auction */}
              {isAuctionActive && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Current Ongoing Auction</h3>
                  
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Time:</span>
                        <span className="text-sm text-gray-800">{new Date(state.redispatchEvent.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Total Power:</span>
                        <span className="text-sm text-gray-800">{state.redispatchEvent.powerMW} MW</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Cost per MW:</span>
                        <span className="text-sm text-gray-800">€{state.redispatchEvent.costPerMW.toLocaleString()}/MW</span>
                      </div>
                    </div>
                  </div>
              )}

              {/* Participants Bid Input */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Place Bids for All Participants</h3>
                <div className="space-y-4">
                  {state.participants.map((participant) => {
                    // Find resolution for this participant
                    const resolution = state.auctionResult?.participantResolutions?.find(
                      r => r.participantId === participant.id
                    );
                    
                    return (
                      <div key={participant.id} className="p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium text-gray-800 mb-3">{participant.name}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Bid Power (MW)
                            </label>
                            <input
                              type="number"
                              value={participant.powerMW}
                              onChange={(e) => controller.updateParticipant(participant.id, Number(e.target.value), participant.pricePerMW)}
                              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="Enter power in MW"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                              Bid Price (€/MW)
                            </label>
                            <input
                              type="number"
                              value={participant.pricePerMW}
                              onChange={(e) => controller.updateParticipant(participant.id, participant.powerMW, Number(e.target.value))}
                              className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="Enter price per MW in €"
                            />
                          </div>
                        </div>
                        
                        {/* Participant Resolution */}
                        {resolution && (
                          <div className={`mt-4 p-3 rounded-lg border-l-4 ${
                            resolution.status === 'accepted' 
                              ? 'bg-green-50 border-green-400' 
                              : 'bg-red-50 border-red-400'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-800">Bid Resolution</h5>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                resolution.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {resolution.status === 'accepted' ? '✅ Accepted' : '❌ Rejected'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">Bid Power:</span>
                                <span className="ml-1 text-gray-800">{resolution.bidPowerMW} MW</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Bid Price:</span>
                                <span className="ml-1 text-gray-800">€{resolution.bidPricePerMW}/MW</span>
                              </div>
                              {resolution.status === 'accepted' && (
                                <>
                                  <div>
                                    <span className="font-medium text-gray-600">Accepted Power:</span>
                                    <span className="ml-1 text-gray-800">{resolution.acceptedPowerMW} MW</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-600">Payout:</span>
                                    <span className="ml-1 text-gray-800">€{resolution.payoutEUR.toLocaleString()}</span>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            <div className="mt-2 text-xs text-gray-600">
                              <span className="font-medium">Reason:</span> {resolution.reason}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  <button
                    onClick={() => controller.broadcastAllBids()}
                    disabled={!canBroadcastBids}
                    className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                      canBroadcastBids
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Broadcast All Bids
                  </button>
                </div>
              </div>

              {/* Notification */}
              {state.notification && (
                <div className={`p-4 rounded-lg ${
                  state.notification.includes('won') || state.notification.includes('successfully')
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <p className="font-medium">{state.notification}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - System Events - Right Half */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <h2 className="text-xl font-semibold mb-4 text-purple-700">System Events</h2>
            
            <div className="space-y-4">
              {!hasEvents ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">No events yet. Start the auction workflow to see events.</p>
                </div>
              ) : (
                state.events.map((event, index) => (
                  <div key={`${event.eventId}-${index}`} className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-400">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-purple-800 text-sm">{event.eventType}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      <p><span className="font-medium">Event ID:</span> {event.eventId}</p>
                      <p><span className="font-medium">Version:</span> {event.version}</p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Blockchain Transactions Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 mt-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Blockchain Transactions</h2>
            
            <div className="space-y-4">
              {state.transactions.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">No transactions yet. Events will automatically create blockchain transactions.</p>
                </div>
              ) : (
                state.transactions.map((transaction, index) => (
                  <div key={`${transaction.hash}-${index}`} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-blue-800 text-sm">
                        Transaction {transaction.status === 'pending' ? '⏳' : transaction.status === 'confirmed' ? '✅' : '❌'}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2 space-y-1">
                      <p><span className="font-medium">Hash:</span> <code className="bg-gray-200 px-1 rounded">{transaction.hash}</code></p>
                      <p><span className="font-medium">From:</span> <code className="bg-gray-200 px-1 rounded">{transaction.from}</code></p>
                      <p><span className="font-medium">To:</span> <code className="bg-gray-200 px-1 rounded">{transaction.to}</code></p>
                      <p><span className="font-medium">Gas Used:</span> {transaction.gasUsed}</p>
                      <p><span className="font-medium">Gas Price:</span> {transaction.gasPrice} wei</p>
                      {transaction.blockNumber && (
                        <p><span className="font-medium">Block:</span> {transaction.blockNumber}</p>
                      )}
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-xs text-gray-600 mb-1 font-medium">Transaction Data:</p>
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                        {transaction.data}
                      </pre>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}