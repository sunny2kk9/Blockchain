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
        uint256 startTime;
        bool repaid;
    }

    mapping(address => uint256) public lenderBalances;
    mapping(address => Loan) public loans;
    
    uint256 public totalDeposits;
    uint256 public totalBorrowed;
    uint256 public constant COLLATERAL_RATIO = 150; // 150% collateralization
    uint256 public constant INTEREST_RATE = 10; // 10% annual interest
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    event Deposited(address indexed lender, uint256 amount);
    event Withdrawn(address indexed lender, uint256 amount);
    event Borrowed(address indexed borrower, uint256 amount, uint256 collateral);
    event Repaid(address indexed borrower, uint256 amount);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        token = IERC20(_tokenAddress);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        token.transferFrom(msg.sender, address(this), amount);
        lenderBalances[msg.sender] += amount;
        totalDeposits += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(lenderBalances[msg.sender] >= amount, "Insufficient balance");
        require(totalDeposits - totalBorrowed >= amount, "Insufficient liquidity");
        
        lenderBalances[msg.sender] -= amount;
        totalDeposits -= amount;
        token.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function borrow(uint256 amount) external payable nonReentrant {
        require(loans[msg.sender].amount == 0, "Active loan exists");
        require(msg.value > 0, "Collateral required");
        require(amount > 0, "Borrow amount must be > 0");
        require(totalDeposits - totalBorrowed >= amount, "Insufficient liquidity");
        
        // Check collateral ratio: collateral value must be >= 150% of borrow amount
        // Assuming 1 ETH = 1 token for simplicity (in production, use oracle)
        require(msg.value * 100 >= amount * COLLATERAL_RATIO, "Insufficient collateral");

        loans[msg.sender] = Loan({
            borrower: msg.sender,
            amount: amount,
            collateral: msg.value,
            interestRate: INTEREST_RATE,
            startTime: block.timestamp,
            repaid: false
        });

        totalBorrowed += amount;
        token.transfer(msg.sender, amount);
        emit Borrowed(msg.sender, amount, msg.value);
    }

    function repay() external nonReentrant {
        Loan storage loan = loans[msg.sender];
        require(!loan.repaid, "Already repaid");
        require(loan.amount > 0, "No active loan");

        uint256 timeElapsed = block.timestamp - loan.startTime;
        uint256 interest = (loan.amount * loan.interestRate * timeElapsed) / (100 * SECONDS_PER_YEAR);
        uint256 totalDue = loan.amount + interest;
        
        token.transferFrom(msg.sender, address(this), totalDue);
        loan.repaid = true;
        totalBorrowed -= loan.amount;

        payable(msg.sender).transfer(loan.collateral);
        emit Repaid(msg.sender, totalDue);
    }

    function getLoanDetails(address borrower) external view returns (
        uint256 amount,
        uint256 collateral,
        uint256 interestRate,
        uint256 startTime,
        uint256 currentDebt,
        bool repaid
    ) {
        Loan memory loan = loans[borrower];
        uint256 timeElapsed = block.timestamp - loan.startTime;
        uint256 interest = loan.repaid ? 0 : (loan.amount * loan.interestRate * timeElapsed) / (100 * SECONDS_PER_YEAR);
        
        return (
            loan.amount,
            loan.collateral,
            loan.interestRate,
            loan.startTime,
            loan.amount + interest,
            loan.repaid
        );
    }

    function withdrawProfits(address to, uint256 amount) external onlyOwner {
        token.transfer(to, amount);
    }
}