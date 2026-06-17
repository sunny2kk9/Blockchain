// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
  SimpleLendingMarket.sol

  - Uses OpenZeppelin: IERC20, SafeERC20, ReentrancyGuard, Ownable
  - One lend token (asset) and one collateral token for simplicity.
  - Lenders deposit lendToken and can withdraw principal + interest.
  - Borrowers deposit collateralToken and borrow lendToken up to LTV.
  - Borrow interest accrues using a borrowIndex approach.
  - Liquidator can liquidate unhealthy loans (if collateral value < required).
    NOTE: This example uses a fixed collateral price provided by owner (for demo).
*/

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleLendingMarket is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable lendToken;       // Asset token (what's lent/borrowed)
    IERC20 public immutable collateralToken; // Collateral token

    // Scaling factor for fixed-point (1e18)
    uint256 public constant WAD = 1e18;

    // Interest parameters (per-second interest, scaled by WAD)
    // borrowInterestPerSecond is e.g., 1e18 * 0.000000380517... for ~1% APR
    uint256 public borrowInterestPerSecond;

    // Global borrow index: grows as interest accrues. Scaled by WAD.
    uint256 public borrowIndex;
    uint256 public lastAccrualTimestamp;

    // Total borrows (principal + accrued interest)
    uint256 public totalBorrows;

    // Lenders' balances (principal provider share)
    mapping(address => uint256) public lenderPrincipal; // how much lender deposited (principal)
    uint256 public totalSupplyPrincipal; // sum of lenderPrincipal

    // Borrowers: principal borrowed and borrowIndexSnapshot to compute accrued
    struct BorrowSnapshot {
        uint256 principal;       // principal borrowed (scaled to token decimals)
        uint256 borrowIndex;     // borrow index at time of borrow/repay
    }
    mapping(address => BorrowSnapshot) public borrows;

    // Collateral tracking (how much collateral deposited by borrower)
    mapping(address => uint256) public collateralBalance;

    // Collateralization parameters
    // maxLTV: e.g., 0.75 * WAD => borrow up to 75% of collateralValue
    // liquidationBonus: e.g., 1.05 * WAD => liquidator repays amount and seizes 105% value in collateral
    uint256 public maxLTV;
    uint256 public liquidationBonus;

    // Simplified price oracle: owner-set price of collateral in lendToken units, scaled by WAD
    // collateralPrice: number of lendToken units per 1 collateralToken, scaled by WAD.
    uint256 public collateralPrice;

    // Events
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);
    event DepositCollateral(address indexed user, uint256 amount);
    event WithdrawCollateral(address indexed user, uint256 amount);
    event Liquidate(address indexed liquidator, address indexed borrower, uint256 repayAmount, uint256 seizeCollateral);

    constructor(
        address _lendToken,
        address _collateralToken,
        uint256 _borrowInterestPerSecond, // scaled by WAD
        uint256 _initialBorrowIndex,      // typically WAD
        uint256 _maxLTV,                  // scaled by WAD
        uint256 _liquidationBonus,        // scaled by WAD (> WAD)
        uint256 _collateralPrice          // scaled by WAD (lendToken per collateralToken)
    ) {
        require(_lendToken != address(0) && _collateralToken != address(0), "zero address");
        require(_maxLTV <= WAD, "LTV > 100%");
        require(_liquidationBonus >= WAD, "liquidation bonus must be >= 1");
        lendToken = IERC20(_lendToken);
        collateralToken = IERC20(_collateralToken);
        borrowInterestPerSecond = _borrowInterestPerSecond;
        borrowIndex = _initialBorrowIndex;
        lastAccrualTimestamp = block.timestamp;
        maxLTV = _maxLTV;
        liquidationBonus = _liquidationBonus;
        collateralPrice = _collateralPrice;
    }

    /* ========== Interest accrual ========== */

    /// @notice Accrue interest globally on borrows using per-second interest and borrowIndex
    function accrueInterest() public {
        uint256 timestamp = block.timestamp;
        if (timestamp == lastAccrualTimestamp) {
            return;
        }
        uint256 dt = timestamp - lastAccrualTimestamp; // seconds elapsed
        // interestFactor = (1 + r) ^ dt approximately using simple linear r*dt when small
        // We'll use simple linear: interestFactor = 1 + borrowInterestPerSecond * dt
        // newBorrowIndex = borrowIndex * interestFactor
        uint256 interestFactor = WAD + (borrowInterestPerSecond * dt) / WAD; // scaled by WAD
        // compute new borrowIndex = borrowIndex * interestFactor / WAD
        uint256 newBorrowIndex = (borrowIndex * interestFactor) / WAD;
        // update totalBorrows based on interestFactor (totalBorrows * interestFactor)
        totalBorrows = (totalBorrows * interestFactor) / WAD;
        borrowIndex = newBorrowIndex;
        lastAccrualTimestamp = timestamp;
    }

    /* ========== Lender functions ========== */

    /// @notice Lender deposits lendToken to supply the market
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");
        accrueInterest();

        // Transfer tokens in
        lendToken.safeTransferFrom(msg.sender, address(this), amount);

        // Increase lender principal
        lenderPrincipal[msg.sender] += amount;
        totalSupplyPrincipal += amount;

        emit Deposit(msg.sender, amount);
    }

    /// @notice Lender withdraws up to their principal + share of interest.
    /// For simplicity, we distribute interest pro rata to lender principal when they withdraw:
    /// share = lenderPrincipal / totalSupplyPrincipal; withdrawable = share * (contractBalance)
    /// This is simplified and may not be ideal for real markets.
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");
        accrueInterest();

        // Compute available to lender: their proportional share of pool lendToken balance
        uint256 poolBalance = lendToken.balanceOf(address(this));
        // available = lenderPrincipal + proportional interest => (lenderPrincipal / totalSupplyPrincipal) * poolBalance
        uint256 available = 0;
        if (totalSupplyPrincipal > 0) {
            available = (lenderPrincipal[msg.sender] * poolBalance) / totalSupplyPrincipal;
        }
        require(amount <= available, "insufficient available");

        // Deduct principal proportionally
        // We will reduce lenderPrincipal by min(amount, lenderPrincipal)
        uint256 principalReduction = amount;
        if (principalReduction > lenderPrincipal[msg.sender]) {
            // If the withdrawal is larger than principal, take full principal (interest is implicit)
            principalReduction = lenderPrincipal[msg.sender];
        }
        lenderPrincipal[msg.sender] -= principalReduction;
        totalSupplyPrincipal -= principalReduction;

        // Transfer out
        lendToken.safeTransfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount);
    }

    /* ========== Collateral functions ========== */

    function depositCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");
        collateralToken.safeTransferFrom(msg.sender, address(this), amount);
        collateralBalance[msg.sender] += amount;
        emit DepositCollateral(msg.sender, amount);
    }

    function withdrawCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");
        accrueInterest();
        require(collateralBalance[msg.sender] >= amount, "insufficient collateral");

        // Temporarily reduce collateral and check health
        collateralBalance[msg.sender] -= amount;
        require(_isHealthy(msg.sender), "withdraw would make loan undercollateralized");

        collateralToken.safeTransfer(msg.sender, amount);
        emit WithdrawCollateral(msg.sender, amount);
    }

    /* ========== Borrow / Repay ========== */

    /// @notice Borrow lendToken against collateral
    function borrow(uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");
        accrueInterest();

        // compute available borrow limit based on collateral
        uint256 collateralVal = _collateralValue(msg.sender); // in lendToken units scaled by WAD
        uint256 maxBorrow = (collateralVal * maxLTV) / WAD; // in lendToken scaled by WAD

        // Get current borrow amount (principal + accrued interest)
        uint256 currentBorrow = _borrowBalanceCurrent(msg.sender);
        uint256 newBorrow = currentBorrow + amount;
        require(newBorrow <= maxBorrow, "exceeds borrow limit");

        // Update borrow snapshot: convert to "principal" measure w.r.t current borrowIndex
        // We want to store principal so that principal * (borrowIndex/currentSnapshotIndex) = current borrow.
        // After accrueInterest(), borrowIndex is current.
        BorrowSnapshot storage snap = borrows[msg.sender];
        // Convert newBorrow to stored principal relative to current borrowIndex:
        // storedPrincipal = newBorrow * WAD / borrowIndex
        snap.principal = (newBorrow * WAD) / borrowIndex;
        snap.borrowIndex = borrowIndex;

        // Increase totalBorrows by amount (already accrual done)
        totalBorrows += amount;

        // Transfer lendToken to borrower
        lendToken.safeTransfer(msg.sender, amount);
        emit Borrow(msg.sender, amount);
    }

    /// @notice Repay borrow (partial or full). Borrower pays lendToken back.
    function repay(uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");
        accrueInterest();

        uint256 borrowerBalance = _borrowBalanceCurrent(msg.sender);
        require(borrowerBalance > 0, "no borrow");

        uint256 repayAmount = amount;
        if (repayAmount > borrowerBalance) {
            repayAmount = borrowerBalance;
        }

        // Transfer lendToken from payer to contract
        lendToken.safeTransferFrom(msg.sender, address(this), repayAmount);

        // Update borrow snapshot
        uint256 newBorrow = borrowerBalance - repayAmount;
        BorrowSnapshot storage snap = borrows[msg.sender];
        if (newBorrow == 0) {
            snap.principal = 0;
            snap.borrowIndex = 0;
        } else {
            snap.principal = (newBorrow * WAD) / borrowIndex;
            snap.borrowIndex = borrowIndex;
        }

        // Reduce totalBorrows
        if (totalBorrows >= repayAmount) {
            totalBorrows -= repayAmount;
        } else {
            totalBorrows = 0;
        }

        emit Repay(msg.sender, repayAmount);
    }

    /* ========== Liquidation ========== */

    /// @notice Liquidate an unhealthy borrower. Liquidator repays up to repayAmount of borrowToken on behalf of borrower,
    /// and receives collateral equal to repayValue * liquidationBonus (seized collateral).
    function liquidate(address borrower, uint256 repayAmount) external nonReentrant {
        require(repayAmount > 0, "zero repay");
        accrueInterest();
        require(!_isHealthy(borrower), "borrower healthy");

        uint256 borrowerDebt = _borrowBalanceCurrent(borrower);
        if (repayAmount > borrowerDebt) {
            repayAmount = borrowerDebt;
        }

        // compute collateral to seize: repayAmount (lendToken) -> collateral tokens using collateralPrice
        // collateralValue to seize = repayAmount * liquidationBonus (in lendToken units)
        uint256 seizeLendValue = (repayAmount * liquidationBonus) / WAD; // in lendToken scaled by WAD

        // collateralTokensToSeize = seizeLendValue / collateralPrice
        require(collateralPrice > 0, "price not set");
        uint256 collateralToSeize = (seizeLendValue * WAD) / collateralPrice; // scaled by token decimals similar to collateral token

        require(collateralBalance[borrower] >= collateralToSeize, "not enough collateral");

        // Transfer repayAmount from liquidator to contract
        lendToken.safeTransferFrom(msg.sender, address(this), repayAmount);

        // Reduce borrower's debt
        uint256 newBorrow = borrowerDebt - repayAmount;
        BorrowSnapshot storage snap = borrows[borrower];
        if (newBorrow == 0) {
            snap.principal = 0;
            snap.borrowIndex = 0;
        } else {
            snap.principal = (newBorrow * WAD) / borrowIndex;
            snap.borrowIndex = borrowIndex;
        }

        if (totalBorrows >= repayAmount) {
            totalBorrows -= repayAmount;
        } else {
            totalBorrows = 0;
        }

        // Transfer seized collateral to liquidator
        collateralBalance[borrower] -= collateralToSeize;
        collateralToken.safeTransfer(msg.sender, collateralToSeize);

        emit Liquidate(msg.sender, borrower, repayAmount, collateralToSeize);
    }

    /* ========== View helpers ========== */

    /// @notice Current borrow balance (principal + accrued interest) for an account
    function _borrowBalanceCurrent(address account) internal view returns (uint256) {
        BorrowSnapshot storage snap = borrows[account];
        if (snap.principal == 0) return 0;
        // currentBorrow = storedPrincipal * borrowIndex / snap.borrowIndex
        if (snap.borrowIndex == 0) return 0;
        return (snap.principal * borrowIndex) / snap.borrowIndex;
    }

    /// @notice Collateral value in lendToken units (scaled by WAD) for account
    function _collateralValue(address account) internal view returns (uint256) {
        uint256 c = collateralBalance[account]; // collateral token amount (raw token units)
        // value = c * collateralPrice; collateralPrice is lendToken per 1 collateralToken scaled by WAD
        return (c * collateralPrice) / WAD;
    }

    /// @notice Health check: collateralValue * maxLTV >= borrowBalance
    function _isHealthy(address account) internal view returns (bool) {
        uint256 collateralVal = _collateralValue(account);
        uint256 maxBorrow = (collateralVal * maxLTV) / WAD;
        uint256 currentBorrow = _borrowBalanceCurrent(account);
        return currentBorrow <= maxBorrow;
    }

    /* ========== Admin functions (owner) ========== */

    function setBorrowInterestPerSecond(uint256 _r) external onlyOwner {
        accrueInterest();
        borrowInterestPerSecond = _r;
    }

    function setMaxLTV(uint256 _maxLTV) external onlyOwner {
        require(_maxLTV <= WAD, "LTV > 100%");
        maxLTV = _maxLTV;
    }

    function setLiquidationBonus(uint256 _bonus) external onlyOwner {
        require(_bonus >= WAD, "bonus < 1");
        liquidationBonus = _bonus;
    }

    function setCollateralPrice(uint256 _price) external onlyOwner {
        // _price: lendToken units per collateralToken scaled by WAD
        collateralPrice = _price;
    }

    /* ========== Emergency / view ========== */

    /// @notice Owner can withdraw wrongly sent ERC20 tokens (not lendToken nor collateralToken)
    function rescueERC20(address token, address to, uint256 amount) external onlyOwner {
        require(token != address(lendToken) && token != address(collateralToken), "cannot rescue market tokens");
        IERC20(token).safeTransfer(to, amount);
    }

    /// @notice Returns the current borrow balance for an account (accrueInterest must be called off-chain for realtime)
    function borrowBalanceCurrent(address account) external returns (uint256) {
        accrueInterest();
        return _borrowBalanceCurrent(account);
    }

    /// @notice View-only read
    function borrowBalanceView(address account) external view returns (uint256) {
        if (borrows[account].principal == 0) return 0;
        // If view, simulate no accrual since lastAccrualTimestamp; we use current borrowIndex as stored.
        return (borrows[account].principal * borrowIndex) / borrows[account].borrowIndex;
    }
}
