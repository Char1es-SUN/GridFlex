// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract DataCollector {
    address public owner;
    string[] public bids;
    string[] public resolution;
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
        delete bids;
        delete resolution;
        collecting = true;
    }

    function submitData(string calldata data) external isCollecting {
        bids.push(data);
    }

    function endCollection() external onlyOwner isCollecting {
        collecting = false;
    }

    function broadcast(string[] calldata data) external onlyOwner isNotCollecting {
        require(data.length == bids.length, "Broadcast length must match collected data");
        delete resolution;
        for (uint i = 0; i < data.length; i++) {
            resolution.push(data[i]);
        }
    }

    function getCollectedData() external view onlyOwner returns (string[] memory) {
        return bids;
    }

    function getBroadcastData() external view returns (string[] memory) {
        return resolution;
    }
}
