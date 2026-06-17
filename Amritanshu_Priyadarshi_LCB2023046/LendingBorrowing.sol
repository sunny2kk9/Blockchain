// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UniLend is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;
    IERC20 public immutable collateral;
    uint256 public totalShares;
    mapping(address => uint256) public shares;
    uint256 public totalLiquidity;
    uint256 public ltvBP;
    uint256 public annualBorrowRateBP;
    uint256 public priceCollateralToAsset;
    uint256 constant BP_DIVISOR = 10000;
    uint256 constant RAY = 1e18;

    struct Loan { uint256 principal; uint256 borrowTimestamp; uint256 collateralAmount; bool active; }
    mapping(address => Loan) public loans;

    event Deposit(address indexed user, uint256 amount, uint256 sharesMinted);
    event Withdraw(address indexed user, uint256 sharesBurned, uint256 amount);
    event Borrow(address indexed user, uint256 amount, uint256 collateralAmount);
    event Repay(address indexed user, uint256 repaidPrincipal, uint256 repaidInterest);
    event Liquidate(address indexed liquidator, address indexed borrower, uint256 seizedCollateral, uint256 repaid);
    event ParamsUpdated(uint256 ltvBP, uint256 annualBorrowRateBP, uint256 price);

    constructor(IERC20 _asset, IERC20 _collateral, uint256 _ltvBP, uint256 _annualBorrowRateBP, uint256 _price) {
        require(address(_asset) != address(0) && address(_collateral) != address(0));
        require(_ltvBP <= BP_DIVISOR);
        asset = _asset;
        collateral = _collateral;
        ltvBP = _ltvBP;
        annualBorrowRateBP = _annualBorrowRateBP;
        priceCollateralToAsset = _price;
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0);
        asset.safeTransferFrom(msg.sender, address(this), amount);
        uint256 sharesToMint = (totalShares == 0 || totalLiquidity == 0) ? amount : (amount * totalShares) / totalLiquidity;
        require(sharesToMint > 0);
        shares[msg.sender] += sharesToMint;
        totalShares += sharesToMint;
        totalLiquidity += amount;
        emit Deposit(msg.sender, amount, sharesToMint);
    }

    function withdraw(uint256 shareAmount) external nonReentrant {
        require(shareAmount > 0 && shares[msg.sender] >= shareAmount && totalShares > 0 && totalLiquidity > 0);
        uint256 amount = (shareAmount * totalLiquidity) / totalShares;
        shares[msg.sender] -= shareAmount;
        totalShares -= shareAmount;
        require(totalLiquidity >= amount);
        totalLiquidity -= amount;
        asset.safeTransfer(msg.sender, amount);
        emit Withdraw(msg.sender, shareAmount, amount);
    }

    function availableLiquidity() public view returns (uint256) {
        return totalLiquidity;
    }

    function borrow(uint256 amount, uint256 collateralAmount) external nonReentrant {
        require(amount > 0 && collateralAmount > 0);
        require(!loans[msg.sender].active);
        require(availableLiquidity() >= amount);
        uint256 collateralValueInAsset = (collateralAmount * priceCollateralToAsset) / RAY;
        uint256 maxBorrow = (collateralValueInAsset * ltvBP) / BP_DIVISOR;
        require(amount <= maxBorrow);
        collateral.safeTransferFrom(msg.sender, address(this), collateralAmount);
        loans[msg.sender] = Loan({ principal: amount, borrowTimestamp: block.timestamp, collateralAmount: collateralAmount, active: true });
        totalLiquidity -= amount;
        asset.safeTransfer(msg.sender, amount);
        emit Borrow(msg.sender, amount, collateralAmount);
    }

    function repay() external nonReentrant {
        Loan storage loan = loans[msg.sender];
        require(loan.active);
        uint256 timeElapsed = block.timestamp - loan.borrowTimestamp;
        uint256 interest = _calculateInterest(loan.principal, timeElapsed);
        uint256 owed = loan.principal + interest;
        asset.safeTransferFrom(msg.sender, address(this), owed);
        uint256 returnedCollateral = loan.collateralAmount;
        loan.active = false;
        loan.principal = 0;
        loan.collateralAmount = 0;
        loan.borrowTimestamp = 0;
        totalLiquidity += owed;
        collateral.safeTransfer(msg.sender, returnedCollateral);
        emit Repay(msg.sender, owed - interest, interest);
    }

    function liquidate(address borrower) external nonReentrant {
        Loan storage loan = loans[borrower];
        require(loan.active);
        uint256 collateralValue = (loan.collateralAmount * priceCollateralToAsset) / RAY;
        uint256 timeElapsed = block.timestamp - loan.borrowTimestamp;
        uint256 interest = _calculateInterest(loan.principal, timeElapsed);
        uint256 owed = loan.principal + interest;
        uint256 maxBorrow = (collateralValue * ltvBP) / BP_DIVISOR;
        require(owed > maxBorrow);
        asset.safeTransferFrom(msg.sender, address(this), owed);
        uint256 seized = loan.collateralAmount;
        loan.active = false;
        loan.principal = 0;
        loan.collateralAmount = 0;
        loan.borrowTimestamp = 0;
        totalLiquidity += owed;
        collateral.safeTransfer(msg.sender, seized);
        emit Liquidate(msg.sender, borrower, seized, owed);
    }

    function setParams(uint256 _ltvBP, uint256 _annualBorrowRateBP, uint256 _price) external onlyOwner {
        require(_ltvBP <= BP_DIVISOR);
        ltvBP = _ltvBP;
        annualBorrowRateBP = _annualBorrowRateBP;
        priceCollateralToAsset = _price;
        emit ParamsUpdated(_ltvBP, _annualBorrowRateBP, _price);
    }

    function emergencyWithdrawToken(IERC20 token, address to, uint256 amount) external onlyOwner {
        require(amount > 0);
        require(address(token) != address(asset) && address(token) != address(collateral));
        token.safeTransfer(to, amount);
    }

    function _calculateInterest(uint256 principal, uint256 timeSeconds) internal view returns (uint256) {
        if (principal == 0 || annualBorrowRateBP == 0 || timeSeconds == 0) return 0;
        return (principal * annualBorrowRateBP * timeSeconds) / (BP_DIVISOR * 365 days);
    }
}
