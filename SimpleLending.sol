// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleLending is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable depositToken; // asset users deposit / lenders provide
    IERC20 public immutable collateralToken; // asset used as collateral

    mapping(address => uint256) public deposits; // lender balances
    mapping(address => uint256) public collateral; // borrower collateral
    mapping(address => uint256) public borrows; // borrowed amount per borrower

    uint256 public totalDeposits;

    // Loan-to-value ratio in %. e.g., 50 means borrowers can borrow up to 50% of collateral value (assumes 1:1 token price for simplicity)
    uint256 public loanToValuePct = 50;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event CollateralAdded(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repayed(address indexed user, uint256 amount);

    constructor(IERC20 _depositToken, IERC20 _collateralToken) Ownable(msg.sender){
        depositToken = _depositToken;
        collateralToken = _collateralToken;
    }

    // LENDER: deposit tokens into pool
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "zero deposit");
        deposits[msg.sender] += amount;
        totalDeposits += amount;
        depositToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount);
    }

    // LENDER: withdraw up to their deposit (simple, no liquidity limits)
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "zero withdraw");
        require(deposits[msg.sender] >= amount, "insufficient balance");
        deposits[msg.sender] -= amount;
        totalDeposits -= amount;
        depositToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    // BORROWER: add collateral
    function addCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "zero collateral");
        collateral[msg.sender] += amount;
        collateralToken.safeTransferFrom(msg.sender, address(this), amount);
        emit CollateralAdded(msg.sender, amount);
    }

    // BORROWER: borrow against their collateral (very simplified LTV check)
    function borrow(uint256 amount) external nonReentrant {
        require(amount > 0, "zero borrow");
        // allowed = collateral * LTV / 100
        uint256 allowed = (collateral[msg.sender] * loanToValuePct) / 100;
        require(borrows[msg.sender] + amount <= allowed, "exceeds LTV");
        require(totalDeposits >= amount, "insufficient pool liquidity");
        borrows[msg.sender] += amount;
        totalDeposits -= amount;
        depositToken.safeTransfer(msg.sender, amount);
        emit Borrowed(msg.sender, amount);
    }

    // BORROWER: repay borrowed amount
    function repay(uint256 amount) external nonReentrant {
        require(amount > 0, "zero repay");
        require(borrows[msg.sender] >= amount, "repay too much");
        borrows[msg.sender] -= amount;
        totalDeposits += amount;
        depositToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Repayed(msg.sender, amount);
    }

    // OWNER helper: change LTV (for testing/maintenance)
    function setLTV(uint256 _ltv) external onlyOwner {
        require(_ltv <= 90, "LTV too high");
        loanToValuePct = _ltv;
    }
}
