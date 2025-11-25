import { useState } from 'react'
import { ethers } from 'ethers'
import './App.css'
import abi from './abi/simplestorage.json'

const CONTRACT_ADDRESS = '0x794298a4022559a28B57cbedEa2dDABE6b7D86fd'

// const ABI = [
//   { "inputs": [{ "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "setValue", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
//   { "inputs": [], "name": "getValue", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
// ]
const ABI = abi.abi
export default function App() {
  const [account, setAccount] = useState('')
  const [value, setValue] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [status, setStatus] = useState('Not connected')

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setStatus('Please install MetaMask!')
        return
      }
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      setAccount(accounts[0])
      setStatus('Connected')
    } catch (err) {
      setStatus('Failed to connect: ' + err.message)
    }
  }

  const disconnectWallet = () => {
    setAccount('')
    setValue('')
    setInputValue('')
    setStatus('Disconnected')
  }

  const fetchValue = async () => {
    try {
      if (!window.ethereum) {
        setStatus('Please install MetaMask!')
        return
      }
      setStatus('Reading...')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)
      const result = await contract.getValue()
      console.log(result)
      setValue(result.toString())
      setStatus('Value loaded')
    } catch (err) {
      setStatus('Read failed: ' + err.message)
    }
  }

  const writeValue = async () => {
    try {
      if (!window.ethereum) {
        setStatus('Please install MetaMask!')
        return
      }
      if (!account) {
        setStatus('Please connect wallet first')
        return
      }
      if (!inputValue) {
        setStatus('Please enter a value')
        return
      }
      setStatus('Sending transaction...')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
      const tx = await contract.setValue(inputValue)
      setStatus('Waiting for confirmation...')
      await tx.wait()
      setStatus('Transaction confirmed!')
      await fetchValue()
    } catch (err) {
      setStatus('Write failed: ' + err.message)
    }
  }

  return (
    <div className='container'>
      <div className='card'>
        <h1>DApp</h1>

        <div className='section'>
          <h3>Wallet Connection</h3>
          {!account ? (
            <button
              onClick={connectWallet}
              className='btn btn-primary'>
              Connect Wallet
            </button>
          ) : (
            <>
              <p className='account'>
                Account: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
              <button
                onClick={disconnectWallet}
                className='btn btn-disconnect'>
                Disconnect
              </button>
            </>
          )}
        </div>

        <div className='section'>
          <h3>Read Contract</h3>
          <button
            onClick={fetchValue}
            className='btn'>
            Get Value
          </button>
          <div className='value-display'>{value || '—'}</div>
        </div>

        <div className='section'>
          <h3>Write Contract</h3>
          <input
            type='number'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder='Enter value'
            className='input'
          />
          <button
            onClick={writeValue}
            className='btn'>
            Set Value
          </button>
        </div>

        <div className='status'>{status}</div>
      </div>
    </div>
  )
}
