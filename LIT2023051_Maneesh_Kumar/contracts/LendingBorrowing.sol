// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LendingBorrowing is Ownable {
    IERC20 public token;

    mapping(address => uint256) public deposits;
    mapping(address => uint256) public loans;

    constructor(address _token) {
        token = IERC20(_token);
    }

    // Deposit tokens
    function deposit(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        token.transferFrom(msg.sender, address(this), amount);
        deposits[msg.sender] += amount;
    }

    // Borrow tokens (simple version)
    function borrow(uint256 amount) external {
        require(deposits[msg.sender] >= amount / 2, "Not enough collateral");
        require(token.balanceOf(address(this)) >= amount, "Insufficient pool balance");
        loans[msg.sender] += amount;
        token.transfer(msg.sender, amount);
    }

    // Repay loan
    function repay(uint256 amount) external {
        require(loans[msg.sender] >= amount, "Too much repayment");
        token.transferFrom(msg.sender, address(this), amount);
        loans[msg.sender] -= amount;
    }

    // Check total balance
    function contractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
