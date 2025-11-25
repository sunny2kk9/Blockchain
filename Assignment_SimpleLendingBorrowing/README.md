# 🪙 Blockchain Assignment: Simple Lending Protocol

**Name:** Eshant Gupta
**Roll No:** LCB2023016

---

## 📖 Project Description

This project is a `SimpleLending` protocol. It allows users to deposit an ERC20 token (Token A) as lending and, in return, borrow another ERC20 token (Token B) by providing it as collateral. The contract uses OpenZeppelin libraries for security and calculates a health factor to protect against insolvency.

This project was built and tested in the Remix IDE.

---

## 📂 Contracts Overview

This project consists of two main files:

* **`/contracts/SimpleLending.sol`**: The main protocol contract. It handles all logic for deposits, borrowing, repaying, withdrawing collateral, and liquidations. It is secured with several OpenZeppelin contracts.
* **`/contracts/Mocks.sol`**: Contains the mock contracts required for testing in a development environment. This includes `MockERC20` (to create test tokens) and `MockPriceFeed` (to simulate a Chainlink price oracle).

---

## 🛡️ OpenZeppelin Libraries Used

As per the assignment requirements, this project heavily utilizes OpenZeppelin's battle-tested libraries:

* **`@openzeppelin/contracts/token/ERC20/IERC20.sol`**: The standard interface for interacting with ERC20 tokens.
* **`@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol`**: Provides `safeTransfer` and `safeTransferFrom` functions to prevent failed token transfers.
* **`@openzeppelin/contracts/security/ReentrancyGuard.sol`**: Inherited by the contract, and the `nonReentrant` modifier is used to protect all functions that move tokens (`deposit`, `withdraw`, `borrow`, `repay`, `withdrawCollateral`, `liquidate`).
* **`@openzeppelin/contracts/access/Ownable.sol`**: Inherited by the contract to provide a secure access control mechanism. Only the "owner" (deployer) can call critical admin functions.
* **`@openzeppelin/contracts/security/Pausable.sol`**: Inherited by the contract to allow the owner to pause all key functions (`deposit`, `withdraw`, etc.) in case of an emergency.

---

## 🔐 Security Description

The security of the `SimpleLending` contract is centered on preventing common smart contract vulnerabilities, ensuring the correctness of financial logic, and leveraging industry-standard libraries for robust protection.

### 1. Re-entrancy Attack Prevention
This is the most critical security feature for a lending protocol.
* **Implementation**: The contract inherits from OpenZeppelin's `ReentrancyGuard.sol`.
* **How it Works**: The `nonReentrant` modifier is applied to all key functions that involve token transfers and state changes: `deposit()`, `withdraw()`, `borrow()`, `repay()`, `withdrawCollateral()`, and `liquidate()`.
* **Effect**: This modifier locks the contract, preventing a malicious user or contract from calling back into the function before the first call is finished. This directly stops an attacker from repeatedly borrowing or withdrawing funds before their balance or debt can be updated.

### 2. Arithmetic Safety
* **Implementation**: The project is built using **Solidity `^0.8.20`**.
* **How it Works**: All versions of Solidity from 0.8.0 onwards include built-in checks for integer overflow and underflow.
* **Effect**: Any calculation that results in a number wrapping around (e.g., a balance going below zero) will automatically cause the transaction to revert. This eliminates an entire class of critical bugs related to arithmetic.

### 3. Logic and State Validation
The contract enforces a strict order of operations and validates the user's state at every step using `require()` statements.
* **On `borrow()`**: A `require()` statement checks that the user's new position will be sufficiently collateralized (`newTotalDebt <= maxBorrowable`). This ensures no user can take on a loan that is immediately under-collateralized.
* **On `withdrawCollateral()`**: A `require()` statement validates that even after withdrawing, the user's remaining position is still healthy (`currentDebt <= maxBorrowable`). This is the core mechanism that guarantees loans remain solvent.
* **On `liquidate()`**: A `require()` statement checks that the user's health factor is below the threshold (`< 100`) before allowing anyone to liquidate the position.

