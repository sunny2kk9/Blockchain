import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI } from "./contractABI";
import "./App.css";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [storedValue, setStoredValue] = useState("—");
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected! Please install it.");
        return;
      }

      const prov = new ethers.providers.Web3Provider(window.ethereum);
      await prov.send("eth_requestAccounts", []);
      const sign = prov.getSigner();
      const addr = await sign.getAddress();

      console.log("Wallet connected:", addr);
      setProvider(prov);
      setSigner(sign);
      setAccount(addr);

      const c = new ethers.Contract(contractAddress, contractABI, sign);
      setContract(c);
      setStatus("✅ Wallet connected");

      const network = await prov.getNetwork();
      console.log("Network:", network.name, network.chainId);
      if (network.chainId !== 11155111)
        alert("⚠️ Please switch MetaMask to Sepolia Test Network!");
    } catch (err) {
      console.error("Wallet connection error:", err);
      if (err.code === 4001)
        setStatus("❌ Connection rejected by user");
      else setStatus("❌ Failed to connect wallet");
    }
  };

  const getValue = async () => {
    try {
      if (!contract) {
        setStatus("⚠️ Contract not loaded yet. Try reconnecting.");
        return;
      }
      const val = await contract.getValue();
      console.log("Fetched value:", val.toString());
      setStoredValue(val.toString());
      setStatus("✅ Value fetched");
    } catch (err) {
      console.error("Read error:", err);
      setStatus("❌ Error reading value");
    }
  };

  const setValue = async () => {
    if (!contract || !inputValue) {
      alert("Enter a number and connect your wallet!");
      return;
    }
    try {
      console.log("Sending transaction...");
      setStatus("⏳ Sending transaction...");
      const tx = await contract.setValue(inputValue);
      await tx.wait();
      console.log("Transaction confirmed!");
      setStatus("✅ Transaction confirmed");
      setInputValue("");
      getValue();
    } catch (err) {
      console.error("Transaction error:", err);
      setStatus("❌ Transaction failed or rejected");
    }
  };

  useEffect(() => {
    if (contract) getValue();
  }, [contract]);

  return (
    <div className="App">
      <h1>Getter–Setter DApp</h1>

      {!account ? (
        <button className="btn" onClick={connectWallet}>
          Connect MetaMask
        </button>
      ) : (
        <p>
          Connected: <span className="addr">{account}</span>
        </p>
      )}

      <div className="card">
        <p>
          <b>Stored Value:</b> <span className="mono">{storedValue}</span>
        </p>

        <div className="input-group">
          <input
            type="number"
            placeholder="Enter new value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button className="btn" onClick={setValue}>
            Set Value
          </button>
        </div>

        <button className="btn secondary" onClick={getValue}>
          Refresh Value
        </button>

        <p className="status">{status}</p>
      </div>
    </div>
  );
}

export default App;
