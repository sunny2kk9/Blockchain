
pragma solidity ^0.8.0;

contract LendingBorrowing {
    mapping(address => uint256) public lenders;
    mapping(address => uint256) public borrowers;

    function lend() public payable {
        require(msg.value > 0, "Must lend something");
        lenders[msg.sender] += msg.value;
    }

    function borrow(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        borrowers[msg.sender] += amount;
        payable(msg.sender).transfer(amount);
    }

    function repay() public payable {
        require(borrowers[msg.sender] > 0, "No debt to repay");
        borrowers[msg.sender] -= msg.value;
    }
}
