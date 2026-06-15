# Move Smart Contract - Hello Blockchain

This project contains a simple Move smart contract deployed on the Aptos blockchain.

## 📝 Contract Overview

The `hello_blockchain::message` module allows users to:
- Set a message on-chain associated with their account
- Retrieve messages stored by any account
- Update their stored message at any time

## 🚀 Deployment Information

**Network:** Aptos Devnet

**Deployed Address:** `0x46d2ef0cee8e5198777dd5a79b7d17d0683843dff944b6a86f83f198431b8b8e`

**Transaction Hash:** `0x9e0a9bf407df3acd96b9c832b35e101d146811cf411a6746b6b554352bcab685`

**Explorer Link:** [View on Aptos Explorer](https://explorer.aptoslabs.com/account/0x46d2ef0cee8e5198777dd5a79b7d17d0683843dff944b6a86f83f198431b8b8e?network=devnet)

**Transaction Link:** [View Transaction](https://explorer.aptoslabs.com/txn/0x9e0a9bf407df3acd96b9c832b35e101d146811cf411a6746b6b554352bcab685?network=devnet)

## 📦 Module Details

- **Module Name:** `hello_blockchain::message`
- **Gas Used:** 1,928 units
- **Deployment Status:** ✅ Successfully Deployed
- **Deployment Date:** November 25, 2025

## 🛠️ Contract Functions

### `set_message`
```move
public entry fun set_message(account: &signer, message: string::String)
```
Allows an account to set or update their message on-chain.

### `get_message`
```move
#[view]
public fun get_message(account_addr: address): string::String
```
Retrieves the message stored by a specific account address.

## 🔧 Local Setup

### Prerequisites
- Aptos CLI installed
- Move compiler

### Commands
```bash
# Compile the contract
aptos move compile

# Run tests
aptos move test

# Publish to devnet (requires funded account)
aptos move publish --profile devnet
```

## 📁 Project Structure
```
.
├── sources/
│   └── hello_blockchain.move    # Main contract file
├── Move.toml                     # Package configuration
└── README.md                     # This file
```

## 🔗 Useful Links
- [Aptos Documentation](https://aptos.dev/)
- [Move Language](https://move-language.github.io/move/)
- [Aptos Explorer](https://explorer.aptoslabs.com/)

## 📄 License
This project is created for educational purposes.
