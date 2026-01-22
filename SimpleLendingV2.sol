// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleLendingV2 is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;

    IERC20 public immutable collateral;

    ERC20 public immutable poolShare;

    uint256 public totalLiquidity;

    uint256 public constant BP_DIVISOR = 10_000;

    uint256 public constant RAY = 1e18;

    uint256 public ltvBP;
    uint256 public annualBorrowRateBP;
    uint256 public priceCollateralToAsset;

    struct Loan {
        uint256 principal;
        uint256 borrowTimestamp;
        uint256 collateralAmount;
        bool active;
    }

    mapping(address => Loan) public loans;

    event Deposit(address indexed user, uint256 amount, uint256 sharesMinted);
    event Withdraw(address indexed user, uint256 shareAmount, uint256 amountOut);
    event Borrow(address indexed user, uint256 amount, uint256 collateralAmount);
    event Repay(address indexed user, uint256 paidAmount, uint256 interestPaid, uint256 principalPaid, bool closed);
    event Liquidate(address indexed liquidator, address indexed borrower, uint256 seizedCollateral, uint256 repaid);
    event ParamsUpdated(uint256 ltvBP, uint256 annualBorrowRateBP, uint256 price);

    constructor(
        IERC20 _asset,
        IERC20 _collateral,
        uint256 _ltvBP,
        uint256 _annualBorrowRateBP,
        uint256 _priceCollateralToAsset
    ) {
        require(address(_asset) != address(0) && address(_collateral) != address(0), "zero token");
        require(_ltvBP <= BP_DIVISOR, "ltv>100%");
        asset = _asset;
        collateral = _collateral;
        ltvBP = _ltvBP;
        annualBorrowRateBP = _annualBorrowRateBP;
        priceCollateralToAsset = _priceCollateralToAsset;

        poolShare = new ERC20("SimpleLending PoolShare", "sLPS");
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "zero deposit");
        asset.safeTransferFrom(msg.sender, address(this), amount);

        uint256 totalSharesSupply = poolShare.totalSupply();
        uint256 sharesToMint;
        if (totalSharesSupply == 0 || totalLiquidity == 0) {
            sharesToMint = amount;
        } else {
            sharesToMint = (amount * totalSharesSupply) / totalLiquidity;
        }
        require(sharesToMint > 0, "zero shares");

        totalLiquidity += amount;

        _mintShares(msg.sender, sharesToMint);

        emit Deposit(msg.sender, amount, sharesToMint);
    }

    function withdraw(uint256 shareAmount) external nonReentrant {
        require(shareAmount > 0, "zero shares");
        uint256 totalSharesSupply = poolShare.totalSupply();
        require(totalSharesSupply > 0 && totalLiquidity > 0, "empty pool");

        uint256 userBalance = poolShare.balanceOf(msg.sender);
        require(userBalance >= shareAmount, "insufficient shares");

        uint256 amountOut = (shareAmount * totalLiquidity) / totalSharesSupply;
        require(amountOut > 0, "zero withdraw");
        require(totalLiquidity >= amountOut, "insufficient liquidity");

        _burnShares(msg.sender, shareAmount);
        totalLiquidity -= amountOut;

        asset.safeTransfer(msg.sender, amountOut);

        emit Withdraw(msg.sender, shareAmount, amountOut);
    }

    function borrow(uint256 amount, uint256 collateralAmount) external nonReentrant {
        require(amount > 0 && collateralAmount > 0, "invalid args");
        Loan storage loan = loans[msg.sender];
        require(!loan.active, "existing loan active");
        require(totalLiquidity >= amount, "not enough liquidity");

        uint256 collateralValueInAsset = (collateralAmount * priceCollateralToAsset) / RAY;
        uint256 maxBorrow = (collateralValueInAsset * ltvBP) / BP_DIVISOR;
        require(amount <= maxBorrow, "exceeds LTV");

        collateral.safeTransferFrom(msg.sender, address(this), collateralAmount);

        loans[msg.sender] = Loan({
            principal: amount,
            borrowTimestamp: block.timestamp,
            collateralAmount: collateralAmount,
            active: true
        });

        totalLiquidity -= amount;
        asset.safeTransfer(msg.sender, amount);

        emit Borrow(msg.sender, amount, collateralAmount);
    }

    function repay(uint256 payAmount) external nonReentrant {
        require(payAmount > 0, "zero pay");
        Loan storage loan = loans[msg.sender];
        require(loan.active, "no active loan");


        uint256 timeElapsed = block.timestamp - loan.borrowTimestamp;
        uint256 interest = _calculateInterest(loan.principal, timeElapsed);

        asset.safeTransferFrom(msg.sender, address(this), payAmount);

        uint256 interestPaid = 0;
        uint256 principalPaid = 0;
        bool closed = false;

        if (payAmount >= interest) {
            interestPaid = interest;
            uint256 leftover = payAmount - interest;
            if (leftover >= loan.principal) {
                principalPaid = loan.principal;
                _closeLoanAndReturnCollateral(msg.sender);
                closed = true;
            } else {
                principalPaid = leftover;
                loan.principal -= principalPaid;
                loan.borrowTimestamp = block.timestamp;
            }
        } else {
            interestPaid = payAmount;
            if (interest > 0) {
                uint256 coveredSeconds = (interestPaid * timeElapsed) / interest;
                loan.borrowTimestamp = loan.borrowTimestamp + coveredSeconds;
            } else {
                loan.borrowTimestamp = block.timestamp;
            }
        }

        totalLiquidity += (interestPaid + principalPaid);

        emit Repay(msg.sender, payAmount, interestPaid, principalPaid, closed);
    }

    function liquidate(address borrower) external nonReentrant {
        Loan storage loan = loans[borrower];
        require(loan.active, "no loan");

        uint256 collateralValue = (loan.collateralAmount * priceCollateralToAsset) / RAY;

        uint256 timeElapsed = block.timestamp - loan.borrowTimestamp;
        uint256 interest = _calculateInterest(loan.principal, timeElapsed);
        uint256 owed = loan.principal + interest;

        uint256 maxBorrow = (collateralValue * ltvBP) / BP_DIVISOR;
        require(owed > maxBorrow, "not liquidatable");


        asset.safeTransferFrom(msg.sender, address(this), owed);


        uint256 seized = loan.collateralAmount;
        _clearLoan(borrower);


        totalLiquidity += owed;

        collateral.safeTransfer(msg.sender, seized);

        emit Liquidate(msg.sender, borrower, seized, owed);
    }

    function setParams(uint256 _ltvBP, uint256 _annualBorrowRateBP, uint256 _priceCollateralToAsset) external onlyOwner {
        require(_ltvBP <= BP_DIVISOR, "ltv>100%");
        ltvBP = _ltvBP;
        annualBorrowRateBP = _annualBorrowRateBP;
        priceCollateralToAsset = _priceCollateralToAsset;
        emit ParamsUpdated(_ltvBP, _annualBorrowRateBP, _priceCollateralToAsset);
    }


    function emergencyWithdrawToken(IERC20 token, address to, uint256 amount) external onlyOwner {
        require(amount > 0, "zero");
        require(address(token) != address(asset) && address(token) != address(collateral), "protected token");
        token.safeTransfer(to, amount);
    }

    function availableLiquidity() public view returns (uint256) {
        return totalLiquidity;
    }

    function _calculateInterest(uint256 principal, uint256 timeSeconds) internal view returns (uint256) {
        if (principal == 0 || annualBorrowRateBP == 0 || timeSeconds == 0) return 0;
        uint256 numerator = principal * annualBorrowRateBP * timeSeconds;
        uint256 denominator = BP_DIVISOR * 365 days;
        return numerator / denominator;
    }

    function currentOwed(address borrower) public view returns (uint256 principal, uint256 interest, uint256 owed) {
        Loan storage loan = loans[borrower];
        if (!loan.active) return (0, 0, 0);
        uint256 timeElapsed = block.timestamp - loan.borrowTimestamp;
        uint256 i = _calculateInterest(loan.principal, timeElapsed);
        uint256 o = loan.principal + i;
        return (loan.principal, i, o);
    }


    function _closeLoanAndReturnCollateral(address borrower) internal {
        Loan storage loan = loans[borrower];
        require(loan.active, "no loan");
        uint256 collateralToReturn = loan.collateralAmount;
        _clearLoan(borrower);
        // return collateral
        collateral.safeTransfer(borrower, collateralToReturn);
    }

    function _clearLoan(address borrower) internal {
        delete loans[borrower];
    }

    function _mintShares(address to, uint256 amount) internal {
        (bool success, ) = address(poolShare).call(abi.encodeWithSignature("mint(address,uint256)", to, amount));
        require(success, "mint failed");
    }

    function _burnShares(address from, uint256 amount) internal {
        (bool success, ) = address(poolShare).call(abi.encodeWithSignature("burnFrom(address,uint256)", from, amount));
        require(success, "burn failed");
    }
}
