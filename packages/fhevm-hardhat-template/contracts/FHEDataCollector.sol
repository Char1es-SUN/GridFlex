// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHEDataCollector is SepoliaConfig {
    //-/////////////////////////////////////////////////////////////////////////
    // State Variables
    //-/////////////////////////////////////////////////////////////////////////

    address public owner;
    mapping(address => uint) public userSubmissionIndex;
    bool public collecting; // Flag to control the data collection phase.

    // Storage for encrypted bid data submitted by users.
    euint32[] public bidprice;
    euint32[] public bidquantity;

    // Private array to track the identity of each submitter in order.
    address[] private _identity;

    // NEW: Storage for the final encrypted results.
    // Each element is a ciphertext encrypted with a specific user's public key.
    bytes[] public encryptedResolution;

    // NEW: Mapping to store public keys for each user.
    // Users must register their public key to receive a private result.
    // The key is used by the owner off-chain to encrypt the user's specific result.
    mapping(address => bytes) public userPublicKeys;

    //-/////////////////////////////////////////////////////////////////////////
    // Events
    //-/////////////////////////////////////////////////////////////////////////

    // NEW: Emitted when the data collection period starts.
    event CollectionStarted();

    // NEW: Emitted when the data collection period ends.
    event CollectionEnded();

    // NEW: Emitted when a user successfully submits their data.
    event DataSubmitted(address indexed submitter);

    // NEW: Emitted when a user registers or updates their public key.
    event PublicKeyRegistered(address indexed user, uint keyLength);

    // NEW: Emitted when the owner broadcasts the encrypted results.
    event ResultsBroadcasted(uint count);

    //-/////////////////////////////////////////////////////////////////////////
    // Constructor & Modifiers
    //-/////////////////////////////////////////////////////////////////////////

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

    //-/////////////////////////////////////////////////////////////////////////
    // Core Functions
    //-/////////////////////////////////////////////////////////////////////////

    /**
     * @notice NEW: Allows users to register their public key.
     * @dev This public key will be used by the owner off-chain to encrypt a result
     * that only this user can decrypt with their corresponding private key.
     * @param publicKey The user's public key as a bytes array.
     */
    function registerPublicKey(bytes calldata publicKey) external {
        require(publicKey.length > 0, "Public key cannot be empty");
        userPublicKeys[msg.sender] = publicKey;
        emit PublicKeyRegistered(msg.sender, publicKey.length);
    }

    /**
     * @notice Starts a new data collection round.
     * @dev Can only be called by the owner. It clears all previous data to
     * ensure a fresh start for the new round.
     */
    function startCollection() external onlyOwner {
        delete bidprice;
        delete bidquantity;
        delete _identity;
        delete encryptedResolution; // Clear previous results
        collecting = true;
        emit CollectionStarted();
    }

    /**
     * @notice Allows users to submit their encrypted data during a collection round.
     * @dev The user must have registered a public key before submitting.
     * The contract grants decryption permission for the submitted data to the owner.
     * @param _price Encrypted price.
     * @param priceProof Zama FHE proof for the price.
     * @param _quantity Encrypted quantity.
     * @param quantityProof Zama FHE proof for the quantity.
     */
    function submitData(
        externalEuint32 _price,
        bytes calldata priceProof,
        externalEuint32 _quantity,
        bytes calldata quantityProof
    ) external isCollecting {
        // UPDATED: Require a public key to be registered before submission.
        require(userPublicKeys[msg.sender].length > 0, "Public key not registered");

        euint32 price = FHE.fromExternal(_price, priceProof);
        euint32 quantity = FHE.fromExternal(_quantity, quantityProof);

        FHE.allowThis(price);
        FHE.allowThis(quantity);
        // Grant decryption permission to the contract owner.
        // This allows the owner to decrypt this data off-chain.
        FHE.allow(price, owner);
        FHE.allow(quantity, owner);

        bidprice.push(price);
        bidquantity.push(quantity);
        _identity.push(msg.sender);
        userSubmissionIndex[msg.sender] = _identity.length - 1;

        emit DataSubmitted(msg.sender);
    }

    /**
     * @notice Ends the current data collection round.
     * @dev Can only be called by the owner.
     */
    function endCollection() external onlyOwner isCollecting {
        collecting = false;
        emit CollectionEnded();
    }

    /**
     * @notice MODIFIED: Broadcasts the encrypted results to the chain.
     * @dev This is called by the owner after they have computed the results off-chain
     * and encrypted each result with the corresponding user's public key.
     * @param _encryptedResolutions An array of ciphertexts (bytes).
     */
    function broadcastEncryptedResults(bytes[] calldata _encryptedResolutions) external onlyOwner isNotCollecting {
        require(_encryptedResolutions.length == _identity.length, "Broadcast length must match collected data");
        encryptedResolution = _encryptedResolutions;
        emit ResultsBroadcasted(_encryptedResolutions.length);
    }

    //-/////////////////////////////////////////////////////////////////////////
    // View Functions
    //-/////////////////////////////////////////////////////////////////////////

    /**
     * @notice Allows the owner to retrieve all collected encrypted data for off-chain processing.
     */
    function getCollectedData() external view onlyOwner returns (euint32[] memory, euint32[] memory) {
        return (bidprice, bidquantity);
    }

    /**
     * @notice MODIFIED: Allows anyone to view the broadcasted encrypted results.
     * @dev Users will fetch these bytes and decrypt their specific result off-chain
     * using their private key.
     */
    function getBroadcastData() external view returns (bytes[] memory) {
        return encryptedResolution;
    }

    /**
     * @notice Helper function to get the number of data submissions.
     */
    function getSubmissionCount() external view returns (uint) {
        return _identity.length;
    }
}
