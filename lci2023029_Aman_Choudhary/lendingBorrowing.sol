// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BasicLendVault is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable borrowToken;
    uint256 public borrowRate; // LTV ratio in percentage

    mapping(address => uint256) private ethCollateral;
    mapping(address => uint256) private userDebt;

    constructor(IERC20 _borrowToken, uint256 _borrowRate) {
        borrowToken = _borrowToken;
        borrowRate = _borrowRate;
    }

    receive() external payable {
        _addCollateral(msg.sender, msg.value);
    }

    function deposit() external payable {
        require(msg.value > 0, "No ETH sent");
        _addCollateral(msg.sender, msg.value);
    }

    function borrowFunds(uint256 amount) external {
        require(amount > 0, "Invalid amount");

        uint256 userCollateral = ethCollateral[msg.sender];
        uint256 maxLoan = (userCollateral * borrowRate) / 100;

        require(userDebt[msg.sender] + amount <= maxLoan, "Exceeds LTV limit");
        require(borrowToken.balanceOf(address(this)) >= amount, "Insufficient pool balance");

        userDebt[msg.sender] += amount;
        borrowToken.safeTransfer(msg.sender, amount);
    }

    function repayLoan(uint256 amount) external {
        require(amount > 0 && userDebt[msg.sender] > 0, "Nothing to repay");

        uint256 actualPayment = amount > userDebt[msg.sender] ? userDebt[msg.sender] : amount;
        borrowToken.safeTransferFrom(msg.sender, address(this), actualPayment);
        userDebt[msg.sender] -= actualPayment;
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(ethCollateral[msg.sender] >= amount, "Not enough collateral");
        require(userDebt[msg.sender] == 0, "Outstanding debt exists");

        ethCollateral[msg.sender] -= amount;
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "ETH transfer failed");
    }

    function changeLTV(uint256 _newRate) external onlyOwner {
        borrowRate = _newRate;
    }

    function getVaultBalance() external view returns (uint256) {
        return borrowToken.balanceOf(address(this));
    }

    function remainingCredit(address user) external view returns (uint256) {
        uint256 maxLoan = (ethCollateral[user] * borrowRate) / 100;
        if (userDebt[user] >= maxLoan) return 0;
        return maxLoan - userDebt[user];
    }

    function emergencyTokenWithdraw(address to, uint256 amount) external onlyOwner {
        borrowToken.safeTransfer(to, amount);
    }

    function emergencyETHWithdraw(address payable to, uint256 amount) external onlyOwner {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "ETH transfer failed");
    }

    function _addCollateral(address user, uint256 amount) internal {
        ethCollateral[user] += amount;
    }
}
