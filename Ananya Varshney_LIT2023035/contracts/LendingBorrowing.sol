// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SimpleLendingBorrowing is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable collateralToken;
    IERC20 public immutable borrowToken;

    uint256 public collateralFactor; // scaled by 1e4
    uint256 public interestPerSecond; // scaled by 1e18
    uint256 public liquidationBonus; // scaled by 1e4

    mapping(address => uint256) public collateralBalance;
    mapping(address => uint256) public borrowPrincipal;
    mapping(address => uint256) public lastBorrowTimestamp;

    event DepositCollateral(address indexed user, uint256 amount);
    event WithdrawCollateral(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);
    event Liquidate(address indexed liquidator, address indexed borrower, uint256 repayAmount, uint256 collateralSeized);

    constructor(
        address _collateralToken,
        address _borrowToken,
        uint256 _collateralFactor,
        uint256 _interestPerSecond,
        uint256 _liquidationBonus
    ) {
        require(_collateralToken != address(0) && _borrowToken != address(0), "Zero token");
        require(_collateralFactor <= 10000, "Invalid factor");
        collateralToken = IERC20(_collateralToken);
        borrowToken = IERC20(_borrowToken);
        collateralFactor = _collateralFactor;
        interestPerSecond = _interestPerSecond;
        liquidationBonus = _liquidationBonus;
    }

    function depositCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");
        collateralToken.safeTransferFrom(msg.sender, address(this), amount);
        collateralBalance[msg.sender] += amount;
        emit DepositCollateral(msg.sender, amount);
    }

    function withdrawCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");
        require(collateralBalance[msg.sender] >= amount, "not enough collateral");

        uint256 newCollateral = collateralBalance[msg.sender] - amount;
        uint256 borrowVal = borrowPrincipal[msg.sender];
        uint256 maxAllowed = (newCollateral * collateralFactor) / 10000;
        require(borrowVal <= maxAllowed, "would be undercollateralized");

        collateralBalance[msg.sender] = newCollateral;
        collateralToken.safeTransfer(msg.sender, amount);
        emit WithdrawCollateral(msg.sender, amount);
    }

    function borrow(uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");
        uint256 newBorrow = borrowPrincipal[msg.sender] + amount;
        uint256 maxAllowed = (collateralBalance[msg.sender] * collateralFactor) / 10000;
        require(newBorrow <= maxAllowed, "exceeds limit");
        borrowPrincipal[msg.sender] = newBorrow;
        borrowToken.safeTransfer(msg.sender, amount);
        emit Borrow(msg.sender, amount);
    }

    function repay(uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");
        uint256 owed = borrowPrincipal[msg.sender];
        require(owed > 0, "nothing owed");
        uint256 pay = amount > owed ? owed : amount;
        borrowPrincipal[msg.sender] = owed - pay;
        borrowToken.safeTransferFrom(msg.sender, address(this), pay);
        emit Repay(msg.sender, pay);
    }
}
