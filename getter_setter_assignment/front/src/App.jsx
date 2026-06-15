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
    page: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24, background: '#f3f4f6' },
    card: { width: '100%', maxWidth: 720, background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
    btnPrimary: { padding: '10px 14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>SimpleStorage (fixed read/write)</h2>
        <div>Connected account: <code>{account ?? 'not connected'}</code></div>
        <div style={{ marginTop: 12 }}>
          <button onClick={connectWallet} style={styles.btnPrimary}>Connect Wallet</button>
          <button onClick={fetchValue} style={{ marginLeft: 10 }}>Read Value</button>
        </div>
        <div style={{ marginTop: 12 }}>
          <div>Stored value:</div>
          <div style={{ fontFamily: 'monospace', fontSize: 24 }}>{value === '' ? '—' : value}</div>
        </div>
        <div style={{ marginTop: 12 }}>
          <input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="new numeric value" />
          <button onClick={writeValue} style={{ marginLeft: 8 }}>Set Value</button>
        </div>
        <div style={{ marginTop: 12, color: '#6b7280' }}>{status}</div>
      </div>
    </div>
  )
}
