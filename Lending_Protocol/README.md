# Lending Protocol Smart Contract

**Author:** Muskan Agrawal LCI2023030

## Overview
A decentralized lending protocol that allows users to supply tokens, borrow against ETH collateral, and settle loans with interest.

## Features
- **Supply Tokens**: Deposit ERC20 tokens to earn interest
- **Borrow**: Take loans by providing ETH as collateral
- **Settle Loans**: Repay borrowed amount + 10% interest to reclaim collateral
- **Owner Controls**: Contract owner can withdraw protocol earnings

## Contract Functions

### `supply(uint256 value)`
Allows users to deposit ERC20 tokens into the protocol.

### `takeLoan(uint256 value)`
Borrow tokens by sending ETH as collateral. Interest rate is fixed at 10%.

### `settleLoan()`
Repay the loan with interest to get your collateral back.

### `withdrawEarnings(address receiver, uint256 value)`
Owner-only function to withdraw protocol earnings.

## Security
- Uses OpenZeppelin's `ReentrancyGuard` for protection against reentrancy attacks
- Uses `Ownable` for access control
- Requires proper collateral before loan disbursement

## Dependencies
- OpenZeppelin Contracts v5.0+
- Solidity ^0.8.20