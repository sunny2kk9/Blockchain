// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

//OPenZepplin Libraries
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleLending is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public collateralToken;
    IERC20 public loanToken;

    uint256 public collateralFactor = 150;

    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;

    constructor(address _collateral, address _loan) {
        collateralToken = IERC20(_collateral);
        loanToken = IERC20(_loan);
    }

    function depositCollateral(uint256 amount) external {
        collateralToken.safeTransferFrom(msg.sender, address(this), amount);
        collateral[msg.sender] += amount;
    }

    function borrow(uint256 amount) external {
        uint256 maxBorrow = collateral[msg.sender] * 100 / collateralFactor;
        require(amount <= maxBorrow, "Not enough collateral");
        debt[msg.sender] += amount;
        loanToken.safeTransfer(msg.sender, amount);
    }

    function repay(uint256 amount) external {
        require(debt[msg.sender] >= amount, "Too much");
        loanToken.safeTransferFrom(msg.sender, address(this), amount);
        debt[msg.sender] -= amount;
    }

    function withdrawCollateral(uint256 amount) external {
        require(debt[msg.sender] == 0, "Repay first");
        require(collateral[msg.sender] >= amount, "Not enough");
        collateral[msg.sender] -= amount;
        collateralToken.safeTransfer(msg.sender, amount);
    }
}
