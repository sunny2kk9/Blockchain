// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LendingBorrowing is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

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

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        token.safeTransferFrom(msg.sender, address(this), amount);
        lenderBalances[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    function borrow(uint256 amount) external payable nonReentrant {
        require(loans[msg.sender].amount == 0, "Active loan exists");
        require(msg.value > 0, "Collateral required");
        require(token.balanceOf(address(this)) >= amount, "Insufficient liquidity");

        loans[msg.sender] = Loan({
            borrower: msg.sender,
            amount: amount,
            collateral: msg.value,
            interestRate: 10,
            repaid: false
        });

        token.safeTransfer(msg.sender, amount);
        emit Borrowed(msg.sender, amount, msg.value);
    }

    function repay() external nonReentrant {
        Loan storage loan = loans[msg.sender];
        require(loan.amount > 0, "No active loan");
        require(!loan.repaid, "Already repaid");

        uint256 totalDue = loan.amount + (loan.amount * loan.interestRate) / 100;

        // Pull repayment tokens
        token.safeTransferFrom(msg.sender, address(this), totalDue);

        // Mark repaid and zero collateral before sending ETH back
        loan.repaid = true;
        uint256 collateralAmount = loan.collateral;
        loan.collateral = 0;

        // Return collateral
        (bool sent, ) = payable(msg.sender).call{value: collateralAmount}("");
        require(sent, "Collateral transfer failed");

        emit Repaid(msg.sender, totalDue);
    }

    function withdrawProfits(address to, uint256 amount) external onlyOwner {
        token.safeTransfer(to, amount);
    }
}