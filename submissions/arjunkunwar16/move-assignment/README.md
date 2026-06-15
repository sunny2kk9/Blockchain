# Blockchain Assignment

## Move Smart Contract Deployment

**Contract Address:** `0x41dc2dbd7a1970b9318e4eb57d4fb6e1eb59115befa8a7e3428a6d873661e455`

**Transaction Hash:** `0x0b0140a8bb0abe56ea034e2d0289c71c3bb7e0982ba0ba58b6e19c40ab8d9bab`

**Explorer Link:** [View on Aptos Explorer](https://explorer.aptoslabs.com/txn/0x0b0140a8bb0abe56ea034e2d0289c71c3bb7e0982ba0ba58b6e19c40ab8d9bab?network=testnet)

**Account Explorer:** [View Account](https://explorer.aptoslabs.com/account/0x41dc2dbd7a1970b9318e4eb57d4fb6e1eb59115befa8a7e3428a6d873661e455?network=testnet)

### Contract Details

**Network:** Aptos Testnet

**Module:** `multiply_contract::multiply`

**Functions:**
- `multiply(a: u64, b: u64): u64` - Multiplies two u64 numbers and returns the result
- `store_result(account: &signer, a: u64, b: u64)` - Stores the multiplication result on-chain

**Gas Used:** 1413 units

**Deployment Status:** ✅ Successfully deployed

### Source Code
The contract source code is available in [`sources/multiply.move`](move-assignment/sources/multiply.move)