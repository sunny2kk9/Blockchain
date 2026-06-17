// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import OpenZeppelin libraries
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

contract LendingBorrowing is Ownable {

    // ERC20 token used for lending and borrowing
    IERC20 public token;

    // Interest rate (annualized for simplicity)
    uint256 public interestRate = 10;

    // Track deposits and loans
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public loans;

    // ✅ Constructor requires token address and initial owner
    constructor(address _tokenAddress, address _owner) Ownable(_owner) {
        token = IERC20(_tokenAddress);
    }

    // Lender deposits tokens into the contract
    function deposit(uint256 amount) external {
        require(amount > 0, "Deposit must be greater than 0");
        token.transferFrom(msg.sender, address(this), amount);
        deposits[msg.sender] += amount;
    }

    // Borrower borrows tokens
    function borrow(uint256 amount) external {
        require(amount > 0, "Borrow amount must be greater than 0");
        require(token.balanceOf(address(this)) >= amount, "Insufficient liquidity in pool");

        loans[msg.sender] += amount;
        token.transfer(msg.sender, amount);
    }

    // Borrower repays with simple interest
    function repay(uint256 amount) external {
        require(loans[msg.sender] > 0, "No active loan");

        uint256 interest = (loans[msg.sender] * interestRate) / 100;
        uint256 totalOwed = loans[msg.sender] + interest;
        require(amount >= totalOwed, "Amount less than owed");

        token.transferFrom(msg.sender, address(this), totalOwed);
        loans[msg.sender] = 0;
    }

    // Lender withdraws deposit
    function withdraw(uint256 amount) external {
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        deposits[msg.sender] -= amount;
        token.transfer(msg.sender, amount);
    }

    // View total liquidity
    function getContractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
