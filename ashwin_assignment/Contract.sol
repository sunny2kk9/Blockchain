
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TokenLendBorrow is Ownable, ReentrancyGuard {
    IERC20 public immutable lendingToken;

    struct BorrowInfo {
        address user;
        uint256 principal;
        uint256 lockedCollateral;
        uint256 rate;
        bool isSettled;
    }

    mapping(address => uint256) public deposits;
    mapping(address => BorrowInfo) public borrowData;

    event TokensDeposited(address indexed lender, uint256 value);
    event LoanIssued(address indexed borrower, uint256 value, uint256 collateralValue);
    event LoanCleared(address indexed borrower, uint256 repaymentValue);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        lendingToken = IERC20(_tokenAddress);
    }

    function provideLiquidity(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Deposit must be greater than zero");
        lendingToken.transferFrom(msg.sender, address(this), _amount);
        deposits[msg.sender] += _amount;
        emit TokensDeposited(msg.sender, _amount);
    }

    function requestLoan(uint256 _borrowAmt) external payable nonReentrant {
        require(borrowData[msg.sender].principal == 0, "Existing loan found");
        require(msg.value > 0, "Collateral cannot be zero");

        borrowData[msg.sender] = BorrowInfo({
            user: msg.sender,
            principal: _borrowAmt,
            lockedCollateral: msg.value,
            rate: 10,
            isSettled: false
        });

        lendingToken.transfer(msg.sender, _borrowAmt);
        emit LoanIssued(msg.sender, _borrowAmt, msg.value);
    }

    function settleLoan() external nonReentrant {
        BorrowInfo storage loan = borrowData[msg.sender];
        require(!loan.isSettled, "Loan already cleared");
        require(loan.principal > 0, "No active loan found");

        uint256 payableAmount = loan.principal + (loan.principal * loan.rate / 100);
        lendingToken.transferFrom(msg.sender, address(this), payableAmount);

        loan.isSettled = true;
        payable(msg.sender).transfer(loan.lockedCollateral);

        emit LoanCleared(msg.sender, payableAmount);
    }

    function extractEarnings(address receiver, uint256 _amount) external onlyOwner {
        lendingToken.transfer(receiver, _amount);
    }
}
