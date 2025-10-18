// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHEDataCollector is SepoliaConfig {
    address public owner;
    euint32[] public bidprice;
    euint32[] public bidquantity;
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

    function submitData(
        externalEuint32 _price,
        bytes calldata priceProof,
        externalEuint32 _quantity,
        bytes calldata quantityProof
    ) external isCollecting {
        euint32 price = FHE.fromExternal(_price, priceProof);
        euint32 quantity = FHE.fromExternal(_quantity, quantityProof);

        FHE.allowThis(price);
        FHE.allowThis(quantity);
        FHE.allow(price, owner);
        FHE.allow(quantity, owner);

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

    function getCollectedData() external view onlyOwner returns (euint32[] memory, euint32[] memory) {
        return (bidprice, bidquantity);
    }

    function getBroadcastData() external view returns (bool[] memory) {
        return resolution;
    }
}
