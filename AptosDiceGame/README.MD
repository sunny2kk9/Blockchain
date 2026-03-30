# Aptos Dice Game - Smart Contract

**Author:** Vishesh Singh LIT2023054

## 📄 Contract Overview

**Deployment Address:**  
`0xd04ee7452043ff80879f79582d4350be447422e45385ca5913027701deea8f90`

**Network:** Aptos Devnet

**Explorer:**  
[View on Aptos Explorer](https://explorer.aptoslabs.com/txn/0xd04ee7452043ff80879f79582d4350be447422e45385ca5913027701deea8f90?network=devnet)

---

## 📁 Project Layout

```
Aptos_Dice_Game/
├── Move.toml             # Configuration file
├── sources/              # Move source code
│   └── module_owner.move # Main contract module
├── tests/                # Test suite
├── scripts/              # Deployment/utility scripts
└── build/                # Compiled outputs
```

---

## 🛠 Prerequisites

- Aptos CLI installed  
  https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli/

---

## 🚀 Build Instructions

1. Clone this repository  
2. Navigate to the `Aptos_Dice_Game` folder  
3. Run the compile command:

   ```bash
   aptos move compile
   ```

---

## 📝 Module Functions

### `basic_roll(_user: signer)`
Basic dice roll function with unsafe randomness allowed. Generates a random number from 0-5.

### `roll(user: signer)`
Main dice roll function that saves roll history. Generates a random number from 0-5 and stores it in the user's RollLog.

### `roll_v2(_user: signer)`
Dice roll with gas limit optimization (max_gas = 56789).

---

## 🎲 Features

- **Random Number Generation**: Uses Aptos randomness framework
- **History Tracking**: Stores all dice rolls per user
- **Multiple Implementations**: Three different roll functions for various use cases
- **Gas Optimization**: roll_v2 includes gas limit controls