### 4. Access Control
* **Implementation**: The contract inherits from OpenZeppelin's **`Ownable.sol`** and **`Pausable.sol`**.
* **Effect**: This provides a robust and standard way to manage administrative privileges.
    * **Ownership**: Critical functions that change the contract's parameters (like `setInterestRate`, `setCollateralizationRatio`, and `setPriceFeed`) are marked `onlyOwner`. This prevents any unauthorized user from changing the rules of the protocol.
    * **Pausable**: The contract includes `pause()` and `unpause()` functions (also `onlyOwner`) that can stop all major interactions. This acts as an emergency "off-switch" if a vulnerability is found, protecting user funds.

### 5. Known Assumptions
* **Price Oracle**: The contract correctly uses the `AggregatorV3Interface` but is deployed with a `MockPriceFeed` for this assignment. This is a known trust assumption. In a production environment, this mock address would be replaced with a real, decentralized Chainlink Price Feed to prevent price manipulation attacks.

---

## 🧪 How to Test in Remix

1.  Open Remix and create two files: `SimpleLending.sol` and `Mocks.sol`.
2.  Paste the provided code into each file.
3.  **Deploy `Mocks.sol`**: This will deploy `MockERC20` (for the loan token), `MockERC20` (for the collateral token), and `MockPriceFeed`.
4.  Deploy `MockERC20` twice, giving each a name/symbol (e.g., "LoanToken" / "LOAN" and "CollateralToken" / "COL").
5.  Deploy `MockPriceFeed`.
6.  **Deploy `SimpleLending.sol`**: Copy the three addresses from the previous step and paste them into the constructor fields for `_loanToken`, `_collateralToken`, and `_priceFeed`.
7.  **Run Test Scenario**:
    * Use the `mint` function on your two `MockERC20` contracts to give your test wallet (e.g., `0x5B3...`) funds.
    * Use the `approve` function on both `MockERC20` contracts to give the `SimpleLending` contract address permission to spend your tokens.
    * Follow the transaction steps outlined in the "Proof of Functionality" section below.

---

## ✅ Proof of Functionality (Transaction Logs)

Here is a step-by-step test of the full contract lifecycle.

### 🔑 Key Addresses & Setup

* **SimpleLending Contract**: `0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47`
* **Loan Token (Token A)**: `0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8`
* **Collateral Token (Token B)**: `0xf8e81D47203A594245E36C48e151709F0C19fBe8`
* **Mock Price Feed**: `0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B`
* **My Address (User)**: `0x5B38Da6a701c568545dCfcB03FcB875f56beddC4`

*(Note: The hashes and gas costs below are from a test environment and may vary.)*

### Step 1: Minting Tokens

<img width="1513" height="410" alt="Image" src="https://github.com/user-attachments/assets/5350052f-9533-483b-a8a5-532c2085b0f6" />
<img width="968" height="399" alt="Image" src="https://github.com/user-attachments/assets/5bad4437-b48c-4898-8226-e211d982294c" />
<img width="1209" height="462" alt="Image" src="https://github.com/user-attachments/assets/103fa5a3-68e6-4384-baf2-e0b37b74769c" />
<img width="1185" height="356" alt="Image" src="https://github.com/user-attachments/assets/59153aae-8f51-4435-83a1-beac298026e5" />
<img width="1524" height="438" alt="Image" src="https://github.com/user-attachments/assets/f298b195-b8c0-4ea0-8f83-428a741616ff" />
<img width="1065" height="408" alt="Image" src="https://github.com/user-attachments/assets/df5faeb6-9c19-44bf-ad04-3ac32e63b588" />
<img width="1191" height="266" alt="Image" src="https://github.com/user-attachments/assets/edf46fda-68d2-44b8-b2e9-d79b96a14184" />
<img width="1156" height="409" alt="Image" src="https://github.com/user-attachments/assets/4c7f68d7-028e-4729-9374-a0f0655f4d56" />







### Step 2: Approving the Lending Contract






