// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
contract SimpleLending is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    uint256 public ltv;

    mapping(address => uint256) public collateralETH;
    mapping(address => uint256) public debt;

    constructor(IERC20 _token, uint256 _ltv) {
        token = _token;
        ltv = _ltv;
    }

    receive() external payable {
        collateralETH[msg.sender] += msg.value;
    }

    function depositCollateral() external payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        collateralETH[msg.sender] += msg.value;
    }

    function withdrawCollateral(uint256 amount) external {
        require(amount > 0, "Invalid withdraw amount");
        require(collateralETH[msg.sender] >= amount, "Insufficient collateral");
        require(debt[msg.sender] == 0, "Outstanding debt exists");
        collateralETH[msg.sender] -= amount;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "ETH transfer failed");
    }

    function borrow(uint256 amount) external {
        require(amount > 0, "Invalid borrow amount");
        uint256 collateralValue = collateralETH[msg.sender];
        uint256 maxBorrow = (collateralValue * ltv) / 100;
        require(debt[msg.sender] + amount <= maxBorrow, "Exceeds LTV limit");
        require(token.balanceOf(address(this)) >= amount, "Insufficient liquidity");
        debt[msg.sender] += amount;
        token.safeTransfer(msg.sender, amount);
    }

    function repay(uint256 amount) external {
        require(amount > 0, "Invalid repay amount");
        require(debt[msg.sender] > 0, "No active debt");
        uint256 repayAmount = amount > debt[msg.sender] ? debt[msg.sender] : amount;
        token.safeTransferFrom(msg.sender, address(this), repayAmount);
        debt[msg.sender] -= repayAmount;
    }

    function setLTV(uint256 _ltv) external onlyOwner {
        ltv = _ltv;
    }

    function emergencyWithdrawTokens(uint256 amount, address to) external onlyOwner {
        token.safeTransfer(to, amount);
    }

    function emergencyWithdrawETH(uint256 amount, address payable to) external onlyOwner {
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "ETH withdraw failed");
    }

    function contractTokenBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function availableToBorrow(address user) external view returns (uint256) {
        uint256 maxBorrow = (collateralETH[user] * ltv) / 100;
        return maxBorrow > debt[user] ? maxBorrow - debt[user] : 0;
    }
}
