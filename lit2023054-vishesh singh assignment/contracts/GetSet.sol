// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

contract GetSet {
    uint256 public value;
    mapping(address => uint256) public balances;

    function set(uint256 _value) public {
        value = _value;
    }

    function get() public view returns (uint256) {
        return value;
    }

    function deposit() public payable {
        uint256 sent = msg.value;
        require(sent != 0, "Zero Ether");
        unchecked {
            balances[msg.sender] += sent;
        }
    }

    function getBalance(address _addr) public view returns (uint256) {
        return balances[_addr];
    }

    receive() external payable {
        deposit();
    }
}
