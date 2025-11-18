import React, { useState, useEffect } from 'react';
import './App.css';
import { connectWallet, getContract, getCurrentValue, setValue, checkNetwork, checkBalance } from './utils/web3';

function App() {
  const [account, setAccount] = useState('');
  const [connected, setConnected] = useState(false);
  const [currentValue, setCurrentValue] = useState('0');
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [accountBalance, setAccountBalance] = useState('');

  useEffect(() => {
    // Load contract address
    try {
      const contractInfo = require('./contractInfo.json');
      setContractAddress(contractInfo.address);
    } catch (err) {
      setError('Contract not deployed. Please deploy the contract first.');
    }

    // Check if already connected
    checkConnection();

    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', async (chainId) => {
        // Reload page on network change to reset state
        window.location.reload();
      });

      window.ethereum.on('accountsChanged', async (accounts) => {
        // Reload page on account change
        window.location.reload();
      });

      // Cleanup listener on unmount
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('chainChanged', () => {});
        }
      };
    }
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        // Check network first
        const networkInfo = await checkNetwork();
        setNetworkName(networkInfo.networkName);
        
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setConnected(true);
          loadCurrentValue();
          loadBalance();
        }
      } catch (err) {
        // Network error - show it but don't block if not connected yet
        if (err.message?.includes('Mainnet') || err.message?.includes('test network')) {
          setError(err.message);
        }
      }
    }
  };

  const handleConnect = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await connectWallet();
      setAccount(result.account);
      setNetworkName(result.networkInfo.networkName);
      setConnected(true);
      await loadCurrentValue();
      await loadBalance();
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentValue = async () => {
    try {
      setError('');
      const value = await getCurrentValue();
      setCurrentValue(value);
    } catch (err) {
      setError(err.message || 'Failed to load value');
    }
  };

  const loadBalance = async () => {
    try {
      const balance = await checkBalance();
      const balanceInEth = parseFloat(balance.toString()) / 1e18;
      setAccountBalance(balanceInEth.toFixed(4));
    } catch (err) {
      console.error('Failed to load balance:', err);
      setAccountBalance('N/A');
    }
  };

  const handleSetValue = async () => {
    if (!newValue || isNaN(newValue)) {
      setError('Please enter a valid number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const tx = await setValue(newValue);
      console.log('Transaction sent:', tx.hash);
      
      // Wait for transaction to be mined
      console.log('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Wait a bit more to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload the value
      setNewValue('');
      await loadCurrentValue();
      alert('Value updated successfully!');
    } catch (err) {
      console.error('Set value error:', err);
      // Don't show error if user intentionally cancelled
      if (err.message?.includes('cancelled') || err.message?.includes('rejected')) {
        setError(''); // Clear error - user cancelled intentionally
      } else {
        setError(err.message || 'Failed to set value');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1 className="title">🔗 Storage Contract</h1>
        <p className="subtitle">Getter & Setter Smart Contract Interface</p>

        {contractAddress && (
          <div className="contract-info">
            <p><strong>Contract Address:</strong></p>
            <p className="address">{contractAddress}</p>
          </div>
        )}

        {!connected ? (
          <div className="connect-section">
            <button className="connect-btn" onClick={handleConnect} disabled={loading}>
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
            <p className="hint">Connect your MetaMask wallet to interact with the contract</p>
            <p className="hint" style={{fontSize: '0.9em', color: '#666', marginTop: '10px'}}>
              ⚠️ This app only works with test networks (not mainnet)
            </p>
            {error && (
              <div className="error-message" style={{marginTop: '15px'}}>
                ⚠️ {error}
              </div>
            )}
          </div>
        ) : (
          <div className="main-section">
            {networkName && (
              <div className="network-info" style={{marginBottom: '15px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '5px'}}>
                <p><strong>🌐 Network:</strong> {networkName} (Test Network)</p>
              </div>
            )}
            <div className="account-info">
              <p><strong>Connected Account:</strong></p>
              <p className="address">{account}</p>
              {accountBalance && (
                <div style={{marginTop: '5px', fontSize: '0.9em'}}>
                  <p>
                    <strong>Balance:</strong> {accountBalance} ETH
                    {parseFloat(accountBalance) === 0 && (
                      <span style={{color: 'red', marginLeft: '10px'}}>
                        ⚠️ No ETH!
                      </span>
                    )}
                  </p>
                  {parseFloat(accountBalance) === 0 && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: '#fff3cd',
                      borderRadius: '5px',
                      border: '1px solid #ffc107'
                    }}>
                      <p style={{margin: '0 0 8px 0', fontWeight: 'bold'}}>💡 How to get ETH:</p>
                      <p style={{margin: '0 0 5px 0', fontSize: '0.85em'}}>
                        <strong>Option 1 (Recommended):</strong> Run this command in a new terminal:
                      </p>
                      <code style={{
                        display: 'block',
                        padding: '8px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '3px',
                        fontSize: '0.8em',
                        wordBreak: 'break-all',
                        marginBottom: '10px',
                        cursor: 'pointer',
                        userSelect: 'all'
                      }} onClick={(e) => {
                        navigator.clipboard.writeText(`ACCOUNT_ADDRESS=${account} AMOUNT=100 npm run fund`);
                        alert('Command copied to clipboard!');
                      }}>
                        ACCOUNT_ADDRESS={account} AMOUNT=100 npm run fund
                      </code>
                      <p style={{margin: '0', fontSize: '0.85em'}}>
                        <strong>Option 2:</strong> Import a test account from Hardhat node terminal (each has 10,000 ETH)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="value-section">
              <h2>Current Stored Value</h2>
              <div className="value-display">
                <span className="value">{currentValue}</span>
                <button className="refresh-btn" onClick={loadCurrentValue}>
                  🔄 Refresh
                </button>
              </div>
            </div>

            <div className="set-section">
              <h2>Set New Value</h2>
              <div className="input-group">
                <input
                  type="number"
                  className="value-input"
                  placeholder="Enter a number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  disabled={loading}
                />
                <button
                  className="set-btn"
                  onClick={handleSetValue}
                  disabled={loading || !newValue}
                >
                  {loading ? 'Setting...' : 'Set Value'}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

