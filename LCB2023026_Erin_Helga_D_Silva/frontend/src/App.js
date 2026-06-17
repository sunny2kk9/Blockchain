import { useState } from "react";
import { ethers } from "ethers";
import "./App.css";

function App() {
  const [contract, setContract] = useState(null);
  const [value, setValue] = useState("");
  const [retrieved, setRetrieved] = useState("");

  const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const abi = [
    {
      "inputs": [{"internalType": "uint256","name": "_val","type": "uint256"}],
      "name": "set",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "get",
      "outputs": [{"internalType": "uint256","name":"","type":"uint256"}],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(contractAddress, abi, signer);
      setContract(c);
    }
  }

  async function setData() {
    if (!contract) return;
    const tx = await contract.set(value);
    await tx.wait();
  }

  async function getData() {
    if (!contract) return;
    const val = await contract.get();
    setRetrieved(val.toString());
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>GetSet DApp</h2>
      <button onClick={connectWallet}>Connect Wallet</button>

      <div style={{ marginTop: "1rem" }}>
        <input
          placeholder="Enter value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={setData}>Set</button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={getData}>Get</button>
        <p>Stored value: {retrieved}</p>
      </div>
    </div>
  );
}

export default App;
