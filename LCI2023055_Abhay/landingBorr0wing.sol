// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LendingVault is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;
    uint256 public collateralRatio;

    mapping(address => uint256) public ethLocked;
    mapping(address => uint256) public loanBalance;

    constructor(IERC20 _asset, uint256 _ratio) {
        asset = _asset;
        collateralRatio = _ratio;
    }

    receive() external payable {
        ethLocked[msg.sender] += msg.value;
    }

    function addCollateral() external payable {
        require(msg.value > 0, "Zero amount");
        ethLocked[msg.sender] += msg.value;
    }

    function requestLoan(uint256 _amount) external {
        require(_amount > 0, "Invalid amount");

        uint256 availableValue = (ethLocked[msg.sender] * collateralRatio) / 100;
        require(loanBalance[msg.sender] + _amount <= availableValue, "Exceeds LTV");
        require(asset.balanceOf(address(this)) >= _amount, "Insufficient pool");

        loanBalance[msg.sender] += _amount;
        asset.safeTransfer(msg.sender, _amount);
    }

    function repayLoan(uint256 _amount) external {
        require(_amount > 0, "Invalid repay");
        require(loanBalance[msg.sender] > 0, "No debt");

        uint256 payableAmt = _amount > loanBalance[msg.sender] ? loanBalance[msg.sender] : _amount;
        asset.safeTransferFrom(msg.sender, address(this), payableAmt);
        loanBalance[msg.sender] -= payableAmt;
    }

    function withdrawCollateral(uint256 _amt) external {
        require(_amt > 0, "Invalid withdraw");
        require(ethLocked[msg.sender] >= _amt, "Insufficient collateral");
        require(loanBalance[msg.sender] == 0, "Active loan exists");

        ethLocked[msg.sender] -= _amt;
        (bool success, ) = payable(msg.sender).call{value: _amt}("");
        require(success, "ETH transfer failed");
    }

    function updateCollateralRatio(uint256 _newRatio) external onlyOwner {
        collateralRatio = _newRatio;
    }

    function vaultTokenReserve() external view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    function borrowableAmount(address user) external view returns (uint256) {
        uint256 maxPossible = (ethLocked[user] * collateralRatio) / 100;
        if (maxPossible <= loanBalance[user]) return 0;
        return maxPossible - loanBalance[user];
    }

    function adminWithdrawTokens(uint256 _amt, address _dest) external onlyOwner {
        asset.safeTransfer(_dest, _amt);
    }

    function adminWithdrawETH(uint256 _amt, address payable _dest) external onlyOwner {
        (bool sent, ) = _dest.call{value: _amt}("");
        require(sent, "ETH transfer failed");
    }
}
