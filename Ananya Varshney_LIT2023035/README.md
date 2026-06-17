# Lending and Borrowing Smart Contract (OpenZeppelin Based)

This smart contract implements a simple decentralized lending and borrowing system using OpenZeppelin libraries for security and standardization.  
Users can deposit ERC-20 tokens as collateral and borrow another ERC-20 asset against it. The system tracks deposits, loans, repayments, and ensures all borrowing remains overcollateralized. Interest accumulates over time, and undercollateralized loans can be liquidated by others.

The contract aims to demonstrate the working of a DeFi-style lending pool in a simplified, educational form.

---

## Main Components 

- **collateralToken:** The ERC-20 token users deposit as collateral (to secure their loans).  
- **borrowToken:** The ERC-20 token users can borrow from the pool.  
- **collateralFactor:** Defines the ratio between the value of collateral and the maximum loan allowed (in basis points, e.g., 7500 = 75%).  
- **interestPerSecond:** Determines how much interest accumulates on borrowed amounts over time.  
- **liquidationBonus:** Bonus percentage given to the liquidator when they liquidate an unhealthy loan.

Borrowers lock collateral, borrow tokens, and pay interest. If their collateral becomes insufficient, anyone can liquidate their position by paying back their loan and claiming their collateral.

---

## Important Functions

### Constructor
Initializes the contract by setting up:
- Collateral and borrow token addresses  
- Collateral factor, interest rate, and liquidation bonus  

It validates that both tokens are valid ERC-20 addresses and the parameters are within safe ranges.  
This setup ensures that the lending pool starts with defined risk management settings.

---

### depositCollateral(amount)
Users deposit a chosen amount of the collateral token into the contract.  
The function uses **OpenZeppelin’s SafeERC20** to safely transfer tokens and updates the user’s collateral balance.  
Depositing collateral allows the user to later borrow against it.

---

### withdrawCollateral(amount)
Allows users to withdraw part or all of their collateral — but only if they don’t exceed their borrowing limit.  
The contract checks if the remaining collateral is sufficient for any outstanding debt.  
This prevents users from making their loans undercollateralized.

---

### borrow(amount)
A user can borrow tokens as long as:
- They have enough collateral deposited  
- Their loan-to-value ratio (LTV) remains within the allowed `collateralFactor`  

The borrowed amount is transferred to the user, their debt balance is updated, and a timestamp is recorded to later calculate interest.  
**ReentrancyGuard** is used to prevent nested borrow/withdraw exploits.

---

### repay(amount)
The borrower repays part or all of their borrowed tokens.  
The contract:
- Calculates accumulated interest since the last borrow  
- Adds it to the total repayment amount  
- Updates the borrower’s debt and reduces it accordingly  

Once the full debt (principal + interest) is paid, the user can withdraw all their collateral.

---

### liquidate(borrower)
If a borrower’s loan becomes unsafe (i.e., the collateral value drops below the required threshold), anyone can liquidate it.  
The liquidator:
- Pays back the borrower’s debt  
- Receives their collateral plus a small liquidation bonus  

This keeps the pool solvent and ensures lenders’ funds are protected.

---

### setRiskParameters()
An **owner-only** function allowing the admin to adjust:
- `collateralFactor`
- `interestPerSecond`
- `liquidationBonus`

This flexibility lets the pool respond to changing market or token conditions.  
The function is protected by OpenZeppelin’s **Ownable** modifier to prevent unauthorized access.

---

### emergencyWithdrawToken()
Allows the owner to withdraw any unrelated tokens accidentally sent to the contract (excluding the main collateral and borrow tokens).  
This is a safety measure to recover tokens without affecting active lending positions.

---

## Interest Calculation
Interest is calculated linearly over time:


