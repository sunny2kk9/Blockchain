// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TokenLendBorrow is Ownable, ReentrancyGuard {
    IERC20 public immutable lendingToken;

    struct LoanRecord {
        address borrower;
        uint256 borrowedAmount;
        uint256 collateralLocked;
        uint256 interestRate;
        bool repaid;
    }

    mapping(address => uint256) public lenderBalances;
    mapping(address => LoanRecord) public activeLoans;

    event LiquidityAdded(address indexed provider, uint256 amount);
    event LoanRequested(address indexed borrower, uint256 loanAmount, uint256 collateral);
    event LoanSettled(address indexed borrower, uint256 totalPaid);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        lendingToken = IERC20(_tokenAddress);
    }

    function depositFunds(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than zero");
        lendingToken.transferFrom(msg.sender, address(this), _amount);
        lenderBalances[msg.sender] += _amount;
        emit LiquidityAdded(msg.sender, _amount);
    }

    function borrowTokens(uint256 _loanAmount) external payable nonReentrant {
        require(activeLoans[msg.sender].borrowedAmount == 0, "Existing loan must be repaid first");
        require(msg.value > 0, "Collateral required");

        activeLoans[msg.sender] = LoanRecord({
            borrower: msg.sender,
            borrowedAmount: _loanAmount,
            collateralLocked: msg.value,
            interestRate: 10,
            repaid: false
        });

        lendingToken.transfer(msg.sender, _loanAmount);
        emit LoanRequested(msg.sender, _loanAmount, msg.value);
    }

    function repayLoan() external nonReentrant {
        LoanRecord storage record = activeLoans[msg.sender];
        require(!record.repaid, "Loan already repaid");
        require(record.borrowedAmount > 0, "No loan found");

        uint256 repayment = record.borrowedAmount + (record.borrowedAmount * record.interestRate / 100);
        lendingToken.transferFrom(msg.sender, address(this), repayment);

        record.repaid = true;
        payable(msg.sender).transfer(record.collateralLocked);

        emit LoanSettled(msg.sender, repayment);
    }

    function withdrawEarnings(address _to, uint256 _amount) external onlyOwner {
        lendingToken.transfer(_to, _amount);
    }
}
