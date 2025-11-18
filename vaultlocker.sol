// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract VaultLocker is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable assetToken;      
    IERC20 public immutable collateralToken; 

    uint256 public _ltvBasisPoints;             
    uint256 public _borrowRateBasisPoints;       
    uint256 public _collateralAssetPrice;      

    uint256 constant BASIS_POINT_DENOMINATOR = 10000;
    uint256 constant PRICE_SCALAR = 1e18;

    uint256 private _totalShares;
    mapping(address => uint256) public depositShares;
    uint256 private _assetReserve;           

    struct ActiveLoan {
        uint256 debtPrincipal;
        uint256 lastBorrowTime;
        uint256 collateralLocked;
        bool isActive;
    }

    mapping(address => ActiveLoan) public borrowingRecords;

    event AssetSupplied(address indexed user, uint256 amount, uint256 sharesIssued);
    event SharesRedeemed(address indexed user, uint256 sharesBurned, uint256 amount);
    event LoanRequested(address indexed borrower, uint256 loanAmount, uint256 collateralLocked);
    event LoanSettled(address indexed borrower, uint256 principalPaid, uint256 interestPaid);
    event LiquidationExecuted(address indexed liquidator, address indexed borrower, uint256 seizedCollateral, uint256 totalRepaid);
    event RiskParamsUpdated(uint256 ltvBP, uint256 annualBorrowRateBP, uint256 price);

    constructor(
        IERC20 _asset,
        IERC20 _collateral,
        uint256 initialLtvBP,
        uint256 initialBorrowRateBP,
        uint256 initialCollateralAssetPrice
    ) {
        require(address(_asset) != address(0) && address(_collateral) != address(0), "Zero token address");
        require(initialLtvBP <= BASIS_POINT_DENOMINATOR, "LTV exceeds 100%");

        assetToken = _asset;
        collateralToken = _collateral;
        _ltvBasisPoints = initialLtvBP;
        _borrowRateBasisPoints = initialBorrowRateBP;
        _collateralAssetPrice = initialCollateralAssetPrice;
    }

    function getCurrentLiquidity() public view returns (uint256) {
        return _assetReserve;
    }

    function supplyAsset(uint256 assetAmount) external nonReentrant {
        require(assetAmount > 0, "Zero deposit");
        assetToken.safeTransferFrom(msg.sender, address(this), assetAmount);

        uint256 sharesToMint;
        if (_totalShares == 0 || _assetReserve == 0) {
            sharesToMint = assetAmount;
        } else {
            sharesToMint = (assetAmount * _totalShares) / _assetReserve;
        }

        require(sharesToMint > 0, "Zero shares");
        depositShares[msg.sender] += sharesToMint;
        _totalShares += sharesToMint;
        _assetReserve += assetAmount;

        emit AssetSupplied(msg.sender, assetAmount, sharesToMint);
    }

    function redeemShares(uint256 sharesToBurn) external nonReentrant {
        require(sharesToBurn > 0, "Zero shares");
        require(depositShares[msg.sender] >= sharesToBurn, "Insufficient shares");
        require(_totalShares > 0 && _assetReserve > 0, "Empty pool");

        uint256 assetToReturn = (sharesToBurn * _assetReserve) / _totalShares;

        depositShares[msg.sender] -= sharesToBurn;
        _totalShares -= sharesToBurn;
        require(_assetReserve >= assetToReturn, "Reserve underflow");
        _assetReserve -= assetToReturn;

        assetToken.safeTransfer(msg.sender, assetToReturn);
        emit SharesRedeemed(msg.sender, sharesToBurn, assetToReturn);
    }

    function requestLoan(uint256 amountToBorrow, uint256 collateralToLock) external nonReentrant {
        require(amountToBorrow > 0 && collateralToLock > 0, "Invalid args");
        require(borrowingRecords[msg.sender].isActive == false, "Existing loan active");
        require(getCurrentLiquidity() >= amountToBorrow, "Not enough liquidity");

        uint256 collateralValueInAsset = (collateralToLock * _collateralAssetPrice) / PRICE_SCALAR;
        uint256 maxAllowedBorrow = (collateralValueInAsset * _ltvBasisPoints) / BASIS_POINT_DENOMINATOR;
        require(amountToBorrow <= maxAllowedBorrow, "Exceeds LTV limit");

        collateralToken.safeTransferFrom(msg.sender, address(this), collateralToLock);

        borrowingRecords[msg.sender] = ActiveLoan({
            debtPrincipal: amountToBorrow,
            lastBorrowTime: block.timestamp,
            collateralLocked: collateralToLock,
            isActive: true
        });

        _assetReserve -= amountToBorrow;
        assetToken.safeTransfer(msg.sender, amountToBorrow);

        emit LoanRequested(msg.sender, amountToBorrow, collateralToLock);
    }

    function settleLoan() external nonReentrant {
        ActiveLoan storage loan = borrowingRecords[msg.sender];
        require(loan.isActive, "No active loan");

        uint256 timeElapsed = block.timestamp - loan.lastBorrowTime;
        uint256 interest = _calculateCurrentInterest(loan.debtPrincipal, timeElapsed);
        uint256 totalOwed = loan.debtPrincipal + interest;

        assetToken.safeTransferFrom(msg.sender, address(this), totalOwed);

        uint256 collateralToReturn = loan.collateralLocked;

        delete borrowingRecords[msg.sender];

        _assetReserve += totalOwed;

        collateralToken.safeTransfer(msg.sender, collateralToReturn);

        emit LoanSettled(msg.sender, totalOwed - interest, interest);
    }

    function forceLiquidation(address borrower) external nonReentrant {
        ActiveLoan storage loan = borrowingRecords[borrower];
        require(loan.isActive, "No active loan");

        uint256 timeElapsed = block.timestamp - loan.lastBorrowTime;
        uint256 interest = _calculateCurrentInterest(loan.debtPrincipal, timeElapsed);
        uint256 totalOwed = loan.debtPrincipal + interest;

        uint256 collateralValue = (loan.collateralLocked * _collateralAssetPrice) / PRICE_SCALAR;
        uint256 maxAllowedBorrow = (collateralValue * _ltvBasisPoints) / BASIS_POINT_DENOMINATOR;
        
        require(totalOwed > maxAllowedBorrow, "Loan not liquidatable");

        assetToken.safeTransferFrom(msg.sender, address(this), totalOwed);

        uint256 seizedCollateral = loan.collateralLocked;

        delete borrowingRecords[borrower];

        _assetReserve += totalOwed;

        collateralToken.safeTransfer(msg.sender, seizedCollateral);

        emit LiquidationExecuted(msg.sender, borrower, seizedCollateral, totalOwed);
    }

    function updateRiskParameters(
        uint256 newLtvBP,
        uint256 newBorrowRateBP,
        uint256 newPriceCollateralToAsset
    ) external onlyOwner {
        require(newLtvBP <= BASIS_POINT_DENOMINATOR, "LTV exceeds 100%");
        _ltvBasisPoints = newLtvBP;
        _borrowRateBasisPoints = newBorrowRateBP;
        _collateralAssetPrice = newPriceCollateralToAsset;
        emit RiskParamsUpdated(newLtvBP, newBorrowRateBP, newPriceCollateralToAsset);
    }

    function rescueUnprotectedToken(
        IERC20 token,
        address recipient,
        uint256 amount
    ) external onlyOwner {
        require(amount > 0, "Zero amount");
        require(address(token) != address(assetToken) && address(token) != address(collateralToken), "Protected token");
        token.safeTransfer(recipient, amount);
    }

    function _calculateCurrentInterest(uint256 principal, uint256 timeSeconds) internal view returns (uint256 interest) {
        if (principal == 0 || _borrowRateBasisPoints == 0 || timeSeconds == 0) {
            return 0;
        }
        uint256 numerator = principal * _borrowRateBasisPoints * timeSeconds;
        uint256 denominator = BASIS_POINT_DENOMINATOR * 365 days;
        return numerator / denominator;
    }
}