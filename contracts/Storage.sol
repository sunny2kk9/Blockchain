// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Storage
 * @dev A simple smart contract with getter and setter functions
 */
contract Storage {
    // State variable to store a value
    uint256 private storedValue;
    
    // Event emitted when value is changed
    event ValueChanged(uint256 oldValue, uint256 newValue);
    
    /**
     * @dev Set a new value
     * @param _value The value to store
     */
    function setValue(uint256 _value) public {
        uint256 oldValue = storedValue;
        storedValue = _value;
        emit ValueChanged(oldValue, _value);
    }
    
    /**
     * @dev Get the stored value
     * @return The stored value
     */
    function getValue() public view returns (uint256) {
        return storedValue;
    }
    
    /**
     * @dev Get the stored value (alternative getter using public variable)
     * This is automatically generated for public state variables
     */
    // storedValue is private, so we use the explicit getter above
}



