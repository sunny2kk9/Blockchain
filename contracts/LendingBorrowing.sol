// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
 Simple lending/borrowing example using OpenZeppelin.
 - One collateral token (collToken) and one borrow token (loanToken)
 - Deposits collateral (ERC20), borrow up to LTV (expressed as parts per 10_000)
 - Accrues simple interest per-second (for simplicity)
 - Liquidator can liquidate when health factor falls below 1
*/

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract LendingBorrowing is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable collToken; // collateral token
    IERC20 public immutable loanToken; // token lent out / borrowed
    uint256 public immutable collDecimals; // decimals of collateral token (for scale)
    uint256 public immutable loanDecimals;

    // parameters
    uint256 public ltvBasis; // e.g., 7000 => 70% LTV (basis 10_000)
    uint256 public liquidationBonusBasis; // e.g., 10500 => 5% bonus for liquidator (basis 10_000)
    uint256 public interestRatePerYearBP; // interest rate per year in basis points (e.g., 500 => 5% per year)
    uint256 public constant BASIS = 10000;
    uint256 public constant YEAR_SECONDS = 365 days;

    struct Loan {
        uint256 collateralAmount; // amount of collateral token deposited
        uint256 principal;        // borrowed principal (loanToken)
        uint256 interestIndex;    // last timestamp when interest was accrued
    }

    mapping(address => Loan) public loans;

    // events
    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);
    event Liquidated(address indexed borrower, address indexed liquidator, uint256 repaid, uint256 collateralSeized);

    constructor(
        address _collToken,
        address _loanToken,
        uint256 _collDecimals,
        uint256 _loanDecimals,
        uint256 _ltvBasis,
        uint256 _liquidationBonusBasis,
        uint256 _interestRatePerYearBP
    ) {
        require(_collToken != address(0) && _loanToken != address(0), "zero token");
        collToken = IERC20(_collToken);
        loanToken = IERC20(_loanToken);
        collDecimals = _collDecimals;
        loanDecimals = _loanDecimals;
        ltvBasis = _ltvBasis;
        liquidationBonusBasis = _liquidationBonusBasis;
        interestRatePerYearBP = _interestRatePerYearBP;
    }

    // ---------- admin setters ----------
    function setParams(uint256 _ltvBasis, uint256 _liquidationBonusBasis, uint256 _interestRatePerYearBP) external onlyOwner {
        require(_ltvBasis <= BASIS, "ltv>100%");
        ltvBasis = _ltvBasis;
        liquidationBonusBasis = _liquidationBonusBasis;
        interestRatePerYearBP = _interestRatePerYearBP;
    }

    // ---------- helpers ----------
    // NOTE: For production you'd use price oracles. Here we keep things simple:
    // we assume 1 collToken unit == 1 loanToken unit for demonstration.
    // If you need price conversion, add an oracle and include conversion in valueOfCollateral()
    function valueOfCollateral(uint256 collAmount) public pure returns (uint256) {
        // 1:1 for simplicity
        return collAmount;
    }

    // Accrue interest on borrower's loan (simple interest)
    function _accrueInterest(address user) internal {
        Loan storage ln = loans[user];
        if (ln.principal == 0) {
            ln.interestIndex = block.timestamp;
            return;
        }
        uint256 elapsed = block.timestamp - ln.interestIndex;
        if (elapsed == 0) return;

        // interest = principal * ratePerYearBP * elapsed / YEAR_SECONDS / BASIS
        uint256 interest = (ln.principal * interestRatePerYearBP * elapsed) / YEAR_SECONDS / BASIS;
        ln.principal += interest;
        ln.interestIndex = block.timestamp;
    }

    // get current debt (principal + accrued interest)
    function currentDebt(address user) public view returns (uint256) {
        Loan storage ln = loans[user];
        if (ln.principal == 0) return 0;
        uint256 elapsed = block.timestamp - ln.interestIndex;
        uint256 interest = (ln.principal * interestRatePerYearBP * elapsed) / YEAR_SECONDS / BASIS;
        return ln.principal + interest;
    }

    // health factor: (value of collateral * LTV) / debt. If <1 => eligible for liquidation.
    function healthFactor(address user) public view returns (uint256) {
        Loan storage ln = loans[user];
        if (ln.principal == 0) return type(uint256).max;
        uint256 collValue = valueOfCollateral(ln.collateralAmount);
        uint256 maxBorrow = (collValue * ltvBasis) / BASIS;
        uint256 debt = currentDebt(user);
        if (debt == 0) return type(uint256).max;
        // health in basis (BASIS = 10000), >BASIS => healthy, <BASIS => undercollateralized
        return (maxBorrow * BASIS) / debt;
    }

    // ---------- user actions ----------
    function depositCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");
        loans[msg.sender].collateralAmount += amount;
        loans[msg.sender].interestIndex = block.timestamp; // set index if first time
        collToken.safeTransferFrom(msg.sender, address(this), amount);
        emit CollateralDeposited(msg.sender, amount);
    }

    function withdrawCollateral(uint256 amount) external nonReentrant {
        Loan storage ln = loans[msg.sender];
        require(amount > 0 && ln.collateralAmount >= amount, "invalid amount");
        // accrue interest to check safety
        _accrueInterest(msg.sender);
        // compute allowed collateral to withdraw
        uint256 newColl = ln.collateralAmount - amount;
        uint256 collValue = valueOfCollateral(newColl);
        uint256 maxBorrow = (collValue * ltvBasis) / BASIS;
        uint256 debt = ln.principal;
        require(debt <= maxBorrow, "withdraw would breach LTV");
        ln.collateralAmount = newColl;
        collToken.safeTransfer(msg.sender, amount);
        emit CollateralWithdrawn(msg.sender, amount);
    }

    function borrow(uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");
        _accrueInterest(msg.sender);
        Loan storage ln = loans[msg.sender];
        uint256 collValue = valueOfCollateral(ln.collateralAmount);
        uint256 maxBorrow = (collValue * ltvBasis) / BASIS;
        uint256 debt = ln.principal;
        require(debt + amount <= maxBorrow, "exceeds LTV");
        ln.principal = debt + amount;
        if (ln.interestIndex == 0) ln.interestIndex = block.timestamp;
        loanToken.safeTransfer(msg.sender, amount);
        emit Borrowed(msg.sender, amount);
    }

    function repay(uint256 amount) external nonReentrant {
        require(amount > 0, "zero amount");
        _accrueInterest(msg.sender);
        Loan storage ln = loans[msg.sender];
        require(ln.principal > 0, "no debt");
        uint256 pay = amount;
        if (pay > ln.principal) pay = ln.principal;
        ln.principal -= pay;
        loanToken.safeTransferFrom(msg.sender, address(this), pay);
        emit Repaid(msg.sender, pay);
    }

    // ---------- liquidation ----------
    // Anyone can liquidate an undercollateralized position by repaying part of the debt.
    // Liquidator repays up to debtToCover and receives collateral + bonus.
    function liquidate(address borrower, uint256 debtToCover) external nonReentrant {
        require(debtToCover > 0, "zero");
        // borrower must be undercollateralized
        require(healthFactor(borrower) < BASIS, "healthy");
        _accrueInterest(borrower);
        Loan storage ln = loans[borrower];
        uint256 debt = ln.principal;
        require(debt > 0, "no debt");

        uint256 repayAmount = debtToCover;
        if (repayAmount > debt) repayAmount = debt;

        // collateral seized = repayAmount * BASIS / ltvBasis  (inverse of maxBorrow calc)
        // apply liquidation bonus
        uint256 collateralSeize = (repayAmount * BASIS) / ltvBasis;
        // add bonus: multiply by liquidationBonusBasis/BASIS
        collateralSeize = (collateralSeize * liquidationBonusBasis) / BASIS;

        if (collateralSeize > ln.collateralAmount) {
            collateralSeize = ln.collateralAmount;
        }

        // reduce borrower's principal
        ln.principal = debt - repayAmount;
        ln.collateralAmount = ln.collateralAmount - collateralSeize;

        // liquidator transfers loanToken to protocol (repayment)
        loanToken.safeTransferFrom(msg.sender, address(this), repayAmount);
        // liquidator receives seized collateral
        collToken.safeTransfer(msg.sender, collateralSeize);

        emit Liquidated(borrower, msg.sender, repayAmount, collateralSeize);
    }

    // admin withdraws tokens accidentally sent (non-core balances)
    function adminWithdrawERC20(address token, address to, uint256 amount) external onlyOwner {
        require(to != address(0), "zero to");
        IERC20(token).safeTransfer(to, amount);
    }
}

