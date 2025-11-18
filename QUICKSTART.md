# Quick Start Guide - Step by Step

## Prerequisites Check
- ✅ Node.js installed (v16+)
- ✅ MetaMask browser extension installed

---

## Step-by-Step Instructions

### **Step 1: Install Dependencies**

Open terminal in project root and run:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

### **Step 2: Start Local Blockchain**

Open a **new terminal** (keep it running) and execute:

```bash
npm run node
```

**What happens:**
- Local Hardhat network starts on `http://127.0.0.1:8545`
- You'll see a list of test accounts with private keys
- **Keep this terminal open!**

**Important:** Copy one of the private keys shown (you'll need it for MetaMask)

---

### **Step 3: Deploy the Smart Contract**

Open **another new terminal** and run:

```bash
npm run deploy:local
```

**What happens:**
- Contract compiles
- Contract deploys to local network
- Contract address is saved to `frontend/src/contractInfo.json`
- You'll see: "Storage contract deployed to: 0x..."

---

### **Step 4: Configure MetaMask**

#### 4a. Add Local Network to MetaMask

1. Open MetaMask extension
2. Click network dropdown (top of MetaMask)
3. Click "Add Network" → "Add a network manually"
4. Enter these details:
   - **Network Name:** `Hardhat Local`
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `1337`
   - **Currency Symbol:** `ETH`
5. Click "Save"

#### 4b. Import Test Account

1. In MetaMask, click account icon (top right)
2. Select "Import Account"
3. Paste one of the private keys from Step 2 terminal
4. Click "Import"
5. **Switch to "Hardhat Local" network** (use the network dropdown)

---

### **Step 5: Start Frontend Application**

Open **another new terminal** and run:

```bash
cd frontend
npm start
```

**What happens:**
- React app starts
- Browser automatically opens to `http://localhost:3000`
- If it doesn't open, manually go to `http://localhost:3000`

---

### **Step 6: Interact with the Contract**

1. **Connect Wallet:**
   - Click "Connect Wallet" button in the app
   - Approve connection in MetaMask popup

2. **View Current Value:**
   - The current stored value (initially 0) will be displayed

3. **Set New Value:**
   - Enter a number in the input field
   - Click "Set Value" button
   - Approve transaction in MetaMask popup
   - Wait for transaction confirmation
   - Value will update automatically

4. **Refresh Value:**
   - Click the "🔄 Refresh" button to manually reload the value

---

## Terminal Summary

You should have **3 terminals running:**

1. **Terminal 1:** `npm run node` (blockchain running)
2. **Terminal 2:** `npm run deploy:local` (already completed, can close)
3. **Terminal 3:** `cd frontend && npm start` (frontend running)

---

## Quick Commands Reference

```bash
# Start blockchain
npm run node

# Deploy contract
npm run deploy:local

# Start frontend
cd frontend && npm start

# Run tests
npm run test

# Compile contracts
npm run compile
```

---

## Troubleshooting

**Problem:** "MetaMask not connecting"
- ✅ Make sure MetaMask is on "Hardhat Local" network
- ✅ Check that blockchain is running (Terminal 1)
- ✅ Refresh the browser page

**Problem:** "Contract not found"
- ✅ Make sure you deployed the contract (Step 3)
- ✅ Check `frontend/src/contractInfo.json` has an address
- ✅ Redeploy: `npm run deploy:local`

**Problem:** "Transaction failed"
- ✅ Make sure you're on the correct network (Chain ID: 1337)
- ✅ Check you have ETH (test accounts come with 10000 ETH)
- ✅ Try refreshing the page

---

## Success Indicators

✅ Blockchain terminal shows "Started HTTP and WebSocket JSON-RPC server"
✅ Deploy script shows "Storage contract deployed to: 0x..."
✅ Frontend shows contract address on the page
✅ MetaMask connects successfully
✅ You can set and get values

---

**That's it! You're ready to interact with your blockchain smart contract! 🚀**



