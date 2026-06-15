// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LoanTypes
 * @notice Contains all shared data structures and storage mappings
 * used in the LendingBorrowing contract.
 */
library LoanTypes {
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 collateral;
        uint256 interestRate;
        bool repaid;
    }

    struct Storage {
        mapping(address => uint256) lenderBalances;
        mapping(address => Loan) loans;
    }
}
