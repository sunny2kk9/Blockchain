# Blockchain Getter/Setter Smart Contract Project

A complete blockchain project featuring a simple Storage smart contract with getter and setter functions, along with a React frontend to interact with it.

## Project Structure

```
Assignment 2/
├── contracts/
│   └── Storage.sol          # Solidity smart contract
├── scripts/
│   └── deploy.js            # Deployment script
├── frontend/
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   ├── App.css          # Styling
│   │   ├── index.js         # React entry point
│   │   ├── utils/
│   │   │   └── web3.js      # Web3 interaction utilities
│   │   └── contractInfo.json # Contract address (auto-generated)
│   ├── public/
│   │   └── index.html       # HTML template
│   └── package.json         # Frontend dependencies
├── hardhat.config.js         # Hardhat configuration
└── package.json              # Backend dependencies
```

## Features

- ✅ Simple Storage smart contract with getter/setter functions
- ✅ React frontend with modern UI
- ✅ MetaMask wallet integration
- ✅ Real-time value display and updates
- ✅ Transaction handling with user feedback

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension

## Installation

### 1. Install Backend Dependencies

```bash
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## Usage

### Step 1: Start Local Blockchain

Open a terminal and run:

```bash
npm run node
```

This starts a local Hardhat network. Keep this terminal running. You'll see a list of accounts with private keys - you can import these into MetaMask for testing.

### Step 2: Deploy the Contract

Open a new terminal and run:

```bash
npm run deploy:local
```

This will:
- Compile the smart contract
- Deploy it to the local network
- Save the contract address to `frontend/src/contractInfo.json`

### Step 3: Configure MetaMask

1. Open MetaMask extension
2. Click the network dropdown and select "Add Network"
3. Add a custom network with:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

4. Import a test account:
   - Copy one of the private keys from the Hardhat node terminal
   - In MetaMask, click the account icon → Import Account
   - Paste the private key

### Step 4: Start the Frontend

Open a new terminal and run:

```bash
cd frontend
npm start
```

The app will open in your browser at `http://localhost:3000`

### Step 5: Interact with the Contract

1. Click "Connect Wallet" and approve the connection in MetaMask
2. View the current stored value
3. Enter a new number and click "Set Value"
4. Approve the transaction in MetaMask
5. Wait for confirmation and see the updated value

## Smart Contract Details

### Storage.sol

The contract includes:

- **`setValue(uint256 _value)`**: Sets a new value in the contract
- **`getValue()`**: Returns the current stored value
- **`ValueChanged` event**: Emitted when the value changes

## Available Scripts

### Backend (Root Directory)

- `npm run compile` - Compile smart contracts
- `npm run node` - Start local Hardhat network
- `npm run deploy` - Deploy to default network
- `npm run deploy:local` - Deploy to local network
- `npm run test` - Run tests

### Frontend (frontend/ directory)

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Troubleshooting

### MetaMask Connection Issues

- Ensure MetaMask is installed and unlocked
- Make sure you're connected to the Hardhat Local network
- Check that the contract is deployed (contract address should appear)

### Transaction Failures

- Ensure you have ETH in your test account (Hardhat accounts come with 10000 ETH)
- Check that the contract address in `frontend/src/contractInfo.json` is correct
- Verify you're on the correct network (Chain ID: 1337)

### Contract Not Found

- Re-deploy the contract: `npm run deploy:local`
- Refresh the frontend page
- Check that `frontend/src/contractInfo.json` has a valid address

## Technologies Used

- **Solidity**: Smart contract language
- **Hardhat**: Ethereum development environment
- **React**: Frontend framework
- **ethers.js**: Ethereum library for frontend interaction
- **MetaMask**: Web3 wallet

## License

MIT

