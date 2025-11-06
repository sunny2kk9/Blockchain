 
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LoanVault is Ownable, ReentrancyGuard {
    IERC20 public stableToken;

    struct BorrowInfo {
        uint256 principal;
        uint256 collateralETH;
        uint256 rate;
        bool settled;
    }

    mapping(address => uint256) public deposits;
    mapping(address => BorrowInfo) public borrowings;

    event FundsDeposited(address indexed lender, uint256 amount);
    event LoanTaken(address indexed borrower, uint256 amount, uint256 collateral);
    event LoanSettled(address indexed borrower, uint256 totalPaid);
    event OwnerWithdrawal(address indexed receiver, uint256 amount);

    constructor(address tokenAddr) Ownable(msg.sender) {
        require(tokenAddr != address(0), "Invalid token");
        stableToken = IERC20(tokenAddr);
    }

   
    function addLiquidity(uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");
        stableToken.transferFrom(msg.sender, address(this), amount);
        deposits[msg.sender] += amount;
        emit FundsDeposited(msg.sender, amount);
    }

  
    function requestLoan(uint256 loanAmount) external payable nonReentrant {
        require(loanAmount > 0, "Invalid loan");
        require(msg.value > 0, "Collateral required");
        require(borrowings[msg.sender].principal == 0, "Existing loan found");

        borrowings[msg.sender] = BorrowInfo({
            principal: loanAmount,
            collateralETH: msg.value,
            rate: 10, 
            settled: false
        });

        stableToken.transfer(msg.sender, loanAmount);
        emit LoanTaken(msg.sender, loanAmount, msg.value);
    }

   
    function settleLoan() external nonReentrant {
        BorrowInfo storage loan = borrowings[msg.sender];
        require(loan.principal > 0, "No active loan");
        require(!loan.settled, "Loan already settled");

        uint256 totalPayable = loan.principal + (loan.principal * loan.rate / 100);
        stableToken.transferFrom(msg.sender, address(this), totalPayable);

        loan.settled = true;

        payable(msg.sender).transfer(loan.collateralETH);
        emit LoanSettled(msg.sender, totalPayable);
    }

   
    function withdrawToken(address recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        stableToken.transfer(recipient, amount);
        emit OwnerWithdrawal(recipient, amount);
    }
}
