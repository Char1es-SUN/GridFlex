// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DataCollector {
    address public owner;
    uint32[] public bidprice;
    uint32[] public bidquantity;
    bool[] public resolution;
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
        delete bidprice;
        delete bidquantity;
        delete resolution;
        collecting = true;
    }

    function submitData(uint32 price, uint32 quantity) external isCollecting {
        require(price < 2 ** 23, "price exceeds uint23");
        require(quantity < 2 ** 23, "quantity exceeds uint23");

        bidprice.push(price);
        bidquantity.push(quantity);
    }

    function endCollection() external onlyOwner isCollecting {
        collecting = false;
    }

    function broadcast(bool[] calldata _resolution) external onlyOwner isNotCollecting {
        require(_resolution.length == bidprice.length, "Broadcast length must match collected data");
        resolution = _resolution;
    }

    function getCollectedData() external view onlyOwner returns (uint32[] memory, uint32[] memory) {
        return (bidprice, bidquantity);
    }

    function getBroadcastData() external view returns (bool[] memory) {
        return resolution;
    }
}
