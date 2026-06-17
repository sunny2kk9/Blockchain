// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LendingBorrowing {
    struct Loan {
        address borrower;
        uint amount;
        bool repaid;
    }

    mapping(address => uint) public balances;
    mapping(uint => Loan) public loans;
    uint public loanCount;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function lend(address borrower, uint amount) external {
        require(balances[msg.sender] >= amount, "Not enough balance");
        loanCount++;
        loans[loanCount] = Loan(borrower, amount, false);
        balances[msg.sender] -= amount;
    }

    function repay(uint loanId) external payable {
        Loan storage loan = loans[loanId];
        require(msg.sender == loan.borrower, "Not borrower");
        require(!loan.repaid, "Already repaid");
        require(msg.value == loan.amount, "Wrong amount");

        loan.repaid = true;
    }
}
