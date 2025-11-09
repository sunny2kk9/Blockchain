// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LendingBorrowing is Ownable, ReentrancyGuard {
    IERC20 public token;

    struct Loan {
        address borrower;
        uint256 amount;
        uint256 collateral;
        uint256 interestRate;
        bool repaid;
    }

    mapping(address => uint256) public lenderBalances;
    mapping(address => Loan) public loans;

    event Deposited(address indexed lender, uint256 amount);
    event Borrowed(address indexed borrower, uint256 amount, uint256 collateral);
    event Repaid(address indexed borrower, uint256 amount);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        token = IERC20(_tokenAddress);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        token.transferFrom(msg.sender, address(this), amount);
        lenderBalances[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    function borrow(uint256 amount) external payable nonReentrant {
        require(loans[msg.sender].amount == 0, "Active loan exists");
        require(msg.value > 0, "Collateral required");

        loans[msg.sender] = Loan({
            borrower: msg.sender,
            amount: amount,
            collateral: msg.value,
            interestRate: 10,
            repaid: false
        });

        token.transfer(msg.sender, amount);
        emit Borrowed(msg.sender, amount, msg.value);
    }

    function repay() external nonReentrant {
        Loan storage loan = loans[msg.sender];
        require(!loan.repaid, "Already repaid");
        require(loan.amount > 0, "No active loan");

        uint256 totalDue = loan.amount + (loan.amount * loan.interestRate / 100);
        token.transferFrom(msg.sender, address(this), totalDue);
        loan.repaid = true;

        payable(msg.sender).transfer(loan.collateral);
        emit Repaid(msg.sender, totalDue);
    }

    function withdrawProfits(address to, uint256 amount) external onlyOwner {
        token.transfer(to, amount);
    }
}
