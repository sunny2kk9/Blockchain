// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// OpenZeppelin Imports
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

// Chainlink Price Feed Interface
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title SimpleLending
 * @author Gemini
 * @notice A simplified lending and borrowing contract.
 * Lenders can deposit 'loanToken', and borrowers can post 'collateralToken'
 * to borrow 'loanToken'.
 *
 * THIS IS AN EDUCATIONAL EXAMPLE AND IS NOT AUDITED OR PRODUCTION-READY.
 */
 interface IERC20Metadata is IERC20 {
    function decimals() external view returns (uint8);
}
contract SimpleLending is ReentrancyGuard, Ownable, Pausable {
  using SafeERC20 for IERC20Metadata;

    // --- State Variables ---

    // Tokens
// Tokens
    IERC20Metadata public immutable loanToken;       // The token to be lent (e.g., DAI)
    IERC20Metadata public immutable collateralToken; // The token used as collateral (e.g., WETH)

    // Oracle
    AggregatorV3Interface public priceFeed; // Chainlink price feed (e.g., WETH/DAI)

    // Lender data
    mapping(address => uint256) public lenderDeposits;
    uint256 public totalDeposited;

    // Borrower data
    struct BorrowRecord {
        uint256 collateralAmount; // Amount of collateral locked
        uint256 borrowedAmount;   // Principal amount of loanToken borrowed
        uint256 borrowTimestamp;  // Timestamp of last borrow or repay action
    }
    mapping(address => BorrowRecord) public borrows;

    // Contract parameters (set by Owner)
    uint256 public interestRatePerYear;  // Annual Percentage Rate (APR), e.g., 500 for 5%
    uint256 public collateralizationRatio; // e.g., 150 for 150% (need $150 collateral for $100 loan)
    uint256 public liquidationThreshold; // e.g., 120 for 120% (position is liquidatable if collateral value drops to 120% of debt)
    
    // Constants
    uint256 private constant BASIS_POINTS = 10000; // For percentage calculations
    uint256 private constant SECONDS_IN_YEAR = 31536000;

    // --- Events ---
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 collateral, uint256 loanAmount);
    event Repaid(address indexed user, uint256 principal, uint256 interest);
    event Liquidated(address indexed liquidator, address indexed user, uint256 collateralSeized, uint256 debtRepaid);

    // --- Constructor ---
