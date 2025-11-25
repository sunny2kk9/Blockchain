# Blockchain Projects - LCI2023030 Muskan Agrawal

This repository contains three blockchain projects demonstrating smart contract development across Ethereum and Aptos ecosystems.

---

## 📁 Project Structure

```
Blockchain-ACADS/
├── Lab_Assignment/        # Hardhat + Next.js Web3 DApp
├── Lending_Protocol/      # ERC20 Lending Protocol
├── Aptos_Dice_Game/       # Aptos Move Dice Game
└── README.md              # This file
```

---

## 🚀 Projects

### 1. Lab_Assignment - Hardhat Web3 DApp

Full-stack decentralized application with Hardhat and Next.js.

**Technologies:**
- Hardhat, Solidity ^0.8.0
- Next.js 15.2.2, React 19.0.0
- ethers.js, MetaMask

**Features:**
- GetSet smart contract (value storage)
- ETH deposit/withdraw functionality
- Balance tracking per address
- Web3 wallet integration

**Setup:**
```bash
cd Lab_Assignment
npm install
npx hardhat compile
npx hardhat node
# New terminal:
npm run hardhat:deploy
npm run dev
```

---

### 2. Lending_Protocol - DeFi Lending

Advanced DeFi lending protocol with collateralized loans.

**Technologies:**
- Solidity ^0.8.20
- OpenZeppelin Contracts

**Features:**
- Supply ERC20 tokens
- Borrow with ETH collateral (10% interest)
- Loan settlement with collateral return
- Reentrancy protection

**Key Functions:**
- `supply(uint256)` - Deposit tokens
- `takeLoan(uint256)` - Borrow with collateral
- `settleLoan()` - Repay loan + interest

---

### 3. Aptos_Dice_Game - Move Smart Contract

Dice game on Aptos blockchain with on-chain randomness.

**Technologies:**
- Move Language
- Aptos Framework

**Features:**
- Random number generation (0-5)
- Persistent roll history
- Gas-optimized variants

**Setup:**
```bash
cd Aptos_Dice_Game
aptos move compile
aptos move test
```

**Deployment:**
- Network: Aptos Devnet
- TX Hash: `0xd04ee7452043ff80879f79582d4350be447422e45385ca5913027701deea8f90`

---

## 🛠 Prerequisites

**Ethereum Projects:**
- Node.js v16+
- MetaMask wallet
- Hardhat

**Aptos Project:**
- Aptos CLI

---

## 📦 Quick Installation

```bash
# Ethereum projects
cd Lab_Assignment
npm install

# Aptos project
cd Aptos_Dice_Game
aptos move compile
```

---

## 🔗 Documentation

- [Hardhat Docs](https://hardhat.org/docs)
- [OpenZeppelin](https://docs.openzeppelin.com/contracts)
- [Aptos Docs](https://aptos.dev/)
- [Move Book](https://move-language.github.io/move/)

---

## 👤 Author

**Muskan Agrawal LCI2023030**  

---

## 🎯 Learning Outcomes

- Smart contract development in Solidity
- DApp frontend with Web3 integration
- DeFi protocol implementation
- Move language on Aptos
- Security best practices

---

## 🚨 Important Notes

- Create `.env` files with your own API keys
- Never commit private keys
- Test on local networks first
- Audit contracts before production