// Contract ABI - This should match your compiled contract
const CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "uint256", "name": "initialValue", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": false, "internalType": "uint256", "name": "oldValue", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "newValue", "type": "uint256"}
        ],
        "name": "ValueChanged",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "getValue",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "newValue", "type": "uint256"}],
        "name": "setValue",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

let provider;
let signer;
let contract;
let contractAddress = '';

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Check if already connected
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
            updateWalletStatus(accounts[0]);
        }
    } else {
        alert('Please install MetaMask to use this application!');
        document.getElementById('connect-btn').disabled = true;
    }

    // Event listeners
    document.getElementById('connect-btn').addEventListener('click', connectWallet);
    document.getElementById('load-contract-btn').addEventListener('click', loadContract);
    document.getElementById('get-value-btn').addEventListener('click', getValue);
    document.getElementById('set-value-btn').addEventListener('click', setValue);

    // Listen for account changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                updateWalletStatus(accounts[0]);
                if (contractAddress) {
                    loadContract();
                }
            } else {
                resetWalletStatus();
            }
        });
    }
}

async function connectWallet() {
    try {
        if (typeof window.ethereum === 'undefined') {
            alert('MetaMask is not installed. Please install it to continue.');
            return;
        }

        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        const address = await signer.getAddress();
        
        updateWalletStatus(address);
        addEvent('Wallet connected successfully', 'success');
    } catch (error) {
        console.error('Error connecting wallet:', error);
        addEvent('Error connecting wallet: ' + error.message, 'error');
    }
}

function updateWalletStatus(address) {
    document.getElementById('wallet-status').textContent = 'Connected';
    document.getElementById('wallet-status').style.background = '#d4edda';
    document.getElementById('wallet-status').style.color = '#155724';
    document.getElementById('wallet-address').textContent = `Address: ${address}`;
    document.getElementById('connect-btn').textContent = 'Wallet Connected';
    document.getElementById('connect-btn').disabled = true;
}

function resetWalletStatus() {
    document.getElementById('wallet-status').textContent = 'Not Connected';
    document.getElementById('wallet-status').style.background = '#fff';
    document.getElementById('wallet-address').textContent = '';
    document.getElementById('connect-btn').textContent = 'Connect Wallet';
    document.getElementById('connect-btn').disabled = false;
    contract = null;
}

async function loadContract() {
    try {
        contractAddress = document.getElementById('contract-address').value.trim();
        
        if (!contractAddress) {
            showStatus('contract-status', 'Please enter a contract address', 'error');
            return;
        }

        if (!ethers.utils.isAddress(contractAddress)) {
            showStatus('contract-status', 'Invalid contract address format', 'error');
            return;
        }

        if (!signer) {
            showStatus('contract-status', 'Please connect your wallet first', 'error');
            return;
        }

        contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
        
        // Test connection by calling a view function
        try {
            await contract.getValue();
            showStatus('contract-status', 'Contract loaded successfully!', 'success');
            addEvent(`Contract loaded at ${contractAddress}`, 'info');
            
            // Automatically get the current value
            await getValue();
        } catch (error) {
            showStatus('contract-status', 'Error: Contract may not be deployed at this address', 'error');
            addEvent('Error loading contract: ' + error.message, 'error');
        }
    } catch (error) {
        console.error('Error loading contract:', error);
        showStatus('contract-status', 'Error: ' + error.message, 'error');
    }
}

async function getValue() {
    try {
        if (!contract) {
            showStatus('contract-status', 'Please load a contract first', 'error');
            return;
        }

        const value = await contract.getValue();
        document.getElementById('current-value').textContent = value.toString();
        addEvent(`Retrieved value: ${value.toString()}`, 'success');
    } catch (error) {
        console.error('Error getting value:', error);
        addEvent('Error getting value: ' + error.message, 'error');
    }
}

async function setValue() {
    try {
        if (!contract) {
            showStatus('set-status', 'Please load a contract first', 'error');
            return;
        }

        const newValue = document.getElementById('new-value').value;
        
        if (newValue === '') {
            showStatus('set-status', 'Please enter a value', 'error');
            return;
        }

        const value = ethers.BigNumber.from(newValue);
        
        showStatus('set-status', 'Transaction pending...', 'info');
        document.getElementById('set-value-btn').disabled = true;

        // Send transaction
        const tx = await contract.setValue(value);
        addEvent(`Transaction sent: ${tx.hash}`, 'info');
        
        showStatus('set-status', 'Waiting for confirmation...', 'info');
        
        // Wait for transaction to be mined
        await tx.wait();
        
        showStatus('set-status', 'Value updated successfully!', 'success');
        addEvent(`Value changed to ${newValue}`, 'success');
        
        // Update the displayed value
        await getValue();
        
        document.getElementById('set-value-btn').disabled = false;
        document.getElementById('new-value').value = '';
    } catch (error) {
        console.error('Error setting value:', error);
        showStatus('set-status', 'Error: ' + error.message, 'error');
        addEvent('Error setting value: ' + error.message, 'error');
        document.getElementById('set-value-btn').disabled = false;
    }
}

function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `status ${type}`;
}

function addEvent(message, type = 'info') {
    const eventsLog = document.getElementById('events-log');
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item';
    
    const time = new Date().toLocaleTimeString();
    eventItem.innerHTML = `
        <strong>[${type.toUpperCase()}]</strong> ${message}
        <span class="event-time">${time}</span>
    `;
    
    eventsLog.insertBefore(eventItem, eventsLog.firstChild);
    
    // Keep only last 20 events
    while (eventsLog.children.length > 20) {
        eventsLog.removeChild(eventsLog.lastChild);
    }
}

