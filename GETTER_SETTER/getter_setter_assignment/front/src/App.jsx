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
    page: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24, background: 'linear-gradient(180deg,#f8fafc 0%, #eef2ff 100%)' },
    card: { width: '100%', maxWidth: 760, background: '#ffffff', padding: 20, borderRadius: 14, boxShadow: '0 10px 30px rgba(2,6,23,0.08)', border: '1px solid rgba(16,24,40,0.04)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    logo: { fontWeight: 700, letterSpacing: 0.3, color: '#111827' },
    accountChip: { padding: '6px 10px', background: '#f3f4f6', borderRadius: 999, fontSize: 13, fontFamily: 'monospace' },
    controls: { display: 'flex', gap: 12, marginTop: 8 },
    btnPrimary: { padding: '10px 14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 },
    btnSecondary: { padding: '10px 14px', background: 'transparent', border: '1px solid #e6e9f2', borderRadius: 10, cursor: 'pointer' },
    valueBox: { marginTop: 14, padding: 14, borderRadius: 10, background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    inputRow: { display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' },
    input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #e6e9f2', width: 200, fontSize: 14 }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <div style={{ fontSize: 18, ...styles.logo }}>SimpleStorage</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>A minimal read / write demo</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={styles.accountChip}>Account: {account ?? 'not connected'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Contract address</div>
            <div style={{ fontFamily: 'monospace', fontSize: 13 }}>{CONTRACT_ADDRESS}</div>
          </div>
          <div style={styles.controls}>
            <button onClick={connectWallet} style={styles.btnPrimary}>Connect Wallet</button>
            <button onClick={fetchValue} style={styles.btnSecondary}>Read Value</button>
          </div>
        </div>

        <div style={styles.valueBox}>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Stored value</div>
            <div style={{ fontFamily: 'monospace', fontSize: 28, marginTop: 6 }}>{value === '' ? '—' : value}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Status</div>
            <div style={{ fontSize: 13, marginTop: 6, fontFamily: 'monospace', color: '#374151' }}>{status || 'idle'}</div>
          </div>
        </div>

        <div style={styles.inputRow}>
          <input
            type="number"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="new numeric value"
            style={styles.input}
          />
          <button onClick={writeValue} style={styles.btnPrimary}>Set Value</button>
          <button onClick={() => { setInputValue(''); setStatus('') }} style={styles.btnSecondary}>Clear</button>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: '#9ca3af' }}>
          Note: UI changed only — contract interaction and logic remain exactly the same.
        </div>
      </div>
    </div>
  )
}
