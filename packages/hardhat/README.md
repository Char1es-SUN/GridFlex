# @ethrome2025/hardhat

FHEVM-based smart contracts for grid flexibility market operations.

## Overview

This package contains the smart contract implementation for the grid flexibility market demo, built with Hardhat and FHEVM for privacy-preserving computations.

## Features

- **FHEVM Integration**: Privacy-preserving smart contract operations
- **Grid Flexibility Contracts**: Core market functionality
- **Comprehensive Testing**: Full test coverage for all contracts
- **Deployment Scripts**: Automated deployment to local and testnet
- **TypeScript Support**: Full type safety and IntelliSense

## Contracts

### FHECounter.sol
A simple FHEVM-enabled counter contract demonstrating privacy-preserving operations.

## Scripts

### Development
```bash
npm run compile          # Compile contracts
npm run test            # Run all tests
npm run test:sepolia    # Run tests on Sepolia
npm run chain           # Start local blockchain
```

### Deployment
```bash
npm run deploy:localhost    # Deploy to localhost
npm run deploy:sepolia      # Deploy to Sepolia testnet
npm run verify:sepolia      # Verify contracts on Etherscan
```

### Code Quality
```bash
npm run lint              # Run linting
npm run lint:sol          # Lint Solidity files
npm run lint:ts           # Lint TypeScript files
npm run prettier:check    # Check code formatting
npm run prettier:write    # Format code
```

## Configuration

### Hardhat Config
The `hardhat.config.ts` file contains:
- Network configurations (localhost, Sepolia)
- FHEVM plugin configuration
- Compiler settings
- Gas reporter configuration

### TypeScript Config
The `tsconfig.json` file provides:
- Strict type checking
- Path mapping for imports
- Target ES2020 for modern features

## Testing

### Test Structure
- `test/FHECounter.ts`: Basic FHEVM counter tests
- `test/FHECounterSepolia.ts`: Sepolia-specific tests

### Running Tests
```bash
# Run all tests
npm run test

# Run specific test file
npx hardhat test test/FHECounter.ts

# Run with gas reporting
npm run coverage
```

## Deployment

### Local Development
1. Start local blockchain: `npm run chain`
2. Deploy contracts: `npm run deploy:localhost`

### Sepolia Testnet
1. Configure `.env` with your private key and RPC URL
2. Deploy: `npm run deploy:sepolia`
3. Verify: `npm run verify:sepolia`

## Dependencies

### Core Dependencies
- `@fhevm/solidity`: FHEVM Solidity library
- `@zama-fhe/oracle-solidity`: FHEVM oracle contracts
- `encrypted-types`: TypeScript types for encrypted data

### Development Dependencies
- `hardhat`: Ethereum development environment
- `@fhevm/hardhat-plugin`: FHEVM Hardhat integration
- `ethers`: Ethereum library
- `chai`: Testing framework
- `mocha`: Test runner

## Troubleshooting

### Common Issues

1. **Compilation Errors**: Ensure all dependencies are installed
2. **Test Failures**: Check network configuration and private keys
3. **Deployment Issues**: Verify RPC URLs and private key configuration

### Getting Help

- Check the [FHEVM Documentation](https://docs.zama.ai/fhevm)
- Review Hardhat configuration
- Check test logs for specific error messages

## License

MIT License - see LICENSE file for details.
