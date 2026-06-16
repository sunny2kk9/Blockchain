# Move Adder Smart Contract

This folder contains a simple Move module that adds two numbers and (optionally) stores the result.

## Deployment Information

**Contract Address:** `0x43d8569b5186e6f55e8e363ea92486877e4f67d453e9b9114aeaa2599152cb6e`

**Network:** Aptos Testnet

**Transaction Hash:** `0x03e7edefd006ea5e8f417ed7c004cff2582ebeb76a113c4513ebdba78ccbd0f2`

**Explorer Link:** [View on Aptos Explorer](https://explorer.aptoslabs.com/txn/0x03e7edefd006ea5e8f417ed7c004cff2582ebeb76a113c4513ebdba78ccbd0f2?network=testnet)

**Deployment Stats:**
- Gas used: 1755
- Package size: 866 bytes
- Status: ✅ Executed successfully

## Module Overview

Files:
- `sources/adder.move` : Move module `adder_addr::adder` with:
  - `add(a: u64, b: u64): u64` — pure function returning the sum.
  - `store_result(account: &signer, a: u64, b: u64)` — entry function that stores a `Sum` resource with the result under the caller's account.

Notes and deployment (Aptos):

1. Replace the module address `0x1` with your account address before publishing (or publish using your account address to have the module published at your address).

2. Install and configure the Aptos CLI. See https://aptos.dev for CLI installation and account setup.

3. Create a Move package (if you don't have one) or move this file into a package directory with a `Move.toml`.

4. Compile the package:
```
aptos move compile --package-dir /path/to/your/package
```

5. Publish the package (replace profile/address as needed):
```
aptos move publish --package-dir /path/to/your/package --assume-yes
```

6. Call the script entry to store the sum under your account (example):
```
aptos transaction run --function <PACKAGE_ADDRESS>::adder::store_result --args 10 20
```

7. Read back the stored resource:
```
aptos account resource show --account <YOUR_ADDRESS> --resource-type <PACKAGE_ADDRESS>::adder::Sum
```
