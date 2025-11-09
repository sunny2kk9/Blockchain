
pragma solidity ^0.8.20;


contract SimpleStorage {
uint256 private value;
event ValueChanged(uint256 indexed newValue, address indexed changedBy);


function setValue(uint256 _value) external {
value = _value;
emit ValueChanged(_value, msg.sender);
}


function getValue() external view returns (uint256) {
return value;
}
}