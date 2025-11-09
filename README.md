# Blockchain Lab - Storage Contract

A simple blockchain lab project featuring a smart contract with getter and setter functions, along with a modern web frontend to interact with it.

## Project Structure

```
.
├── contracts/
│   └── Storage.sol          # Solidity smart contract
├── index.html               # Frontend HTML
├── styles.css               # Frontend styling
├── app.js                   # Frontend JavaScript logic
├── package.json             # Node.js dependencies
└── README.md                # This file
```

## Smart Contract

The `Storage.sol` contract includes:
- **Constructor**: Initializes the contract with an initial value
- **setValue(uint256)**: Setter function to update the stored value
- **getValue()**: Getter function to retrieve the current value
- **Events**: Emits `ValueChanged` event when value is updated

## Frontend Features

- 🔗 **Wallet Connection**: Connect MetaMask wallet
- 📝 **Contract Loading**: Load and interact with deployed contracts
- 📖 **Get Value**: Read the current stored value
- ✏️ **Set Value**: Update the stored value (requires transaction)
- 📊 **Event Logging**: View contract events and transaction history

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Compile and Deploy Contract

You'll need to compile and deploy the contract using:
- **Remix IDE**: https://remix.ethereum.org (recommended for beginners)
- **Hardhat**: For local development
- **Truffle**: Alternative framework

#### Using Remix IDE:
1. Go to https://remix.ethereum.org
2. Create a new file `Storage.sol` and paste the contract code
3. Compile the contract (Solidity compiler)
4. Deploy to a test network (e.g., Sepolia, Goerli) or local network
5. Copy the deployed contract address

### 3. Run Frontend

```bash
npm start
```

Or use any local server:
```bash
npx http-server -p 8080
```

Then open `http://localhost:8080` in your browser.

### 4. Connect and Use

1. **Install MetaMask**: Make sure MetaMask browser extension is installed
2. **Connect Wallet**: Click "Connect Wallet" button
3. **Load Contract**: Paste your deployed contract address and click "Load Contract"
4. **Interact**: Use "Get Value" to read and "Set Value" to update

## Requirements

- **MetaMask**: Browser extension for wallet connection
- **Node.js**: For running the local server (optional)
- **Test Network**: Deploy to a test network (Sepolia, Goerli) or local blockchain

## Contract Deployment

When deploying the contract, you'll need to provide an initial value in the constructor. For example:
- Initial value: `100`

## Network Configuration

The frontend works with any Ethereum-compatible network:
- Ethereum Mainnet
- Sepolia Testnet
- Goerli Testnet
- Local development networks (Ganache, Hardhat Network)

Make sure your MetaMask is connected to the same network where the contract is deployed.

## Troubleshooting

- **"MetaMask not found"**: Install MetaMask browser extension
- **"Invalid contract address"**: Check the address format (should start with 0x)
- **"Transaction failed"**: Ensure you have enough ETH for gas fees
- **"Contract not found"**: Verify the contract is deployed on the current network

## License

MIT
