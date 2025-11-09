// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GetterSetter {
    string private value;
    address public owner;

    event ValueUpdated(address indexed updater, string oldValue, string newValue);

    constructor(string memory _initial) {
        value = _initial;
        owner = msg.sender;
    }

    // setter: anyone can set in this simple example (optional: add onlyOwner)
    function setValue(string calldata _newValue) external {
        string memory old = value;
        value = _newValue;
        emit ValueUpdated(msg.sender, old, _newValue);
    }

    // getter
    function getValue() external view returns (string memory) {
        return value;
    }

    // optional: owner-only setter example
    function setValueOwnerOnly(string calldata _newValue) external {
        require(msg.sender == owner, "Only owner");
        string memory old = value;
        value = _newValue;
        emit ValueUpdated(msg.sender, old, _newValue);
    }
}
