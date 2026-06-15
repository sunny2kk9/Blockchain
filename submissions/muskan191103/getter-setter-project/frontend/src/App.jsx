import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "./contractABI.json";

const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // Replace after deployment

function App() {
  const [account, setAccount] = useState(null);
  const [value, setValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [contract, setContract] = useState(null);

  // Connect wallet
  async function connectWallet() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      setContract(c);
      const currentValue = await c.getValue();
      setValue(currentValue.toString());
    } else {
      alert("Please install MetaMask!");
    }
  }

  async function updateValue() {
    if (contract && inputValue) {
      const tx = await contract.setValue(inputValue);
      await tx.wait();
      const newVal = await contract.getValue();
      setValue(newVal.toString());
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🔗 Getter Setter DApp</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <p>Connected: {account}</p>
      )}

      <h2>Current Value: {value}</h2>
      <input
        type="number"
        placeholder="Enter new value"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={updateValue}>Update</button>
    </div>
  );
}

export default App;
