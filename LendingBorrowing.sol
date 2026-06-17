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
    
    uint256 public totalLent;
    uint256 public totalRepaid;
    uint256 public constant COLLATERAL_RATIO = 150; 
    uint256 public constant INTEREST_RATE = 10;

    event Deposited(address indexed lender, uint256 amount);
    event Borrowed(address indexed borrower, uint256 amount, uint256 collateral);
    event Repaid(address indexed borrower, uint256 amount);
    event Withdrawn(address indexed lender, uint256 amount);

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
        require(amount > 0, "Amount must be > 0");
        
        require(token.balanceOf(address(this)) >= totalLent + amount, "Insufficient funds available");
        
        uint256 requiredCollateral = (amount * COLLATERAL_RATIO) / 100;
        require(msg.value >= requiredCollateral, "Insufficient collateral");

        loans[msg.sender] = Loan({
            borrower: msg.sender,
            amount: amount,
            collateral: msg.value,
            interestRate: INTEREST_RATE,
            repaid: false
        });

        totalLent += amount;
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
        totalLent -= loan.amount;
        totalRepaid += totalDue;

        payable(msg.sender).transfer(loan.collateral);
        emit Repaid(msg.sender, totalDue);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(lenderBalances[msg.sender] >= amount, "Insufficient balance");
        require(amount > 0, "Amount must be > 0");
        
        uint256 availableToWithdraw = token.balanceOf(address(this)) - totalLent;
        require(amount <= availableToWithdraw, "Insufficient available funds");
        
        lenderBalances[msg.sender] -= amount;
        token.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function withdrawProfits(address to, uint256 amount) external onlyOwner {
        uint256 profits = totalRepaid - (totalRepaid * 100 / (100 + INTEREST_RATE));
        require(amount <= profits, "Cannot withdraw lender funds");
        token.transfer(to, amount);
    }

    function getAvailableFunds() external view returns (uint256) {
        return token.balanceOf(address(this)) - totalLent;
    }
    
    function getLoanDetails(address borrower) external view returns (Loan memory) {
        return loans[borrower];
    }
    
    function calculateRepaymentAmount(address borrower) external view returns (uint256) {
        Loan memory loan = loans[borrower];
        if (loan.amount == 0 || loan.repaid) return 0;
        return loan.amount + (loan.amount * loan.interestRate / 100);
    }
}