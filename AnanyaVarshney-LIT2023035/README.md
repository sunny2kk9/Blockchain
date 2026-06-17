# 🚀 Getter–Setter Smart Contract + React Frontend (Vite + MetaMask + Sepolia)

This project demonstrates a simple full-stack *Web3 DApp*:

- A *Solidity Smart Contract* deployed on *Sepolia Testnet*
- A *React (Vite)* frontend using *Ethers.js*
- Interaction through *MetaMask*


---
## 🧱 Smart Contract (`SimpleStorage.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
    uint256 private number;

    function setValue(uint256 _value) public {
        number = _value;
    }

    function getValue() public view returns (uint256) {
        return number;
    }
}
```

---

## 🚀 Deploying the Contract (Remix + MetaMask)

### 1️⃣ Open Remix  
https://remix.ethereum.org/

### 2️⃣ Create file `SimpleStorage.sol`  
Copy and paste the contract above.

### 3️⃣ Compile  
- Go to **Solidity Compiler**  
- Select version **0.8.19**  
- Click **Compile**

### 4️⃣ Deploy to Sepolia  
- Go to **Deploy & Run**  
- Set **Environment → Injected Provider – MetaMask**  
- Make sure MetaMask network = **Sepolia Test Network**  
- Click **Deploy**  
- Approve the transaction in MetaMask  

## 📌 Features

✔ Store a number on the blockchain  
✔ Retrieve the stored number  
✔ Uses MetaMask for transactions  
✔ Works on Sepolia testnet  
✔ Clean and simple UI  

---

## 🔗 How the DApp Works

1. User connects MetaMask  
2. Enter any number → click *Set Value*  
3. MetaMask opens → sign transaction  
4. Click *Get Value*  
5. Value is read from the blockchain and displayed  

---

## 🧪 Requirements

- Node.js 20.19+ / 22.12+  
- MetaMask wallet  
- Sepolia Test ETH (get from QuickNode faucet)  
- Remix for deployment

---
