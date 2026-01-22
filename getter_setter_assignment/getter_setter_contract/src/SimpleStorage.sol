// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 private storedValue;

    event ValueChanged(address indexed user, uint256 indexed newValue);

    function setValue(uint256 _value) external {
        storedValue = _value;
        emit ValueChanged(msg.sender, _value);
    }

    function getValue() external view returns (uint256) {
        return storedValue;
    }
}
