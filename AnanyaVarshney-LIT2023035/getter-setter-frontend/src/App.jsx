import React, { useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xf8e81D47203A594245E36C48e151709F0C19fBe8";

const ABI = [
  "function setValue(uint256 _value)",
  "function getValue() view returns (uint256)"
];

export default function App() {
  const [num, setNum] = useState("");
  const [stored, setStored] = useState("");

  async function getContract() {
    if (!window.ethereum) {
      alert("Install MetaMask first!");
      return null;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  }

  async function setNumber() {
    const contract = await getContract();
    if (!contract) return;

    const tx = await contract.setValue(num);
    await tx.wait();
    alert("Value stored!");
  }

  async function getNumber() {
    const contract = await getContract();
    if (!contract) return;

    const value = await contract.getValue();
    setStored(value.toString());
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>Simple Getter-Setter App</h2>

      <input
        type="number"
        placeholder="Enter number"
        onChange={(e) => setNum(e.target.value)}
        style={{ padding: 8, marginRight: 10 }}
      />

      <button onClick={setNumber} style={{ padding: 8 }}>
        Set Value
      </button>

      <br /><br />

      <button onClick={getNumber} style={{ padding: 8 }}>
        Get Value
      </button>

      <h3>Stored Value: {stored}</h3>
    </div>
  );
}