<img width="1334" height="452" alt="Image" src="https://github.com/user-attachments/assets/22c8b4cf-57b2-41c3-a065-353ebdd888e4" />
<img width="1135" height="472" alt="Image" src="https://github.com/user-attachments/assets/275cd31c-e426-474d-9b49-2456794558e4" />
<img width="1079" height="365" alt="Image" src="https://github.com/user-attachments/assets/c2904b84-9ef0-4d6b-bd90-2a72fa418bab" />
<img width="1327" height="458" alt="Image" src="https://github.com/user-attachments/assets/01c615c0-7b72-4651-a76e-f20ffbe34366" />
<img width="1115" height="476" alt="Image" src="https://github.com/user-attachments/assets/5d3c1ee9-322a-48d2-bab6-9ef678861803" />
<img width="1074" height="383" alt="Image" src="https://github.com/user-attachments/assets/83f38cf6-0832-461f-b59a-b852fc5baec4" />

### Step 3: Depositing Lending (Token A)






<img width="1308" height="485" alt="Image" src="https://github.com/user-attachments/assets/afaa1724-7d91-46f5-8dad-234dd9556fa8" />
<img width="1070" height="479" alt="Image" src="https://github.com/user-attachments/assets/aa6bf6ec-b4ac-4dff-b7d0-bb86a2e3789e" />
<img width="1098" height="466" alt="Image" src="https://github.com/user-attachments/assets/1df71606-b8a2-40d3-99e4-afa4af8d0795" />
<img width="1070" height="329" alt="Image" src="https://github.com/user-attachments/assets/5762178e-99f0-4dfc-bac7-1ca143c08d87" />
<img width="1202" height="467" alt="Image" src="https://github.com/user-attachments/assets/fb58a653-1d21-4ad1-a24b-15eaefbd5148" />
<img width="831" height="313" alt="Image" src="https://github.com/user-attachments/assets/d8d7e307-4039-4a66-8140-186324d54a88" />

### Step 4: Borrowing (Token A) using Collateral (Token B)



<img width="1336" height="488" alt="Image" src="https://github.com/user-attachments/assets/801127da-4300-48c7-b89a-22bfb4dc4520" />
<img width="1232" height="487" alt="Image" src="https://github.com/user-attachments/assets/eef4f8a3-d562-44d5-ad52-443ba733a297" />
<img width="1267" height="485" alt="Image" src="https://github.com/user-attachments/assets/539f88fd-7d71-4df3-acc9-dcffc89d441f" />
<img width="1216" height="470" alt="Image" src="https://github.com/user-attachments/assets/8062c550-13f0-4fc6-a032-c34be43d4c80" />
<img width="1597" height="408" alt="Image" src="https://github.com/user-attachments/assets/9a9ad209-6d04-41a8-84f7-3bfbd56d8186" />



### Step 5: Checking Health Factor

<img width="1034" height="519" alt="Image" src="https://github.com/user-attachments/assets/b03f398f-4d07-46c3-ab82-c2fae1387091" />

### Step 6: Repaying the Loan (with Interest)

<img width="1137" height="527" alt="Image" src="https://github.com/user-attachments/assets/2ec1de93-f894-430c-afa8-0c524cf879e5" />
<img width="1090" height="482" alt="Image" src="https://github.com/user-attachments/assets/3776c837-53b4-4118-a139-24e007217be3" />
<img width="1412" height="500" alt="Image" src="https://github.com/user-attachments/assets/fbccbe9e-54f4-4ef8-95fb-3e767f6623b8" />



### Step 7: Withdrawing Collateral
<img width="1229" height="496" alt="Image" src="https://github.com/user-attachments/assets/93644c0d-ff9e-4534-8d82-bc475945012c" />
<img width="941" height="493" alt="Image" src="https://github.com/user-attachments/assets/64031ed4-ed7f-4bc9-b4be-76be1c69b787" />
<img width="885" height="183" alt="Image" src="https://github.com/user-attachments/assets/89c55048-7e24-434f-be8d-7984795eed12" />


