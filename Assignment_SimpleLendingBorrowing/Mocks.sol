// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// 1. A mock ERC20 token we can use for DAI and WETH
// 1. A mock ERC20 token we can use for DAI and WETH
contract MockERC20 is ERC20, Ownable {
    uint8 private _customDecimals;

    constructor(string memory name, string memory symbol, uint8 decimals_) 
        ERC20(name, symbol) 
        Ownable(msg.sender) 
    {
        _customDecimals = decimals_;
    }

    // We override the decimals function to return our custom value
    function decimals() public view virtual override returns (uint8) {
        return _customDecimals;
    }

    // Helper function to give yourself tokens
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

// 2. A mock Chainlink price feed
contract MockPriceFeed is AggregatorV3Interface {
    // We will hardcode the price to $2,000
    // Chainlink price feeds have 8 decimals, so 2000 * 10**8
    int256 public constant MOCK_PRICE = 200000000000; 

    function decimals() external pure returns (uint8) {
        return 8; // Standard for USD price feeds
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            1,                // roundId
            MOCK_PRICE,       // answer
            block.timestamp,  // startedAt
            block.timestamp,  // updatedAt
            1                 // answeredInRound
        );
    }
    
    // --- Unused functions we just need to include ---
    function description() external pure returns (string memory) { return "Mock"; }
    function version() external pure returns (uint256) { return 1; }
    function getRoundData(uint80) external view returns (uint80, int256, uint256, uint256, uint80) {
        return (1, MOCK_PRICE, block.timestamp, block.timestamp, 1);
    }
}