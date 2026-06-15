// src/App.jsx
import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0xC09F162341255218E2C3315566D86fEd94F95119'

const ABI = [
  { "inputs": [{ "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "setValue", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "getValue", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "anonymous": false, "inputs": [
    { "indexed": true, "internalType": "uint256", "name": "newValue", "type": "uint256" },
    { "indexed": true, "internalType": "address", "name": "changedBy", "type": "address" }
  ], "name": "ValueChanged", "type": "event" }
]

function IconSunMoon ({ dark }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {dark ? (
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
      ) : (
        <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

export default function App() {
  // blockchain state
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState(null)
  const [value, setValue] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [status, setStatus] = useState('')

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(false)

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
      try { readContract.off('ValueChanged', handler) } catch (err) { console.warn('off handler error', err) }
    }
  }, [provider])

  // small helpers
  const shortAccount = (a) => a ? `${a.slice(0,6)}...${a.slice(-4)}` : 'not connected'

  useEffect(() => {
    document.documentElement.style.background = dark ? '#0f172a' : '#f8fafc'
  }, [dark])

  return (
    <div className={dark ? 'app-root dark' : 'app-root'}>
      <header className="topbar">
        <div className="brand">SimpleStorage</div>
        <div className="top-actions">
          <button className="btn icon" onClick={() => setDark(d => !d)} aria-label="toggle theme"><IconSunMoon dark={dark} /></button>
          <div className="account">{shortAccount(account)}</div>
        </div>
      </header>

      <div className="layout">
        <aside className={"sidebar " + (sidebarOpen ? 'open' : '')}>
          <nav>
            <button className="nav-item" onClick={() => { setSidebarOpen(false); fetchValue() }}>Read Value</button>
            <button className="nav-item" onClick={() => { setSidebarOpen(false); connectWallet() }}>Connect Wallet</button>
            <a className="nav-item muted" href="#" onClick={e => e.preventDefault()}>Documentation</a>
          </nav>
        </aside>

        <main className="main">
          <div className="controls">
            <div className="card">
              <h3>Stored Value</h3>
              <div className="value">{value === '' ? '—' : value}</div>
              <div className="muted">Latest on-chain value from contract</div>
              <div className="row">
                <button className="btn primary" onClick={fetchValue}>Refresh</button>
                <button className="btn" onClick={() => setInputValue('')}>Clear</button>
              </div>
            </div>

            <div className="card">
              <h3>Set New Value</h3>
              <div className="row">
                <input className="input" type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Enter new numeric value" />
                <button className="btn primary" onClick={writeValue}>Set Value</button>
              </div>
              <div className="muted">Transaction status: {status}</div>
            </div>
          </div>

          <section className="info-grid">
            <div className="card small">
              <h4>Account</h4>
              <div className="mono">{account ?? 'not connected'}</div>
            </div>
            <div className="card small">
              <h4>Contract</h4>
              <div className="mono">{CONTRACT_ADDRESS}</div>
            </div>
            <div className="card small">
              <h4>Network</h4>
              <div className="mono">{provider ? 'Connected' : 'No provider'}</div>
            </div>
          </section>
        </main>
      </div>
      <footer className="footer">Built with ethers.js • Minimal UI</footer>
    </div>
  )
}
