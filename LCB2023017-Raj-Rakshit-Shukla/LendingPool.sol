// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LendingPool
 * @notice Minimal collateralized lending pool for educational / testing purposes.
 * - Uses OpenZeppelin primitives (SafeERC20, ReentrancyGuard, Ownable).
 * - Assumes a 1:1 price between asset and collateral tokens (no oracle).
 * - Lenders provide liquidity (asset). Borrowers post collateral (collateralToken)
 *   and receive asset. Repayment returns collateral and pays a fixed fee.
 *
 * WARNING: This contract is simplified. DO NOT use in production without
 * adding price oracles, proper interest accrual, liquidation incentives,
 * and security review.
 */
contract LendingPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset; // token lent/borrowed
    IERC20 public immutable collateralToken; // token used as collateral

    uint256 public totalLiquidity; // available asset liquidity in pool
    uint256 public loanCount;

    // configuration
    uint256 public ltvPercent = 50; // 50% LTV default
    uint256 public constant BPS = 10000;
    uint256 public feeBps = 100; // 1% fixed fee on repayment
    uint256 public liquidationDelay = 7 days; // simple overdue window

    struct Loan {
        address borrower;
        uint256 principal;
        uint256 collateral;
        uint256 startTimestamp;
        bool closed;
    }

    mapping(uint256 => Loan) public loans;

    event LiquidityProvided(address indexed provider, uint256 amount);
    event LiquidityWithdrawn(address indexed receiver, uint256 amount);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 principal, uint256 collateral);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amountPaid, uint256 fee);
    event LoanLiquidated(uint256 indexed loanId, address indexed liquidator);
    event FeeBpsUpdated(uint256 oldFee, uint256 newFee);
    event LtvUpdated(uint256 oldLtv, uint256 newLtv);

    constructor(IERC20 _asset, IERC20 _collateralToken) {
        require(address(_asset) != address(0) && address(_collateralToken) != address(0), "zero address");
        asset = _asset;
        collateralToken = _collateralToken;
    }

    // ------------------ Lender / Admin functions ------------------

    /// @notice Provide asset liquidity to the pool
    function provideLiquidity(uint256 amount) external nonReentrant {
        require(amount > 0, "amount>0");
        asset.safeTransferFrom(msg.sender, address(this), amount);
        totalLiquidity += amount;
        emit LiquidityProvided(msg.sender, amount);
    }

    /// @notice Owner can withdraw available liquidity
    function withdrawLiquidity(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= totalLiquidity, "insufficient liquidity");
        totalLiquidity -= amount;
        asset.safeTransfer(msg.sender, amount);
        emit LiquidityWithdrawn(msg.sender, amount);
    }

    /// @notice Update fee in basis points (owner)
    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 5000, "fee too high"); // arbitrary cap
        emit FeeBpsUpdated(feeBps, _feeBps);
        feeBps = _feeBps;
    }

    /// @notice Update LTV percent (1-100)
    function setLtvPercent(uint256 _ltv) external onlyOwner {
        require(_ltv > 0 && _ltv <= 100, "ltv 1-100");
        emit LtvUpdated(ltvPercent, _ltv);
        ltvPercent = _ltv;
    }

    /// @notice Update liquidation delay
    function setLiquidationDelay(uint256 _delay) external onlyOwner {
        liquidationDelay = _delay;
    }

    // ------------------ Borrower functions ------------------

    /// @notice Request a loan by sending collateral. Returns loan id.
    /// @dev Uses simple 1:1 price assumption: collateral * ltvPercent / 100 >= amount
    function requestLoan(uint256 amount, uint256 collateralAmount) external nonReentrant returns (uint256) {
        require(amount > 0, "amount>0");
        require(amount <= totalLiquidity, "not enough liquidity");
        require(collateralAmount > 0, "collateral>0");

        // Check collateral meets LTV (1:1 price assumed)
        require((collateralAmount * ltvPercent) / 100 >= amount, "insufficient collateral");

        // pull collateral and send asset to borrower
        collateralToken.safeTransferFrom(msg.sender, address(this), collateralAmount);
        asset.safeTransfer(msg.sender, amount);

        totalLiquidity -= amount;

        loanCount += 1;
        loans[loanCount] = Loan({
            borrower: msg.sender,
            principal: amount,
            collateral: collateralAmount,
            startTimestamp: block.timestamp,
            closed: false
        });

        emit LoanCreated(loanCount, msg.sender, amount, collateralAmount);
        return loanCount;
    }

    /// @notice Repay the loan in full (principal + fee). Collateral is returned to borrower.
    function repayLoan(uint256 loanId) external nonReentrant {
        Loan storage ln = loans[loanId];
        require(ln.borrower != address(0), "loan not found");
        require(!ln.closed, "loan closed");
        require(msg.sender == ln.borrower, "only borrower");

        uint256 fee = (ln.principal * feeBps) / BPS;
        uint256 owed = ln.principal + fee;

        // pull owed amount from borrower
        asset.safeTransferFrom(msg.sender, address(this), owed);

        ln.closed = true;

        // return collateral
        collateralToken.safeTransfer(ln.borrower, ln.collateral);

        // add principal+fee back to liquidity
        totalLiquidity += owed;

        emit LoanRepaid(loanId, ln.borrower, owed, fee);
    }

    /// @notice Liquidate an overdue loan after liquidationDelay has passed. Liquidator receives collateral.
    function liquidate(uint256 loanId) external nonReentrant {
        Loan storage ln = loans[loanId];
        require(ln.borrower != address(0), "loan not found");
        require(!ln.closed, "loan closed");
        require(block.timestamp >= ln.startTimestamp + liquidationDelay, "not overdue");

        ln.closed = true;

        // transfer collateral to liquidator
        collateralToken.safeTransfer(msg.sender, ln.collateral);

        emit LoanLiquidated(loanId, msg.sender);
    }

    // ------------------ View helpers ------------------

    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }
}