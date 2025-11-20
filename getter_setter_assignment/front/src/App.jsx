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
      background: 'linear-gradient(135deg, #c3dafe, #fbcfe8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: 20
    },
    card: {
      width: '100%',
      maxWidth: 500,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: 16,
      padding: 32,
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      textAlign: 'center'
    },
    heading: { fontSize: 24, fontWeight: 600, marginBottom: 16, color: '#1e3a8a' },
    account: { fontSize: 14, marginBottom: 20, color: '#374151' },
    buttonRow: { display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 20 },
    btn: {
      padding: '10px 16px',
      borderRadius: 8,
      border: 'none',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    primaryBtn: { background: '#2563eb', color: '#fff' },
    secondaryBtn: { background: '#e5e7eb', color: '#111827' },
    inputGroup: { display: 'flex', justifyContent: 'center', marginBottom: 20 },
    input: {
      width: '70%',
      padding: '8px 12px',
      borderRadius: 8,
      border: '1px solid #d1d5db',
      fontSize: 14
    },
    valueBox: {
      fontFamily: 'monospace',
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 16,
      color: '#111827'
    },
    status: { fontSize: 13, color: '#6b7280', marginTop: 10 }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.heading}>🔗 Simple Storage DApp</div>
        <div style={styles.account}>
          Connected Account: <b>{account ?? 'Not Connected'}</b>
        </div>

        <div style={styles.buttonRow}>
          <button onClick={connectWallet} style={{ ...styles.btn, ...styles.primaryBtn }}>
            Connect Wallet
          </button>
          <button onClick={fetchValue} style={{ ...styles.btn, ...styles.secondaryBtn }}>
            Read Value
          </button>
        </div>

        <div style={styles.valueBox}>{value === '' ? '—' : value}</div>

        <div style={styles.inputGroup}>
          <input
            type="number"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Enter new value"
            style={styles.input}
          />
          <button onClick={writeValue} style={{ ...styles.btn, ...styles.primaryBtn, marginLeft: 8 }}>
            Set
          </button>
        </div>

        <div style={styles.status}>{status}</div>
      </div>
    </div>
  )
}
