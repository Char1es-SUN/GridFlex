// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title EventStorage
 * @dev Simple contract to store grid flexibility events on-chain
 */
contract EventStorage {
    struct EventData {
        string eventType;
        string eventId;
        uint256 timestamp;
        string payload;
        address sender;
        uint256 blockNumber;
    }

    EventData[] public events;
    mapping(string => uint256) public eventIdToIndex;

    event EventStored(
        uint256 indexed index,
        string eventType,
        string eventId,
        address indexed sender
    );

    /**
     * @dev Store an event on-chain
     * @param eventType The type of event (e.g., "auction.broadcasted")
     * @param eventId Unique identifier for the event
     * @param payload JSON string containing event data
     */
    function storeEvent(
        string memory eventType,
        string memory eventId,
        string memory payload
    ) external {
        require(bytes(eventId).length > 0, "Event ID cannot be empty");
        require(eventIdToIndex[eventId] == 0, "Event ID already exists");

        EventData memory newEvent = EventData({
            eventType: eventType,
            eventId: eventId,
            timestamp: block.timestamp,
            payload: payload,
            sender: msg.sender,
            blockNumber: block.number
        });

        events.push(newEvent);
        eventIdToIndex[eventId] = events.length;

        emit EventStored(events.length - 1, eventType, eventId, msg.sender);
    }

    /**
     * @dev Get the total number of events stored
     * @return The number of events
     */
    function getEventCount() external view returns (uint256) {
        return events.length;
    }

    /**
     * @dev Get event data by index
     * @param index The index of the event
     * @return The event data
     */
    function getEvent(uint256 index) external view returns (EventData memory) {
        require(index < events.length, "Event index out of bounds");
        return events[index];
    }

    /**
     * @dev Get event data by event ID
     * @param eventId The event ID to search for
     * @return The event data
     */
    function getEventById(string memory eventId) external view returns (EventData memory) {
        uint256 index = eventIdToIndex[eventId];
        require(index > 0, "Event not found");
        return events[index - 1];
    }

    /**
     * @dev Get all events (for testing purposes)
     * @return Array of all events
     */
    function getAllEvents() external view returns (EventData[] memory) {
        return events;
    }
}
