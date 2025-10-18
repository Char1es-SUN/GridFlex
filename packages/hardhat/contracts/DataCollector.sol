// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DataCollector {
    address public owner;
    string[] public collectedData;
    string[] public broadcastData;
    bool public collecting;

    constructor() {
        owner = msg.sender;
        collecting = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    modifier isCollecting() {
        require(collecting, "Data collection is not active");
        _;
    }

    modifier isNotCollecting() {
        require(!collecting, "Cannot perform this action while collecting");
        _;
    }

    function startCollection() external onlyOwner {
        delete collectedData;
        delete broadcastData;
        collecting = true;
    }

    function submitData(string calldata data) external isCollecting {
        collectedData.push(data);
    }

    function endCollection() external onlyOwner isCollecting {
        collecting = false;
    }

    function broadcast(string[] calldata data) external onlyOwner isNotCollecting {
        require(data.length == collectedData.length, "Broadcast length must match collected data");
        delete broadcastData;
        for (uint i = 0; i < data.length; i++) {
            broadcastData.push(data[i]);
        }
    }

    function getCollectedData() external view onlyOwner returns (string[] memory) {
        return collectedData;
    }

    function getBroadcastData() external view returns (string[] memory) {
        return broadcastData;
    }
}
