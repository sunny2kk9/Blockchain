// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LendingBorrowing is Ownable {
    IERC20 public token;

    struct Loan {
        uint256 amount;
        uint256 collateral;
        address borrower;
        bool repaid;
    }

    mapping(address => Loan) public loans;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function lend(address _borrower, uint256 _amount, uint256 _collateral) public onlyOwner {
        require(loans[_borrower].amount == 0, "Loan already exists");
        loans[_borrower] = Loan(_amount, _collateral, _borrower, false);
    }

    function repay() public {
        Loan storage loan = loans[msg.sender];
        require(!loan.repaid, "Already repaid");
        require(loan.amount > 0, "No active loan");

        token.transferFrom(msg.sender, owner(), loan.amount);
        loan.repaid = true;
    }

    function getLoanDetails(address _borrower) public view returns (Loan memory) {
        return loans[_borrower];
    }
}
