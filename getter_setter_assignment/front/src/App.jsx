// src/App.jsx
import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0x63eA0F7C1c0D7E59E41C09a13a625b9391152987'

const ABI = [
  { "inputs": [{ "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "setValue", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "getValue", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  {
    "anonymous": false, "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "newValue", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "changedBy", "type": "address" }
    ], "name": "ValueChanged", "type": "event"
  }
]

export default function App() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState(null)
  const [value, setValue] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const p = (ethers.BrowserProvider) ? new ethers.BrowserProvider(window.ethereum) : new ethers.providers.Web3Provider(window.ethereum)
        setProvider(p)
      } catch (err) {
        setStatus('Provider init error: ' + err.message)
      }
    } else {
      setStatus('No web3 wallet found (install MetaMask)')
    }
  }, [])

  useEffect(() => {
    if (!provider) return
    ;(async () => {
      try {
        const accounts = await provider.send('eth_accounts', [])
        if (accounts.length) {
          setAccount(accounts[0])
          const s = await provider.getSigner()
          setSigner(s)
          setStatus('Ready')
        } else {
          setStatus('Wallet not connected')
        }
      } catch (err) {
        setStatus('Error reading accounts: ' + err.message)
      }
    })()
  }, [provider])

  const connectWallet = async () => {
    if (!provider) return setStatus('No provider (install MetaMask)')
    try {
      const accounts = await provider.send('eth_requestAccounts', [])
      setAccount(accounts[0])
      const s = await provider.getSigner()
      setSigner(s)
      setStatus('Wallet connected')
    } catch (err) {
      setStatus('Connection failed: ' + (err.message || err))
    }
  }

  const fetchValue = async () => {
    if (!provider) return setStatus('Provider not initialized')
    try {
      setStatus('Reading value...')
      const readContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)
      const v = await readContract.getValue()
      setValue(v.toString())
      setStatus('Value loaded')
    } catch (err) {
      setStatus('Read failed: ' + (err.message || err))
    }
  }

  const writeValue = async () => {
    if (!signer) return setStatus('Wallet not connected (signer missing)')
    if (inputValue === '') return setStatus('Enter a value')
    try {
      setStatus('Sending transaction...')
      const writeContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
      const tx = await writeContract.setValue(BigInt(inputValue))
      setStatus('Transaction sent: ' + tx.hash)
      await tx.wait()
      setStatus('Transaction confirmed')
      fetchValue()
    } catch (err) {
      setStatus('Write failed: ' + (err.message || err))
    }
  }

  useEffect(() => {
    if (!provider) return
    const readContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)
    const handler = (newValue, changedBy) => {
      setValue(newValue.toString())
      setStatus(`ValueChanged: ${newValue.toString()} by ${changedBy}`)
    }
    readContract.on('ValueChanged', handler)
    return () => {
      try { readContract.off('ValueChanged', handler) } catch (e) {}
    }
  }, [provider])

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 600,
      background: '#ffffff',
      borderRadius: 16,
      padding: 32,
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      textAlign: 'center',
    },
    header: {
      fontSize: 28,
      fontWeight: '700',
      color: '#1e3a8a',
      marginBottom: 16,
    },
    label: {
      color: '#374151',
      fontWeight: 500,
      marginTop: 16,
    },
    value: {
      fontFamily: 'monospace',
      fontSize: 28,
      fontWeight: 600,
      color: '#111827',
      marginTop: 8,
    },
    input: {
      padding: '10px 12px',
      borderRadius: 8,
      border: '1px solid #d1d5db',
      width: '160px',
      textAlign: 'center',
      fontSize: 16,
      outline: 'none',
    },
    btnPrimary: {
      padding: '10px 16px',
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 600,
      transition: '0.2s',
    },
    btnSecondary: {
      padding: '10px 16px',
      background: '#f3f4f6',
      color: '#111827',
      border: '1px solid #d1d5db',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 500,
      transition: '0.2s',
    },
    status: {
      marginTop: 20,
      color: '#6b7280',
      fontSize: 14,
    },
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>🔗 SimpleStorage Dashboard</div>
        <div>Account: <code>{account ?? 'Not connected'}</code></div>

        <div style={{ marginTop: 20 }}>
          <button onClick={connectWallet} style={styles.btnPrimary}>Connect Wallet</button>
          <button onClick={fetchValue} style={{ ...styles.btnSecondary, marginLeft: 10 }}>Read Value</button>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={styles.label}>Stored Value</div>
          <div style={styles.value}>{value === '' ? '—' : value}</div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <input
            type="number"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Enter value"
            style={styles.input}
          />
          <button onClick={writeValue} style={{ ...styles.btnPrimary, marginLeft: 10 }}>Set Value</button>
        </div>

        <div style={styles.status}>{status}</div>
      </div>
    </div>
  )
}
