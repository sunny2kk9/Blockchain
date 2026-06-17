import { ethers } from 'ethers';
import contractInfo from '../contractInfo.json';

// Contract ABI - Application Binary Interface
const CONTRACT_ABI = [
  "function getValue() public view returns (uint256)",
  "function setValue(uint256 _value) public",
  "event ValueChanged(uint256 oldValue, uint256 newValue)"
];

// Allowed test network chain IDs (mainnet = 1 is NOT allowed)
const ALLOWED_TEST_NETWORKS = {
  1337: 'Hardhat Local',
  11155111: 'Sepolia',
  5: 'Goerli',
  80001: 'Mumbai (Polygon Testnet)',
  97: 'BSC Testnet',
  421613: 'Arbitrum Goerli',
  43113: 'Avalanche Fuji'
};

// Mainnet chain ID - explicitly blocked
const MAINNET_CHAIN_ID = 1;

let contract = null;
let provider = null;
let signer = null;

// Check if current network is a test network
export const checkNetwork = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed. Please install MetaMask to use this app.');
  }

  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  const chainIdDecimal = parseInt(chainId, 16);

  // Block mainnet explicitly
  if (chainIdDecimal === MAINNET_CHAIN_ID) {
    throw new Error(
      '⚠️ Mainnet is not allowed! This app only works with test networks. ' +
      'Please switch to a test network (Hardhat Local, Sepolia, Goerli, etc.) in MetaMask.'
    );
  }

  // Check if it's an allowed test network
  if (!ALLOWED_TEST_NETWORKS[chainIdDecimal]) {
    throw new Error(
      `⚠️ Unsupported network (Chain ID: ${chainIdDecimal}). ` +
      `Please switch to one of these test networks: ${Object.values(ALLOWED_TEST_NETWORKS).join(', ')}`
    );
  }

  return {
    chainId: chainIdDecimal,
    networkName: ALLOWED_TEST_NETWORKS[chainIdDecimal]
  };
};

// Switch to localhost network if available
export const switchToLocalhost = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x539' }], // 1337 in hex
    });
  } catch (switchError) {
    // If the chain doesn't exist, try to add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x539',
            chainName: 'Hardhat Local',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['http://127.0.0.1:8545'],
            blockExplorerUrls: null
          }],
        });
      } catch (addError) {
        throw new Error('Failed to add Hardhat Local network to MetaMask');
      }
    } else {
      throw switchError;
    }
  }
};

// Initialize provider and contract
export const initContract = async () => {
  if (typeof window.ethereum !== 'undefined') {
    // Check network before initializing
    const networkInfo = await checkNetwork();
    
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractInfo.address, CONTRACT_ABI, signer);
    
    return { contract, networkInfo };
  } else {
    throw new Error('MetaMask is not installed. Please install MetaMask to use this app.');
  }
};

// Connect wallet
export const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed. Please install MetaMask extension.');
  }

  try {
    // Check current network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const chainIdDecimal = parseInt(chainId, 16);
    
    // If on mainnet, try to automatically switch to Hardhat Local
    if (chainIdDecimal === MAINNET_CHAIN_ID) {
      try {
        await switchToLocalhost();
        // Wait a moment for the switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (switchError) {
        throw new Error(
          '⚠️ Mainnet is not allowed! This app only works with test networks. ' +
          'Please switch to "Hardhat Local" network in MetaMask manually, or approve the network switch prompt.'
        );
      }
    }
    
    // Check network again after potential switch
    const networkInfo = await checkNetwork();
    
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask and try again.');
    }
    
    // Initialize contract after connecting
    await initContract();
    
    return { account: accounts[0], networkInfo };
  } catch (error) {
    console.error('Wallet connection error:', error);
    
    // Handle specific error cases
    if (error.code === 4001) {
      throw new Error('Connection rejected. Please approve the connection in MetaMask.');
    }
    
    if (error.message?.includes('Mainnet') || error.message?.includes('test network') || error.message?.includes('not allowed')) {
      throw error; // Re-throw network errors as-is
    }
    
    if (error.message?.includes('MetaMask')) {
      throw error; // Re-throw MetaMask errors as-is
    }
    
    throw new Error(error.message || 'Failed to connect wallet. Please check MetaMask and try again.');
  }
};

// Get contract instance
export const getContract = async () => {
  if (!contract) {
    const result = await initContract();
    contract = result.contract;
  }
  return contract;
};

// Get current value from contract
export const getCurrentValue = async () => {
  try {
    const contractInstance = await getContract();
    
    // Check if contract exists at the address
    const code = await provider.getCode(contractInfo.address);
    if (code === '0x' || code === '0x0') {
      throw new Error('Contract not found at this address. Please redeploy the contract.');
    }
    
    const value = await contractInstance.getValue();
    return value.toString();
  } catch (error) {
    console.error('Get value error:', error);
    
    // Provide more helpful error messages
    if (error.message?.includes('could not decode') || error.message?.includes('BAD_DATA')) {
      throw new Error('Contract not found or address mismatch. Please redeploy: npm run deploy:local');
    }
    
    throw new Error(`Failed to get value: ${error.message}`);
  }
};

// Check account balance
export const checkBalance = async () => {
  try {
    if (!signer) {
      await initContract();
    }
    const balance = await provider.getBalance(await signer.getAddress());
    return balance;
  } catch (error) {
    throw new Error(`Failed to check balance: ${error.message}`);
  }
};

// Set new value in contract
export const setValue = async (value) => {
  try {
    // Check balance before attempting transaction
    const balance = await checkBalance();
    if (balance === 0n) {
      throw new Error(
        '⚠️ Your account has no ETH! Please import a test account with ETH. ' +
        'Check the Hardhat node terminal for test account private keys. ' +
        'Each test account comes with 10,000 ETH on Hardhat Local network.'
      );
    }
    
    const contractInstance = await getContract();
    const tx = await contractInstance.setValue(value);
    return tx;
  } catch (error) {
    // Check for user rejection in various error formats
    if (error.code === 4001 || 
        error.code === 'ACTION_REJECTED' ||
        error.message?.includes('user rejected') ||
        error.message?.includes('User denied') ||
        error.reason === 'rejected') {
      throw new Error('Transaction cancelled. You rejected the transaction in MetaMask.');
    }
    
    // Re-throw balance errors as-is
    if (error.message?.includes('no ETH') || error.message?.includes('balance')) {
      throw error;
    }
    
    throw new Error(`Failed to set value: ${error.message}`);
  }
};

