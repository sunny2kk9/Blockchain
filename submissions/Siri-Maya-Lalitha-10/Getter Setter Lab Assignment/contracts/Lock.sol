// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract GetterSetter {
    uint256 private storedValue; 
    event ValueUpdated(uint256 oldValue, uint256 newValue, address updatedBy);
    function setValue(uint256 _value) public {
        uint256 oldValue = storedValue;
        storedValue = _value;

        emit ValueUpdated(oldValue, _value, msg.sender);
    }
    function getValue() public view returns (uint256) {
        return storedValue;
    }
}
