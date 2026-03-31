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
     * @dev Constructor to initialize the stored value
     * @param initialValue The initial value to store
     */
    constructor(uint256 initialValue) {
        storedValue = initialValue;
        emit ValueChanged(0, initialValue);
    }
    
    /**
     * @dev Setter function to update the stored value
     * @param newValue The new value to store
     */
    function setValue(uint256 newValue) public {
        uint256 oldValue = storedValue;
        storedValue = newValue;
        emit ValueChanged(oldValue, newValue);
    }
    
    /**
     * @dev Getter function to retrieve the stored value
     * @return The current stored value
     */
    function getValue() public view returns (uint256) {
        return storedValue;
    }
}

