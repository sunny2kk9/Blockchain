# Move Assignment – Calculator Smart Contract

## 📌 Contract Deployment Details

**Contract Address:**  
`0xb49e729f4820963fe4d306a3d30ed1de8aa0b7e2ef9b2a3e850be42a46067f2e`

**Transaction Hash:**  
`0xdb71583c61403019791b08529e1dc028549c8509c476a6a170d8c16faf9d1319`

**Transaction Explorer Link:**  
https://explorer.aptoslabs.com/txn/0xdb71583c61403019791b08529e1dc028549c8509c476a6a170d8c16faf9d1319?network=testnet

**Account Explorer (Modules):**  
https://explorer.aptoslabs.com/account/0xb49e729f4820963fe4d306a3d30ed1de8aa0b7e2ef9b2a3e850be42a46067f2e/modules?network=testnet

---

## 📘 Contract Name
`Move_Assignment::calculator`

---

## 🧮 Smart Contract Description

This Move smart contract acts as a simple **Calculator** with:

- Add two numbers  
- Subtract two numbers  
- Store the result on-chain  
- Retrieve stored result  

---

## 🛠 Functions Overview

### `add(a: u64, b: u64): u64`
Returns the sum of `a` and `b`.

### `subtract(a: u64, b: u64): u64`
Returns the absolute difference between `a` and `b`.

### `store_add_result(account: &signer, a: u64, b: u64)`
Stores the result of `a + b` on-chain.

### `store_sub_result(account: &signer, a: u64, b: u64)`
Stores the result of `|a - b|` on-chain.

### `get_result(addr: address): u64`
Fetches the stored result for the given address.

---

## 📦 Source Code

The full contract source code is here:  
[`sources/calculator.move`](sources/calculator.move)

---

## 📊 Gas Usage

- **Gas Used:** `1892`
- **Gas Unit Price:** `100`
- **Execution Status:** ✔ Executed successfully

---

## 🚀 Commands Used

