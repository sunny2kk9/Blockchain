"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "../contract_data/GetSet.json";
import contractAddress from "../contract_data/GetSet-address.json";

export default function Page() {
  const [value, setValue] = useState(""); 
  const [retrievedValue, setRetrievedValue] = useState(null);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [userBalance, setUserBalance] = useState(null);
  const [copied, setCopied] = useState(false);

  const initializeEthers = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected!");
      return;
    }
    
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const _contract = new ethers.Contract(contractAddress.address, contractABI.abi, _signer);

      setProvider(_provider);
      setSigner(_signer);
      setContract(_contract);

      const accounts = await _provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error initializing ethers:", error);
    }
  };

  const setContractValue = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      const tx = await contract.set(BigInt(value));
      await tx.wait();
      alert("Value set successfully!");
    } catch (error) {
      console.error("Error setting value:", error);
    }
  };

  const getContractValue = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      const code = await provider.getCode(contractAddress.address);
      if (code === "0x") {
        alert("No contract found at this address!");
        return;
      }
      
      const result = await contract.get();
      setRetrievedValue(result.toString());
    } catch (error) {
      console.error("Error getting value:", error);
      alert("Error getting value: " + error.message);
    }
  };

  const depositFunds = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      const tx = await signer.sendTransaction({
        to: contractAddress.address,
        value: ethers.parseEther(depositAmount),
      });
      await tx.wait();
      alert(`Deposited ${depositAmount} ETH successfully!`);
      setDepositAmount("");
    } catch (error) {
      console.error("Error depositing funds:", error);
    }
  };

  const getUserBalance = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      const balance = await contract.getBalance(account);
      setUserBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      initializeEthers();
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <div style={{ backgroundColor: 'black', padding: '20px', textAlign: 'center', borderBottom: '2px solid #333' }}>
        <h1 style={{ color: 'white', margin: '0 0 15px 0' }}>GetSet Contract</h1>
        <div style={{ color: 'white', fontSize: '14px', marginBottom: '10px', wordBreak: 'break-all' }}>
          {contractAddress.address}
        </div>
        
        {account ? (
          <div style={{ display: 'inline-block' }}>
            <div style={{ color: 'white', fontSize: '12px', marginBottom: '10px', wordBreak: 'break-all' }}>
              Connected: {account}
            </div>
            <button
              onClick={copyAddress}
              style={{ padding: '10px 20px', backgroundColor: 'white', color: 'black', border: 'none', cursor: 'pointer' }}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        ) : (
          <button 
            onClick={initializeEthers}
            style={{ padding: '10px 20px', backgroundColor: 'white', color: 'black', border: 'none', cursor: 'pointer' }}
          >
            Connect Wallet
          </button>
        )}
      </div>

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
        
        <div style={{ border: '2px solid black', padding: '20px', marginBottom: '30px', backgroundColor: 'white' }}>
          <h2 style={{ marginTop: 0 }}>📝 Value Storage</h2>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Enter Value</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter a number"
              style={{ padding: '10px', width: '100%', maxWidth: '300px', border: '2px solid black' }}
            />
          </div>
          <button 
            onClick={setContractValue}
            style={{ padding: '10px 20px', backgroundColor: 'black', color: 'white', border: 'none', cursor: 'pointer', marginRight: '10px', marginBottom: '10px' }}
          >
            Set Value
          </button>
          <button 
            onClick={getContractValue}
            style={{ padding: '10px 20px', backgroundColor: 'white', color: 'black', border: '2px solid black', cursor: 'pointer', marginBottom: '10px' }}
          >
            Get Value
          </button>
          
          {retrievedValue !== null && (
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'black', color: 'white' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Stored Value:</p>
              <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold' }}>{retrievedValue}</p>
            </div>
          )}
        </div>

        <div style={{ border: '2px solid black', padding: '20px', marginBottom: '30px', backgroundColor: 'white' }}>
          <h2 style={{ marginTop: 0 }}>💰 Deposit Funds</h2>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Amount (ETH)</label>
            <input
              type="text"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.0"
              style={{ padding: '10px', width: '100%', maxWidth: '300px', border: '2px solid black' }}
            />
          </div>
          <button 
            onClick={depositFunds}
            style={{ padding: '10px 20px', backgroundColor: 'black', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Deposit ETH
          </button>
        </div>

        <div style={{ border: '2px solid black', padding: '20px', backgroundColor: 'white' }}>
          <h2 style={{ marginTop: 0 }}>💳 Your Balance</h2>
          <button 
            onClick={getUserBalance}
            style={{ padding: '10px 20px', backgroundColor: 'black', color: 'white', border: 'none', cursor: 'pointer', marginBottom: '20px' }}
          >
            Refresh Balance
          </button>
          
          {userBalance !== null ? (
            <div style={{ padding: '20px', backgroundColor: 'black', color: 'white' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Contract Balance:</p>
              <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold' }}>{userBalance} ETH</p>
            </div>
          ) : (
            <div style={{ padding: '20px', border: '2px solid black' }}>
              <p style={{ margin: 0 }}>Click "Refresh Balance" to view your balance</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
