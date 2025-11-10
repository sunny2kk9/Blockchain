// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OZLending is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct User {
        uint256 depositBalance;
        uint256 borrowBalance;
    }

    IERC20 public immutable asset;
    mapping(address => User) public users;

    uint256 public totalDeposits;
    uint256 public totalBorrows;
    uint256 public constant interestRate = 5;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);

    constructor(IERC20 _asset) {
        asset = _asset;
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount > 0");
        users[msg.sender].depositBalance += amount;
        totalDeposits += amount;
        asset.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(users[msg.sender].depositBalance >= amount, "Insufficient balance");
        users[msg.sender].depositBalance -= amount;
        totalDeposits -= amount;
        asset.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function borrow(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount > 0");
        uint256 collateralLimit = users[msg.sender].depositBalance / 2;
        require(amount <= collateralLimit, "Exceeds collateral limit");
        require(asset.balanceOf(address(this)) >= amount, "Not enough liquidity");
        users[msg.sender].borrowBalance += amount;
        totalBorrows += amount;
        asset.safeTransfer(msg.sender, amount);
        emit Borrowed(msg.sender, amount);
    }

    function repay(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount > 0");
        require(users[msg.sender].borrowBalance > 0, "No debt");
        uint256 repayAmount = amount;
        if (repayAmount > users[msg.sender].borrowBalance) {
            repayAmount = users[msg.sender].borrowBalance;
        }
        users[msg.sender].borrowBalance -= repayAmount;
        totalBorrows -= repayAmount;
        asset.safeTransferFrom(msg.sender, address(this), repayAmount);
        emit Repaid(msg.sender, repayAmount);
    }

    function calculateInterest(address user) public view returns (uint256) {
        return (users[user].depositBalance * interestRate) / 100;
    }

    function getAccountDetails(address user)
        external
        view
        returns (uint256 depositBalance, uint256 borrowBalance, uint256 interestEarned)
    {
        uint256 interest = calculateInterest(user);
        return (users[user].depositBalance, users[user].borrowBalance, interest);
    }

    function withdrawReserves(address to, uint256 amount) external onlyOwner nonReentrant {
        require(asset.balanceOf(address(this)) >= amount, "Insufficient balance");
        asset.safeTransfer(to, amount);
    }
}
