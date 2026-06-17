// Updated UI for SimpleStorage App
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

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-center">Simple Storage DApp</h2>

        <div className="text-sm text-gray-600 mb-2">Connected Wallet:</div>
        <div className="mb-4 font-mono text-sm">{account ?? 'Not connected'}</div>

        <div className="flex gap-3 mb-4">
          <button onClick={connectWallet} className="px-4 py-2 bg-blue-600 text-white rounded-md">Connect Wallet</button>
          <button onClick={fetchValue} className="px-4 py-2 border rounded-md">Read Value</button>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-600">Stored Value:</div>
          <div className="text-3xl font-mono">{value === '' ? '—' : value}</div>
        </div>

        <div className="flex gap-2 mb-4">
          <input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Enter new value" className="border p-2 rounded-md flex-1" />
          <button onClick={writeValue} className="px-4 py-2 bg-green-600 text-white rounded-md">Set</button>
        </div>

        <div className="text-gray-500 text-sm min-h-[20px]">{status}</div>
      </div>
    </div>
  )
}
