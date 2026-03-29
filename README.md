Blockchain Hardhat Project

A Hardhat + Next.js project featuring smart contracts for lending/borrowing and state management.

🚀 Features

LendingBorrowing.sol – ERC20-based lending with ETH collateral & interest

GetSet.sol – Store/retrieve values & deposit ETH

Next.js Frontend – MetaMask-based interaction

Hardhat – Compile, test & deploy suite

🛠️ Tech Stack

Solidity, Hardhat, Next.js 15, React 19, Ethers.js, OpenZeppelin

📁 Structure
contracts/           # Solidity contracts
scripts/             # Deployment scripts
src/app/             # Next.js frontend
src/contract_data/   # ABIs & addresses
hardhat.config.js
package.json

🔒 Security

OpenZeppelin standards

ReentrancyGuard protection

Owner-restricted functions