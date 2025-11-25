# Move Multiply Contract Assignment

## Contract Address
```
0x41dc2dbd7a1970b9318e4eb57d4fb6e1eb59115befa8a7e3428a6d873661e455
```

## Explorer Link
[View Transaction on Aptos Explorer](https://explorer.aptoslabs.com/txn/0x2a69cea4f0b934e7202365eb800539caf19f84a5616cf37a37ac47461b8dae63?network=testnet)

## Description
This Move smart contract multiplies two numbers and stores the result in a resource under the caller's account.

### Module
- `multiply_contract::multiply`

### Functions
- `multiply(a: u64, b: u64): u64` — Returns the product of two numbers.
- `store_result(account: &signer, a: u64, b: u64)` — Stores the product in a `Product` resource under the caller's account.

## How to Use
1. Call `store_result` with your signer and two numbers.
2. The result will be stored in your account as a `Product` resource.

---
Assignment deployed and ready for submission.
