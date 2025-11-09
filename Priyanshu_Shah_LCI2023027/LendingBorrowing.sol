// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LendingBorrowing is Ownable, ReentrancyGuard {
    IERC20 public assetToken;

    struct BorrowPosition {
        address user;
        uint256 loanAmount;
        uint256 collateralAmount;
        uint256 interestRate;
        bool isRepaid;
    }

    mapping(address => uint256) public depositedLiquidity;
    mapping(address => BorrowPosition) public borrowRecords;

    event LiquidityDeposited(address indexed lender, uint256 amount);
    event LoanTaken(address indexed borrower, uint256 loanAmount, uint256 collateralAmount);
    event LoanRepaid(address indexed borrower, uint256 totalRepaid);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        assetToken = IERC20(_tokenAddress);
    }

    function deposit(uint256 depositAmount) external nonReentrant {
        require(depositAmount > 0, "Amount must be > 0");
        assetToken.transferFrom(msg.sender, address(this), depositAmount);
        depositedLiquidity[msg.sender] += depositAmount;
        emit LiquidityDeposited(msg.sender, depositAmount);
    }

    function borrow(uint256 loanAmount) external payable nonReentrant {
        require(borrowRecords[msg.sender].loanAmount == 0, "Existing active loan");
        require(msg.value > 0, "Collateral required");

        borrowRecords[msg.sender] = BorrowPosition({
            user: msg.sender,
            loanAmount: loanAmount,
            collateralAmount: msg.value,
            interestRate: 10,
            isRepaid: false
        });

        assetToken.transfer(msg.sender, loanAmount);
        emit LoanTaken(msg.sender, loanAmount, msg.value);
    }

    function repay() external nonReentrant {
        BorrowPosition storage position = borrowRecords[msg.sender];
        require(!position.isRepaid, "Loan already repaid");
        require(position.loanAmount > 0, "No active loan");

        uint256 totalDue = position.loanAmount + (position.loanAmount * position.interestRate / 100);
        assetToken.transferFrom(msg.sender, address(this), totalDue);
        position.isRepaid = true;

        payable(msg.sender).transfer(position.collateralAmount);
        emit LoanRepaid(msg.sender, totalDue);
    }

    function withdrawProfits(address receiver, uint256 withdrawAmount) external onlyOwner {
        assetToken.transfer(receiver, withdrawAmount);
    }
}
