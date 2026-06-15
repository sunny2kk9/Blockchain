// --- 1. PASTE YOUR CONTRACT INFO HERE ---

// Paste your new SimpleLending contract address (from Sepolia)
const contractAddress = "0xf7a6cb7445e9d62f7ac1bfea1465aae413868d11";

// Paste the giant ABI you copied from Remix
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_collateralAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_borrowAmount",
				"type": "uint256"
			}
		],
		"name": "borrow",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "liquidate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "pause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_loanToken",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_collateralToken",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_priceFeed",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "SafeERC20FailedOperation",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "collateral",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "loanAmount",
				"type": "uint256"
			}
		],
		"name": "Borrowed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Deposited",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "liquidator",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "collateralSeized",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "debtRepaid",
				"type": "uint256"
			}
		],
		"name": "Liquidated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Paused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "principal",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "interest",
				"type": "uint256"
			}
		],
		"name": "Repaid",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_repayAmount",
				"type": "uint256"
			}
		],
		"name": "repay",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_ratio",
				"type": "uint256"
			}
		],
		"name": "setCollateralizationRatio",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_ratePerYear",
				"type": "uint256"
			}
		],
		"name": "setInterestRate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_threshold",
				"type": "uint256"
			}
		],
		"name": "setLiquidationThreshold",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newPriceFeed",
				"type": "address"
			}
		],
		"name": "setPriceFeed",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "unpause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_withdrawAmount",
				"type": "uint256"
			}
		],
		"name": "withdrawCollateral",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Withdrawn",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "borrows",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "collateralAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "borrowedAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "borrowTimestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "collateralizationRatio",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "collateralToken",
		"outputs": [
			{
				"internalType": "contract IERC20Metadata",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_collateralAmount",
				"type": "uint256"
			}
		],
		"name": "getCollateralValue",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getDebtAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getHealthFactor",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_collateralAmount",
				"type": "uint256"
			}
		],
		"name": "getMaxBorrowable",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "interestRatePerYear",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "lenderDeposits",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "liquidationThreshold",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "loanToken",
		"outputs": [
			{
				"internalType": "contract IERC20Metadata",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "priceFeed",
		"outputs": [
			{
				"internalType": "contract AggregatorV3Interface",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalDeposited",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// --- 2. GLOBAL VARIABLES ---
let provider;
let signer;
let contract;

// --- 3. GET HTML ELEMENTS ---
const connectButton = document.getElementById('connectButton');
const statusSpan = document.getElementById('status');
const getHealthFactorButton = document.getElementById('getHealthFactorButton');
const healthFactorAddressInput = document.getElementById('healthFactorAddress');
const healthFactorResult = document.getElementById('healthFactorResult');
const depositButton = document.getElementById('depositButton');
const depositAmountInput = document.getElementById('depositAmount');
const depositStatus = document.getElementById('depositStatus');

// --- 4. FUNCTIONS ---

/**
 * Connects to the user's MetaMask wallet
 */
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        statusSpan.innerText = "Please install MetaMask!";
        return;
    }

    try {
        // Get the provider and request accounts
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);

        // Get the signer (the user's wallet)
        signer = provider.getSigner();
        const userAddress = await signer.getAddress();

        // Create a contract instance
        contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Update the UI
        statusSpan.innerText = `Connected: ${userAddress.substring(0, 6)}...`;
        connectButton.innerText = "Connected";
    } catch (error) {
        console.error(error);
        statusSpan.innerText = "Connection failed.";
    }
}

/**
 * Fetches the health factor for a given address
 */
async function fetchHealthFactor() {
    if (!contract) {
        alert("Please connect your wallet first.");
        return;
    }

    const addressToCheck = healthFactorAddressInput.value;
    if (!addressToCheck) {
        alert("Please enter an address to check.");
        return;
    }

    try {
        healthFactorResult.innerText = "Fetching...";

        // Call the "getHealthFactor" function from your smart contract
        const healthFactor = await contract.getHealthFactor(addressToCheck);

        // Display the result. .toString() is important!
        healthFactorResult.innerText = healthFactor.toString();

    } catch (error) {
        console.error(error);
        healthFactorResult.innerText = "Error";
    }
}

/**
 * A (simplified) deposit function.
 * NOTE: For a real deposit, you MUST call the Token A contract's
 * "approve" function first! This example just shows the 'deposit' call.
 */
async function depositTokens() {
    if (!contract) {
        alert("Please connect your wallet first.");
        return;
    }

    const amount = depositAmountInput.value;
    if (!amount) {
        alert("Please enter an amount.");
        return;
    }

    // Convert the amount to the correct format (Wei)
    // Assumes your Token A has 18 decimals, like in the mock
    const amountInWei = ethers.utils.parseUnits(amount, 18);

    try {
        depositStatus.innerText = "Sending transaction... Please check MetaMask.";

        // This is a "write" transaction, so it needs gas
        // Call the "deposit" function from your smart contract
        const tx = await contract.deposit(amountInWei);

        // Wait for the transaction to be mined
        await tx.wait();

        depositStatus.innerText = "Deposit successful! Transaction hash: " + tx.hash;
    } catch (error) {
        console.error(error);
        depositStatus.innerText = "Deposit failed.";
    }
}

// --- 5. ATTACH FUNCTIONS TO BUTTONS ---
connectButton.addEventListener('click', connectWallet);
getHealthFactorButton.addEventListener('click', fetchHealthFactor);
depositButton.addEventListener('click', depositTokens); // Note: This is simplified