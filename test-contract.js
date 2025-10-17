const { ethers } = require('ethers');

async function testContract() {
  try {
    // Connect to Hardhat node
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    
    // Get the first account (deployer)
    const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('Wallet address:', wallet.address);
    
    // Contract ABI
    const abi = [
      "function storeEvent(string memory eventType, string memory eventId, string memory payload) external",
      "function getEventCount() external view returns (uint256)"
    ];
    
    // Contract address
    const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    
    console.log('Contract connected at:', contractAddress);
    
    // Test storing an event
    const tx = await contract.storeEvent(
      'test.event',
      'test-123',
      '{"test": "data"}'
    );
    
    console.log('Transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    
    // Check event count
    const count = await contract.getEventCount();
    console.log('Total events stored:', count.toString());
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testContract();
