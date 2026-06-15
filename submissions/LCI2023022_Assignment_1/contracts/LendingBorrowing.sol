// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LoanTypes.sol";

/**
 * @title LendingBorrowing
 * @notice A decentralized lending and borrowing system where users can deposit ERC20 tokens
 *         and others can borrow using ETH as collateral.
 * @dev Uses OpenZeppelin's Ownable and ReentrancyGuard for security.
 */
contract LendingBorrowing is Ownable, ReentrancyGuard {
    using LoanTypes for LoanTypes.Storage;
    LoanTypes.Storage private store;

    IERC20 public token;

    event Deposited(address indexed lender, uint256 amount);
    event Borrowed(address indexed borrower, uint256 amount, uint256 collateral);
    event Repaid(address indexed borrower, uint256 amount);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        token = IERC20(_tokenAddress);
    }

    /**
     * @notice Deposit tokens into the lending pool.
     * @param amount Amount of tokens to deposit.
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        token.transferFrom(msg.sender, address(this), amount);
        store.lenderBalances[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    /**
     * @notice Borrow tokens using ETH as collateral.
     * @param amount Amount of tokens to borrow.
     */
    function borrow(uint256 amount) external payable nonReentrant {
        require(store.loans[msg.sender].amount == 0, "Active loan exists");
        require(msg.value > 0, "Collateral required");

        store.loans[msg.sender] = LoanTypes.Loan({
            borrower: msg.sender,
            amount: amount,
            collateral: msg.value,
            interestRate: 10, // Fixed 10% interest rate
            repaid: false
        });

        token.transfer(msg.sender, amount);
        emit Borrowed(msg.sender, amount, msg.value);
    }

    /**
     * @notice Repay a loan with interest to reclaim collateral.
     */
    function repay() external nonReentrant {
        LoanTypes.Loan storage loan = store.loans[msg.sender];
        require(!loan.repaid, "Already repaid");
        require(loan.amount > 0, "No active loan");

        uint256 totalDue = loan.amount + (loan.amount * loan.interestRate / 100);
        token.transferFrom(msg.sender, address(this), totalDue);
        loan.repaid = true;

        payable(msg.sender).transfer(loan.collateral);
        emit Repaid(msg.sender, totalDue);
    }

    /**
     * @notice Owner can withdraw collected profits.
     * @param to Address receiving the withdrawal.
     * @param amount Amount of tokens to withdraw.
     */
    function withdrawProfits(address to, uint256 amount) external onlyOwner {
        token.transfer(to, amount);
    }

    /**
     * @notice View lender balance.
     */
    function getLenderBalance(address lender) external view returns (uint256) {
        return store.lenderBalances[lender];
    }

    /**
     * @notice View loan details of a borrower.
     */
    function getLoan(address borrower) external view returns (LoanTypes.Loan memory) {
        return store.loans[borrower];
    }
}