constructor(
        address _loanToken,
        address _collateralToken,
        address _priceFeed
    ) Ownable(msg.sender) {
        loanToken = IERC20Metadata(_loanToken);
        collateralToken = IERC20Metadata(_collateralToken);
        priceFeed = AggregatorV3Interface(_priceFeed);

        // Set default parameters
        interestRatePerYear = 500;  // 5% APR
        collateralizationRatio = 150; // 150%
        liquidationThreshold = 120; // 120%
    }

    // --- Helper Functions ---

    /**
     * @notice Gets the value of a specific amount of collateral in terms of the loan token.
     * @dev Handles all decimal conversions between tokens and price feed.
     */
    function getCollateralValue(uint256 _collateralAmount) public view returns (uint256) {
        if (_collateralAmount == 0) return 0;

        (, int price, , , ) = priceFeed.latestRoundData();
        uint256 feedDecimals = priceFeed.decimals();
        uint256 collateralDecimals = collateralToken.decimals();
        uint256 loanDecimals = loanToken.decimals();

        // Value = (Amount * Price * 10^loanDecimals) / (10^collateralDecimals * 10^feedDecimals)
        return (_collateralAmount * uint256(price) * (10**loanDecimals)) / (10**collateralDecimals * 10**feedDecimals);
    }

    /**
     * @notice Calculates the maximum amount of loanToken a user can borrow for a given collateral amount.
     */
    function getMaxBorrowable(uint256 _collateralAmount) public view returns (uint256) {
        uint256 collateralValue = getCollateralValue(_collateralAmount);
        // Max Borrow = (Collateral Value * 100) / Ratio
        return (collateralValue * 100) / collateralizationRatio;
    }

    /**
     * @notice Calculates the current total debt (principal + interest) for a user.
     * @dev Uses simple interest: Interest = P * R * T
     */
    function getDebtAmount(address user) public view returns (uint256) {
        BorrowRecord storage userBorrow = borrows[user];
        if (userBorrow.borrowedAmount == 0) return 0;

        uint256 timeElapsed = block.timestamp - userBorrow.borrowTimestamp;
        
        // Interest = (Principal * Rate * Time) / (BasisPoints * SecondsInYear)
        uint256 interest = (userBorrow.borrowedAmount * interestRatePerYear * timeElapsed) / (BASIS_POINTS * SECONDS_IN_YEAR);
        
        return userBorrow.borrowedAmount + interest;
    }

    /**
     * @notice Calculates the health factor of a user's position.
     * @dev A factor < 100 means the position is under-collateralized and liquidatable.
     * HF = (Collateral Value * 100) / (Debt * Liquidation Threshold / 100)
     */
    function getHealthFactor(address user) public view returns (uint256) {
        BorrowRecord storage userBorrow = borrows[user];
        if (userBorrow.borrowedAmount == 0) return type(uint256).max; // Infinite health

        uint256 collateralValue = getCollateralValue(userBorrow.collateralAmount);
        uint256 currentDebt = getDebtAmount(user);

        // The value at which liquidation is allowed
        uint256 liquidationValue = (currentDebt * liquidationThreshold) / 100;
        if (liquidationValue == 0) return type(uint256).max;

        // Health Factor = (Collateral Value / Liquidation Value) * 100
        return (collateralValue * 100) / liquidationValue;
    }

    // --- Owner Functions (Administrative) ---

    function setInterestRate(uint256 _ratePerYear) external onlyOwner {
        interestRatePerYear = _ratePerYear;
    }
    function setCollateralizationRatio(uint256 _ratio) external onlyOwner {
        require(_ratio > liquidationThreshold, "Ratio must be > liquidation threshold");
        collateralizationRatio = _ratio;
    }
    function setLiquidationThreshold(uint256 _threshold) external onlyOwner {
        require(_threshold < collateralizationRatio, "Threshold must be < collateral ratio");
        liquidationThreshold = _threshold;
    }
    function setPriceFeed(address _newPriceFeed) external onlyOwner {
        priceFeed = AggregatorV3Interface(_newPriceFeed);
    }
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // --- Core Functions: Lender ---

    /**
     * @notice Deposits loanToken into the pool to earn interest.
     */
    function deposit(uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be > 0");
        
        lenderDeposits[msg.sender] += _amount;
        totalDeposited += _amount;
        
        loanToken.safeTransferFrom(msg.sender, address(this), _amount);
        
        emit Deposited(msg.sender, _amount);
    }

    /**
     * @notice Withdraws loanToken from the pool.
     */
    function withdraw(uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be > 0");
        require(lenderDeposits[msg.sender] >= _amount, "Insufficient deposit");
        
        // Check if contract has enough *liquid* (not borrowed) tokens
        uint256 liquidTokens = loanToken.balanceOf(address(this));
        require(liquidTokens >= _amount, "Insufficient liquidity in pool");
        
        lenderDeposits[msg.sender] -= _amount;
        totalDeposited -= _amount;
        
        loanToken.safeTransfer(msg.sender, _amount);
        
        emit Withdrawn(msg.sender, _amount);
    }

    // --- Core Functions: Borrower ---

    /**
     * @notice Deposits collateral and borrows loanToken.
     * @dev Can also be used to add collateral or borrow more.
     */
    function borrow(uint256 _collateralAmount, uint256 _borrowAmount) external nonReentrant whenNotPaused {
        BorrowRecord storage userBorrow = borrows[msg.sender];
        
        // 1. Calculate new total debt (settling current interest first)
        uint256 currentDebt = getDebtAmount(msg.sender);
        uint256 newTotalDebt = currentDebt + _borrowAmount;
        
        // 2. Calculate new total collateral
        uint256 newTotalCollateral = userBorrow.collateralAmount + _collateralAmount;
        require(newTotalCollateral > 0, "Must have collateral");

        // 3. Check collateralization
        uint256 maxBorrowable = getMaxBorrowable(newTotalCollateral);
        require(newTotalDebt <= maxBorrowable, "Insufficient collateral for this borrow amount");
        
        // 4. Check pool liquidity
        if (_borrowAmount > 0) {
            uint256 availableToBorrow = loanToken.balanceOf(address(this));
            require(availableToBorrow >= _borrowAmount, "Insufficient liquidity in pool");
        }
        
        // 5. Update state
        if (userBorrow.borrowedAmount > 0) {
            userBorrow.borrowedAmount = currentDebt; // Settle old interest into principal
        }
        if (_collateralAmount > 0) {
            userBorrow.collateralAmount = newTotalCollateral;
            collateralToken.safeTransferFrom(msg.sender, address(this), _collateralAmount);
        }
        if (_borrowAmount > 0) {
            userBorrow.borrowedAmount += _borrowAmount; // Add new principal
            loanToken.safeTransfer(msg.sender, _borrowAmount);
        }
        
        userBorrow.borrowTimestamp = block.timestamp; // Reset interest clock
        
        emit Borrowed(msg.sender, _collateralAmount, _borrowAmount);
    }

    /**
     * @notice Repays the loan (principal + interest).
     */
    function repay(uint256 _repayAmount) external nonReentrant whenNotPaused {
        BorrowRecord storage userBorrow = borrows[msg.sender];
        uint256 currentDebt = getDebtAmount(msg.sender);
        
        require(currentDebt > 0, "No debt to repay");
        require(_repayAmount > 0, "Repay amount must be > 0");
        
        uint256 principal = userBorrow.borrowedAmount;
        uint256 interest = currentDebt - principal;
        
        uint256 totalToRepay = _repayAmount > currentDebt ? currentDebt : _repayAmount;
        
        uint256 interestComponent;
        uint256 principalComponent;

        // Repayment prioritizes interest
        if (totalToRepay >= interest) {
            interestComponent = interest;
            principalComponent = totalToRepay - interest;
        } else {
            interestComponent = totalToRepay;
            principalComponent = 0;
        }
        
        // Update state
        userBorrow.borrowedAmount -= principalComponent;
        if (userBorrow.borrowedAmount == 0) {
            userBorrow.borrowTimestamp = 0; // Fully repaid
        } else {
            userBorrow.borrowTimestamp = block.timestamp; // Partially repaid, reset clock
        }
        
        loanToken.safeTransferFrom(msg.sender, address(this), totalToRepay);
        
        emit Repaid(msg.sender, principalComponent, interestComponent);
    }

    /**
     * @notice Withdraws collateral, if position remains healthy.
     */
    function withdrawCollateral(uint256 _withdrawAmount) external nonReentrant whenNotPaused {
        BorrowRecord storage userBorrow = borrows[msg.sender];
        require(_withdrawAmount > 0, "Amount must be > 0");
        require(userBorrow.collateralAmount >= _withdrawAmount, "Not enough collateral");
        
        uint256 remainingCollateral = userBorrow.collateralAmount - _withdrawAmount;
        uint256 currentDebt = getDebtAmount(msg.sender);

        // If they have debt, check if remaining collateral is still sufficient
        if (currentDebt > 0) {
            uint256 maxBorrowable = getMaxBorrowable(remainingCollateral);
            require(currentDebt <= maxBorrowable, "Withdrawal would make position undercollateralized");
        }
        
        userBorrow.collateralAmount = remainingCollateral;
        collateralToken.safeTransfer(msg.sender, _withdrawAmount);
    }


    // --- Core Functions: Liquidation ---

    /**
     * @notice Liquidates an unhealthy position.
     * @dev Anyone can call this. The liquidator pays off the user's *entire* debt
     * and receives their *entire* collateral.
     * A production contract would have bonuses and partial liquidations.
     */
    function liquidate(address _user) external nonReentrant whenNotPaused {
        // Check health factor
        require(getHealthFactor(_user) < 100, "Position is not liquidatable");
        
        BorrowRecord storage userBorrow = borrows[_user];
        uint256 debtToPay = getDebtAmount(_user);
        uint256 collateralToSeize = userBorrow.collateralAmount;
        
        // Reset user's borrow record
        userBorrow.borrowedAmount = 0;
        userBorrow.collateralAmount = 0;
        userBorrow.borrowTimestamp = 0;
        
        // 1. Liquidator (msg.sender) pays the user's debt to the contract
        loanToken.safeTransferFrom(msg.sender, address(this), debtToPay);
        
        // 2. Liquidator receives the user's collateral as a reward
        collateralToken.safeTransfer(msg.sender, collateralToSeize);
        
        emit Liquidated(msg.sender, _user, collateralToSeize, debtToPay);
    }
}