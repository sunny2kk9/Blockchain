require('dotenv').config();
const { ethers } = require('ethers');

// RPC URL must match the one in hardhat.config.js
const RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/8M-A8S59VNodqtUAIom94hhtunRlqYHF';

const PK = process.env.PRIVATE_KEY;
if (!PK) {
  console.error('No PRIVATE_KEY found in .env');
  process.exit(1);
}

const wallet = new ethers.Wallet(PK);
const provider = new ethers.JsonRpcProvider(RPC_URL);

(async () => {
  try {
    console.log('Address:', wallet.address);
    const bal = await provider.getBalance(wallet.address);
    console.log('Deployer balance (wei):', bal.toString());
    console.log('Deployer balance (eth):', ethers.formatEther(bal));
  } catch (err) {
    console.error('Error fetching balance:', err.message || err);
    process.exit(1);
  }
})();
