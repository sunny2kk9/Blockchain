// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BasicLending is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public collateralToken;
    IERC20 public borrowToken;

    mapping(address => uint256) public collateralBalance;
    mapping(address => uint256) public borrowBalance;

    constructor(address _collateral, address _borrow) {
        collateralToken = IERC20(_collateral);
        borrowToken = IERC20(_borrow);
    }

    function depositCollateral(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        collateralToken.safeTransferFrom(msg.sender, address(this), amount);
        collateralBalance[msg.sender] += amount;
    }

    function borrow(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(collateralBalance[msg.sender] >= amount, "Not enough collateral");
        borrowBalance[msg.sender] += amount;
        borrowToken.safeTransfer(msg.sender, amount);
    }

    function repay(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(borrowBalance[msg.sender] >= amount, "Too much repay");
        borrowToken.safeTransferFrom(msg.sender, address(this), amount);
        borrowBalance[msg.sender] -= amount;
    }

    function withdrawCollateral(uint256 amount) external {
        require(collateralBalance[msg.sender] >= amount, "Not enough balance");
        require(borrowBalance[msg.sender] == 0, "Clear debt first");
        collateralBalance[msg.sender] -= amount;
        collateralToken.safeTransfer(msg.sender, amount);
    }

    function fundPool(uint256 amount) external onlyOwner {
        borrowToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    function withdrawPool(uint256 amount) external onlyOwner {
        borrowToken.safeTransfer(msg.sender, amount);
    }
}
