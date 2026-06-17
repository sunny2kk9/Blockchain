// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GetterSetter {
    uint256 private storedData;

    // Setter function
    function set(uint256 _value) public {
        storedData = _value;
    }

    // Getter function
    function get() public view returns (uint256) {
        return storedData;
    }
}
