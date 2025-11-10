// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LendingProtocol is Ownable, ReentrancyGuard {
    IERC20 public stableToken;

    uint256 public ltvPercentage;
    uint256 public ethToTokenPrice;
    uint256 public interestRatePerSecond;
    uint256 public totalSupplied;

    struct BorrowInfo {
        uint256 borrowedAmount;
        uint256 stakedCollateral;
        uint256 loanStartTime;
    }

    mapping(address => uint256) public providerBalance;
    mapping(address => BorrowInfo) public activeLoans;

    event TokensSupplied(address indexed provider, uint256 value);
    event TokensWithdrawn(address indexed provider, uint256 value);
    event TokensBorrowed(address indexed user, uint256 value, uint256 collateral);
    event LoanCleared(address indexed user, uint256 totalPaid);

    constructor(
        address tokenAddress,
        uint256 _ltvPercentage,
        uint256 _ethToTokenPrice,
        uint256 _interestRatePerSecond
    ) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Token cannot be zero address");
        stableToken = IERC20(tokenAddress);
        ltvPercentage = _ltvPercentage;
        ethToTokenPrice = _ethToTokenPrice;
        interestRatePerSecond = _interestRatePerSecond;
    }

    function supply(uint256 value) external nonReentrant {
        require(value > 0, "Supply amount must be positive");
        stableToken.transferFrom(msg.sender, address(this), value);
        
        providerBalance[msg.sender] += value;
        totalSupplied += value;
        
        emit TokensSupplied(msg.sender, value);
    }

    function withdrawSupply(uint256 value) external nonReentrant {
        require(value > 0, "Withdraw amount must be positive");
        require(providerBalance[msg.sender] >= value, "Insufficient supplied balance");
        
        require(stableToken.balanceOf(address(this)) >= value, "Insufficient protocol liquidity");

        providerBalance[msg.sender] -= value;
        totalSupplied -= value;

        stableToken.transfer(msg.sender, value);
        
        emit TokensWithdrawn(msg.sender, value);
    }

    function takeLoan(uint256 value) external payable nonReentrant {
        require(activeLoans[msg.sender].borrowedAmount == 0, "Existing loan active");
        require(msg.value > 0, "Collateral must be sent");
        require(value > 0, "Must borrow a positive amount");

        require(stableToken.balanceOf(address(this)) >= value, "Insufficient protocol liquidity");

        uint256 collateralValueInTokens = (msg.value * ethToTokenPrice) / 1e18;
        uint256 maxBorrowable = (collateralValueInTokens * ltvPercentage) / 100;

        require(value <= maxBorrowable, "Borrow amount exceeds LTV");

        activeLoans[msg.sender] = BorrowInfo({
            borrowedAmount: value,
            stakedCollateral: msg.value,
            loanStartTime: block.timestamp
        });

        stableToken.transfer(msg.sender, value);
        emit TokensBorrowed(msg.sender, value, msg.value);
    }

    function settleLoan() external nonReentrant {
        BorrowInfo storage loanData = activeLoans[msg.sender];
        require(loanData.borrowedAmount > 0, "No loan found");

        uint256 timeElapsed = block.timestamp - loanData.loanStartTime;
        uint256 interest = (loanData.borrowedAmount * interestRatePerSecond * timeElapsed) / 1e18;
        uint256 amountToRepay = loanData.borrowedAmount + interest;
        
        uint256 collateralToReturn = loanData.stakedCollateral;

        delete activeLoans[msg.sender];

        stableToken.transferFrom(msg.sender, address(this), amountToRepay);
        payable(msg.sender).transfer(collateralToReturn);
        
        emit LoanCleared(msg.sender, amountToRepay);
    }

    function withdrawEarnings(address receiver, uint256 value) external onlyOwner {
        uint256 currentBalance = stableToken.balanceOf(address(this));
        uint256 earnings = currentBalance - totalSupplied;
        
        require(value <= earnings, "Cannot withdraw more than earnings");
        stableToken.transfer(receiver, value);
    }
    
    function setLTV(uint256 _ltvPercentage) external onlyOwner {
        require(_ltvPercentage <= 80, "LTV cannot be over 80%");
        ltvPercentage = _ltvPercentage;
    }

    function setPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Price must be positive");
        ethToTokenPrice = _newPrice;
    }
    
    function setInterestRate(uint256 _newRatePerSecond) external onlyOwner {
        interestRatePerSecond = _newRatePerSecond;
    }
}
