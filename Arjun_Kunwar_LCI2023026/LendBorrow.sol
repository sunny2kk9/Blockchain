// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LendingPool
 * @notice Simple collateral-based lending pool meant for testing and learning.
 *
 * Users can:
 * - Deposit liquidity (in the asset token) to the pool.
 * - Borrow asset tokens by locking collateral tokens.
 * - Repay loans to reclaim collateral.
 * - Loans can be liquidated if not repaid within the allowed timeframe.
 *
 * This contract assumes the collateral token and the asset token are worth the same (no pricing oracle).
 * It applies a fixed repayment fee and allows only full repayment.
 *
 * IMPORTANT:
 * This contract is a simplified educational example. Do NOT use in production without:
 * - Proper price oracles
 * - Dynamic interest rates
 * - Liquidation incentives
 * - Security audits
 */
contract LendingPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;              // Token that is borrowed and lent
    IERC20 public immutable collateralToken;    // Token used as loan collateral

    uint256 public totalLiquidity;              // Amount of asset currently available in pool
    uint256 public loanCount;                   // Total created loans

    // Pool parameters
    uint256 public ltvPercent = 50;             // Loan-to-value percent (e.g. 50 means borrow up to 50% of collateral value)
    uint256 public constant BPS = 10000;        // Basis points constant used for fee math
    uint256 public feeBps = 100;                // 1% repayment fee (100 / 10000)
    uint256 public liquidationDelay = 7 days;   // Time allowed before loan can be liquidated

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

    // ------------------ Liquidity Provider & Admin ------------------

    /// @notice Deposit asset token into the pool
    function provideLiquidity(uint256 amount) external nonReentrant {
        require(amount > 0, "amount>0");
        asset.safeTransferFrom(msg.sender, address(this), amount);
        totalLiquidity += amount;
        emit LiquidityProvided(msg.sender, amount);
    }

    /// @notice Pool owner can withdraw unused liquidity
    function withdrawLiquidity(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= totalLiquidity, "insufficient liquidity");
        totalLiquidity -= amount;
        asset.safeTransfer(msg.sender, amount);
        emit LiquidityWithdrawn(msg.sender, amount);
    }

    /// @notice Update repayment fee (max 50%)
    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 5000, "fee too high");
        emit FeeBpsUpdated(feeBps, _feeBps);
        feeBps = _feeBps;
    }

    /// @notice Update loan-to-value ratio
    function setLtvPercent(uint256 _ltv) external onlyOwner {
        require(_ltv > 0 && _ltv <= 100, "ltv 1-100");
        emit LtvUpdated(ltvPercent, _ltv);
        ltvPercent = _ltv;
    }

    /// @notice Update allowed repayment window before liquidation
    function setLiquidationDelay(uint256 _delay) external onlyOwner {
        liquidationDelay = _delay;
    }

    // ------------------ Borrowing Functions ------------------

    /**
     * @notice Create a new loan by depositing collateral and borrowing asset.
     * @dev Collateral required: collateral * LTV% ≥ borrowed amount (assumes 1:1 value).
     */
    function requestLoan(uint256 amount, uint256 collateralAmount) external nonReentrant returns (uint256) {
        require(amount > 0, "amount>0");
        require(amount <= totalLiquidity, "not enough liquidity");
        require(collateralAmount > 0, "collateral>0");
        require((collateralAmount * ltvPercent) / 100 >= amount, "insufficient collateral");

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

    /// @notice Repay full loan (principal + fee) and unlock collateral
    function repayLoan(uint256 loanId) external nonReentrant {
        Loan storage ln = loans[loanId];
        require(ln.borrower != address(0), "loan not found");
        require(!ln.closed, "loan closed");
        require(msg.sender == ln.borrower, "only borrower");

        uint256 fee = (ln.principal * feeBps) / BPS;
        uint256 totalOwed = ln.principal + fee;

        asset.safeTransferFrom(msg.sender, address(this), totalOwed);
        ln.closed = true;

        collateralToken.safeTransfer(ln.borrower, ln.collateral);
        totalLiquidity += totalOwed;

        emit LoanRepaid(loanId, ln.borrower, totalOwed, fee);
    }

    /// @notice Liquidate overdue loan and receive its collateral
    function liquidate(uint256 loanId) external nonReentrant {
        Loan storage ln = loans[loanId];
        require(ln.borrower != address(0), "loan not found");
        require(!ln.closed, "loan closed");
        require(block.timestamp >= ln.startTimestamp + liquidationDelay, "not overdue");

        ln.closed = true;
        collateralToken.safeTransfer(msg.sender, ln.collateral);

        emit LoanLiquidated(loanId, msg.sender);
    }

    // ------------------ View ------------------

    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }
}
