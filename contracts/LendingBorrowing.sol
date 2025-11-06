// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

 

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LendingBorrowing is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;  

    uint256 public totalPool; 
    uint256 public totalShares; 
    mapping(address => uint256) public shares;  

    uint256 public loanCounter;

    
    uint256 public annualInterestBps = 500;
     uint256 public collateralFactorBps = 15000;  
     uint256 public maintenanceMarginBps = 12500;  
    uint256 public constant BPS = 10000;

    struct Loan {
        address borrower;
        uint256 principal;  
        uint256 startAt; 
        uint256 collateralAmount;
        bool    repaid;
    }

    mapping(uint256 => Loan) public loans;

    event Deposited(address indexed lender, uint256 amount, uint256 sharesMinted);
    event Withdrawn(address indexed lender, uint256 amount, uint256 sharesBurned);
    event Borrowed(address indexed borrower, uint256 loanId, uint256 amount, uint256 collateral);
    event Repaid(address indexed borrower, uint256 loanId, uint256 totalPaid);
    event Liquidated(address indexed liquidator, uint256 loanId, uint256 seizedCollateral);

    constructor(IERC20 _token) {
        require(address(_token) != address(0), "zero token");
        token = _token;
    }

    /* ------------------- LENDER FUNCTIONS ------------------- */

    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "zero amount");
        uint256 _shares;
        if (totalPool == 0 || totalShares == 0) {
            _shares = _amount;
        } else {
            _shares = (_amount * totalShares) / totalPool;
            require(_shares > 0, "amount too small");
        }

        token.safeTransferFrom(msg.sender, address(this), _amount);

        totalPool += _amount;
        totalShares += _shares;
        shares[msg.sender] += _shares;

        emit Deposited(msg.sender, _amount, _shares);
    }

    function withdraw(uint256 _shares) external nonReentrant {
        require(_shares > 0, "zero shares");
        require(shares[msg.sender] >= _shares, "insufficient shares");
        require(totalShares > 0, "no shares");

        uint256 amount = (totalPool * _shares) / totalShares;

        shares[msg.sender] -= _shares;
        totalShares -= _shares;
        totalPool -= amount;

        token.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount, _shares);
    }

    /* ------------------- BORROWER FUNCTIONS ------------------- */

    function borrow(uint256 _amount, uint256 _collateralAmount) external nonReentrant returns (uint256) {
        require(_amount > 0, "zero amount");
        require(_collateralAmount > 0, "zero collateral");
        require(totalPool >= _amount, "insufficient liquidity");

        uint256 requiredCollateral = (_amount * collateralFactorBps) / BPS;
        require(_collateralAmount >= requiredCollateral, "insufficient collateral");

        
        token.safeTransferFrom(msg.sender, address(this), _collateralAmount);

      
        loanCounter++;
        loans[loanCounter] = Loan({
            borrower: msg.sender,
            principal: _amount,
            startAt: block.timestamp,
            collateralAmount: _collateralAmount,
            repaid: false
        });

       
        totalPool -= _amount;

   
        token.safeTransfer(msg.sender, _amount);

        emit Borrowed(msg.sender, loanCounter, _amount, _collateralAmount);
        return loanCounter;
    }

   
    function repay(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "not borrower");
        require(!loan.repaid, "already repaid");

      
        uint256 duration = block.timestamp - loan.startAt;
        uint256 interest = (loan.principal * annualInterestBps * duration) / (365 days * BPS);

        uint256 totalDue = loan.principal + interest;

      
        token.safeTransferFrom(msg.sender, address(this), totalDue);

      
        totalPool += totalDue;

        loan.repaid = true;

      
        token.safeTransfer(loan.borrower, loan.collateralAmount);

        emit Repaid(msg.sender, _loanId, totalDue);
    }

    /* ------------------- LIQUIDATION ------------------- */

  
    function liquidate(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        require(!loan.repaid, "already repaid");

        
        uint256 collateralRatioBps;
        if (loan.principal == 0) {
            collateralRatioBps = type(uint256).max;
        } else {
            collateralRatioBps = (loan.collateralAmount * BPS) / loan.principal;
        }

        require(collateralRatioBps < maintenanceMarginBps, "not liquidatable");

      
        uint256 seized = loan.collateralAmount;
        loan.repaid = true; 
       
        token.safeTransfer(msg.sender, seized);

        emit Liquidated(msg.sender, _loanId, seized);
    }

        Loan memory loan = loans[_loanId];
        if (loan.repaid) return 0;
        uint256 duration = block.timestamp - loan.startAt;
        uint256 interest = (loan.principal * annualInterestBps * duration) / (365 days * BPS);
        return interest;
    }

    function shareValue(uint256 _share) public view returns (uint256) {
        if (totalShares == 0) return 0;
        return (totalPool * _share) / totalShares;
    }

   

    function setAnnualInterestBps(uint256 _bps) external onlyOwner {
        require(_bps <= 2000, "too high");
    }

    function setCollateralFactorBps(uint256 _bps) external onlyOwner {
        require(_bps >= BPS, "must be >= 100%");
        collateralFactorBps = _bps;
    }

    function setMaintenanceMarginBps(uint256 _bps) external onlyOwner {
        require(_bps >= BPS, "must be >= 100%");
        maintenanceMarginBps = _bps;
    }

    
    function emergencyWithdraw(address _to, uint256 _amount) external onlyOwner {
        token.safeTransfer(_to, _amount);
    }
}
