pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract LendingAndBorrowing is Ownable {
    struct Loan {
        uint256 amount;
        uint256 interest;
        bool repaid;
    }

    mapping(address => uint256) public deposits;
    mapping(address => Loan) public loans;

    uint256 public totalPool;

    constructor() Ownable(msg.sender) {}

    function deposit() external payable {
        require(msg.value > 0, "Must send ETH");
        deposits[msg.sender] += msg.value;
        totalPool += msg.value;
    }

    function borrow(uint256 _amount) external {
        require(_amount > 0, "Amount must be > 0");
        require(_amount <= totalPool, "Not enough in pool");
        require(loans[msg.sender].amount == 0, "Existing loan");

        uint256 interest = (_amount * 5) / 100; // 5% interest
        loans[msg.sender] = Loan(_amount, interest, false);

        totalPool -= _amount;
        payable(msg.sender).transfer(_amount);
    }

    function repay() external payable {
        Loan storage loan = loans[msg.sender];
        require(loan.amount > 0, "No active loan");
        require(!loan.repaid, "Already repaid");

        uint256 totalDue = loan.amount + loan.interest;
        require(msg.value >= totalDue, "Not enough ETH to repay");

        loan.repaid = true;
        totalPool += msg.value;
    }

    function withdraw(uint256 _amount) external {
        require(_amount > 0, "Invalid amount");
        require(deposits[msg.sender] >= _amount, "Insufficient balance");
        require(totalPool >= _amount, "Pool has not enough ETH");

        deposits[msg.sender] -= _amount;
        totalPool -= _amount;
        payable(msg.sender).transfer(_amount);
    }

    function getLoanDetails(address user)
        external
        view
        returns (uint256 amount, uint256 interest, bool repaid)
    {
        Loan memory l = loans[user];
        return (l.amount, l.interest, l.repaid);
    }

    receive() external payable {
        totalPool += msg.value;
    }
}
