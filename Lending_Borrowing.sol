// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/*
  Simple lending & borrowing contract using OpenZeppelin libs.
  - Supports ERC20 collateral and loan tokens (configurable per pool)
  - Uses a basic interest accrual model (continuous/simple per-second)
  - Collateral factor, liquidation incentive, and price oracle are configurable
  - NOT production-ready — security review and audits required before use
*/

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IPriceOracle {
    // returns price of token in USD with 18 decimals (e.g., 1 token = X * 1e18 USD)
    function getPrice(address token) external view returns (uint256);
}

contract SimpleLending is ReentrancyGuard, Ownable {
    struct Pool {
        IERC20 asset;            // asset that lenders supply and borrowers borrow
        IERC20 collateralToken;  // token accepted as collateral
        uint256 totalSupply;     // total asset supplied
        uint256 totalBorrows;    // total asset borrowed (principal)
        uint256 borrowIndex;     // accrues interest for borrows
        uint256 borrowRatePerSec;// borrow interest rate (per second, 1e18 scale)
        uint256 reserveFactor;   // portion of interest kept as reserve (1e18 scale)
        uint256 collateralFactor; // loan-to-value (1e18 scale), e.g., 0.75e18 means 75%
        uint256 liquidationIncentive; // e.g., 1.05e18 means liquidator gets 5% bonus
        uint256 lastAccrual;     // timestamp of last interest accrual
    }

    // user => poolId => balances
    mapping(uint256 => mapping(address => uint256)) public supplyBalance; // raw amount of asset supplied by user
    mapping(uint256 => mapping(address => uint256)) public borrowPrincipal; // principal borrowed by user
    mapping(uint256 => mapping(address => uint256)) public collateralBalance; // amount of collateral token locked

    Pool[] public pools;
    IPriceOracle public priceOracle;

    // events
    event PoolCreated(uint256 indexed pid, address asset, address collateralToken);
    event Supply(uint256 indexed pid, address indexed user, uint256 amt);
    event Withdraw(uint256 indexed pid, address indexed user, uint256 amt);
    event Borrow(uint256 indexed pid, address indexed user, uint256 amt);
    event Repay(uint256 indexed pid, address indexed user, uint256 amt);
    event Liquidate(uint256 indexed pid, address indexed liquidator, address indexed borrower, uint256 repayAmt, uint256 seizeCollateral);

    constructor(address _priceOracle) {
        priceOracle = IPriceOracle(_priceOracle);
    }

    // --- ADMIN ---
    function setPriceOracle(address _oracle) external onlyOwner {
        priceOracle = IPriceOracle(_oracle);
    }

    function createPool(
        address asset,
        address collateralToken,
        uint256 borrowRatePerSec,
        uint256 reserveFactor,
        uint256 collateralFactor,
        uint256 liquidationIncentive
    ) external onlyOwner returns (uint256) {
        Pool memory p;
        p.asset = IERC20(asset);
        p.collateralToken = IERC20(collateralToken);
        p.totalSupply = 0;
        p.totalBorrows = 0;
        p.borrowIndex = 1e18;
        p.borrowRatePerSec = borrowRatePerSec;
        p.reserveFactor = reserveFactor;
        p.collateralFactor = collateralFactor;
        p.liquidationIncentive = liquidationIncentive;
        p.lastAccrual = block.timestamp;

        pools.push(p);
        uint256 pid = pools.length - 1;
        emit PoolCreated(pid, asset, collateralToken);
        return pid;
    }

    // --- INTEREST ACCRUAL ---
    function accrueInterest(uint256 pid) public {
        Pool storage p = pools[pid];
        uint256 nowTs = block.timestamp;
        if (nowTs == p.lastAccrual) return;
        uint256 delta = nowTs - p.lastAccrual;
        if (p.totalBorrows == 0) {
            p.lastAccrual = nowTs;
            return;
        }
        // interest factor = borrowRatePerSec * delta (1e18 scale)
        uint256 interestFactor = p.borrowRatePerSec * delta / 1e18; // still 1e18-ish small
        // increase total borrows by interest
        uint256 interestAccrued = (p.totalBorrows * interestFactor) / 1e18;
        p.totalBorrows += interestAccrued;
        // update borrowIndex
        p.borrowIndex = p.borrowIndex + (p.borrowIndex * interestFactor) / 1e18;
        p.lastAccrual = nowTs;
    }

    // --- VIEW HELPERS ---
    function poolCount() external view returns (uint256) { return pools.length; }

    function getUserBorrowBalance(uint256 pid, address user) public view returns (uint256) {
        Pool storage p = pools[pid];
        // approximate borrowed amount including interest using borrowIndex
        // borrowed = principal * (currentIndex / initialIndex)
        // For simplicity assume principal stored as raw principal and initialIndex when borrowed was 1e18
        if (borrowPrincipal[pid][user] == 0) return 0;
        uint256 principal = borrowPrincipal[pid][user];
        uint256 current = (principal * p.borrowIndex) / 1e18;
        return current;
    }

    // Price helpers assume oracle returns price with 18 decimals in USD
    function getAssetValueUSD(uint256 pid, uint256 assetAmount) public view returns (uint256) {
        Pool storage p = pools[pid];
        uint256 price = priceOracle.getPrice(address(p.asset));
        // value = assetAmount * price / (10**decimals) -- assume tokens have 18 decimals
        return (assetAmount * price) / 1e18;
    }

    function getCollateralValueUSD(uint256 pid, uint256 collateralAmt) public view returns (uint256) {
        Pool storage p = pools[pid];
        uint256 price = priceOracle.getPrice(address(p.collateralToken));
        return (collateralAmt * price) / 1e18;
    }

    function accountLiquidity(uint256 pid, address user) public view returns (bool healthy, uint256 shortfallUSD) {
        Pool storage p = pools[pid];
        uint256 collateralUSD = getCollateralValueUSD(pid, collateralBalance[pid][user]);
        uint256 borrowUSD = getAssetValueUSD(pid, getUserBorrowBalance(pid, user));
        uint256 maxBorrowUSD = (collateralUSD * p.collateralFactor) / 1e18;
        if (maxBorrowUSD >= borrowUSD) return (true, 0);
        return (false, borrowUSD - maxBorrowUSD);
    }

    // --- USER ACTIONS ---
    function supply(uint256 pid, uint256 amt) external nonReentrant {
        require(amt > 0, "amt>0");
        Pool storage p = pools[pid];
        accrueInterest(pid);
        // transfer tokens in
        require(p.asset.transferFrom(msg.sender, address(this), amt), "transfer failed");
        supplyBalance[pid][msg.sender] += amt;
        p.totalSupply += amt;
        emit Supply(pid, msg.sender, amt);
    }

    function withdraw(uint256 pid, uint256 amt) external nonReentrant {
        require(amt > 0, "amt>0");
        Pool storage p = pools[pid];
        accrueInterest(pid);
        require(supplyBalance[pid][msg.sender] >= amt, "insufficient supply");
        // check if withdrawing would make borrow unsafe
        supplyBalance[pid][msg.sender] -= amt;
        p.totalSupply -= amt;
        // after decreasing supply, user may still have borrows; ensure still healthy
        (bool healthy, ) = accountLiquidity(pid, msg.sender);
        require(healthy, "withdraw would make account undercollateralized");
        require(p.asset.transfer(msg.sender, amt), "transfer failed");
        emit Withdraw(pid, msg.sender, amt);
    }

    function depositCollateral(uint256 pid, uint256 amt) external nonReentrant {
        require(amt > 0, "amt>0");
        Pool storage p = pools[pid];
        require(p.collateralToken.transferFrom(msg.sender, address(this), amt), "transfer failed");
        collateralBalance[pid][msg.sender] += amt;
    }

    function withdrawCollateral(uint256 pid, uint256 amt) external nonReentrant {
        require(amt > 0, "amt>0");
        Pool storage p = pools[pid];
        require(collateralBalance[pid][msg.sender] >= amt, "not enough collateral");
        // tentatively reduce collateral and check liquidity
        collateralBalance[pid][msg.sender] -= amt;
        (bool healthy, ) = accountLiquidity(pid, msg.sender);
        require(healthy, "withdraw collateral would make undercollateralized");
        require(p.collateralToken.transfer(msg.sender, amt), "transfer failed");
    }

    function borrow(uint256 pid, uint256 amt) external nonReentrant {
        require(amt > 0, "amt>0");
        Pool storage p = pools[pid];
        accrueInterest(pid);
        // check available liquidity in pool
        uint256 available = p.totalSupply - p.totalBorrows;
        require(available >= amt, "insufficient pool liquidity");
        // increase user borrow principal (we store principal relative to current index)
        // to keep it simple, store principal scaled back to base index (1e18) by dividing by current index
        uint256 principalToStore = (amt * 1e18) / p.borrowIndex;
        borrowPrincipal[pid][msg.sender] += principalToStore;
        p.totalBorrows += amt;
        // check collateralization
        (bool healthy, ) = accountLiquidity(pid, msg.sender);
        require(healthy, "insufficient collateral");
        require(p.asset.transfer(msg.sender, amt), "transfer failed");
        emit Borrow(pid, msg.sender, amt);
    }

    function repay(uint256 pid, uint256 amt) external nonReentrant {
        require(amt > 0, "amt>0");
        Pool storage p = pools[pid];
        accrueInterest(pid);
        uint256 owed = getUserBorrowBalance(pid, msg.sender);
        require(owed > 0, "no debt");
        uint256 payAmt = amt > owed ? owed : amt;
        // collect payment
        require(p.asset.transferFrom(msg.sender, address(this), payAmt), "transfer failed");
        // reduce principal stored
        // compute principal reduction in stored units: principalReduction = payAmt * 1e18 / borrowIndex
        uint256 principalReduction = (payAmt * 1e18) / p.borrowIndex;
        uint256 stored = borrowPrincipal[pid][msg.sender];
        if (principalReduction >= stored) {
            // full repay
            borrowPrincipal[pid][msg.sender] = 0;
        } else {
            borrowPrincipal[pid][msg.sender] = stored - principalReduction;
        }
        p.totalBorrows -= payAmt;
        emit Repay(pid, msg.sender, payAmt);
    }

    // liquidate undercollateralized account
    // liquidator repays up to `repayAmt` of borrow and receives collateral with incentive
    function liquidate(uint256 pid, address borrower, uint256 repayAmt) external nonReentrant {
        require(repayAmt > 0, "amt>0");
        Pool storage p = pools[pid];
        accrueInterest(pid);
        (bool healthy, uint256 shortfallUSD) = accountLiquidity(pid, borrower);
        require(!healthy, "account healthy");
        uint256 owed = getUserBorrowBalance(pid, borrower);
        uint256 actualRepay = repayAmt > owed ? owed : repayAmt;
        // transfer repay from liquidator
        require(p.asset.transferFrom(msg.sender, address(this), actualRepay), "transfer failed");
        // compute USD value of repay
        uint256 repayUSD = getAssetValueUSD(pid, actualRepay);
        // compute how much collateral to seize (in USD) with incentive
        uint256 seizeUSD = (repayUSD * p.liquidationIncentive) / 1e18;
        // convert seizeUSD to collateral tokens
        uint256 collateralPrice = priceOracle.getPrice(address(p.collateralToken));
        uint256 seizeCollateral = (seizeUSD * 1e18) / collateralPrice; // collateral token amount (assumes 18 decimals)

        require(collateralBalance[pid][borrower] >= seizeCollateral, "not enough collateral to seize");
        // reduce borrower collateral
        collateralBalance[pid][borrower] -= seizeCollateral;
        // reduce borrower's principal proportionally
        uint256 principalReduction = (actualRepay * 1e18) / p.borrowIndex;
        uint256 stored = borrowPrincipal[pid][borrower];
        if (principalReduction >= stored) borrowPrincipal[pid][borrower] = 0;
        else borrowPrincipal[pid][borrower] = stored - principalReduction;
        p.totalBorrows -= actualRepay;
        // transfer seized collateral to liquidator
        require(p.collateralToken.transfer(msg.sender, seizeCollateral), "transfer failed");
        emit Liquidate(pid, msg.sender, borrower, actualRepay, seizeCollateral);
    }

    // emergency rescue
    function adminWithdrawERC20(address token, address to, uint256 amt) external onlyOwner {
        IERC20(token).transfer(to, amt);
    }
}
