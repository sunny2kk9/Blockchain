Move Adder Smart Contract-Anushka(lcb2023018)

This folder contains a simple Move module that adds two numbers and (optionally) stores the result.

Deployment Information

Contract Address: 0x3eadc4cadc3fd463a09746e9caa755a28c39fe6a978c3359cfad007a4f7d33e8

Network: Aptos Testnet

Transaction Hash: 0xe7e695e63c60e1f81004375349eaf4fc40b23a6206d5a31180376b2aca400c8f

Explorer Link: View on Aptos Explorer

Deployment Stats:

Gas used: 1170

Package size: 474 bytes

Status: ✅ Executed successfully

Module Overview

Files:

sources/adder.move : Move module adder_addr::adder with:

add(a: u64, b: u64): u64 — pure function returning the sum.

store_result(account: &signer, a: u64, b: u64) — entry function that stores a Sum resource with the result under the caller's account.

Notes and deployment (Aptos):

Replace the module address with your account address before publishing (or publish directly using your profile so it's updated automatically).

Install and configure the Aptos CLI.
https://aptos.dev

Ensure your module is inside a valid Move package with a Move.toml.

Compile the package:

aptos move compile --package-dir .


Publish the package:

aptos move publish --profile default --assume-yes


Call the entry function to store a sum:

aptos transaction run --function <PACKAGE_ADDRESS>::adder::store_result --args 10 20


Read the stored result:

aptos account resource show --account <YOUR_ADDRESS> --resource-type <PACKAGE_ADDRESS>::adder::Sum
