// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SimpleVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;
    uint256 public constant DEFAULT_APR = 10;

    struct Position {
        address borrower;
        uint256 principal;
        uint256 collateralWei;
        uint256 apr;
        bool closed;
    }

    mapping(address => uint256) public supplyBalance;
    mapping(address => Position) public positionOf;

    event Supplied(address indexed provider, uint256 amount);
    event LoanOpened(address indexed borrower, uint256 principal, uint256 collateralWei);
    event LoanClosed(address indexed borrower, uint256 totalRepaid);
    event OwnerWithdrawn(address indexed to, uint256 amount);

    constructor(address _token) {
        require(_token != address(0), "zero token");
        asset = IERC20(_token);
    }

    function supply(uint256 amount) external nonReentrant {
        require(amount > 0, "supply>0");
        asset.safeTransferFrom(msg.sender, address(this), amount);
        supplyBalance[msg.sender] += amount;
        emit Supplied(msg.sender, amount);
    }

    function takeLoan(uint256 tokenAmount) external payable nonReentrant {
        require(tokenAmount > 0, "tokenAmount>0");
        require(positionOf[msg.sender].principal == 0 || positionOf[msg.sender].closed, "existing loan active");
        require(msg.value > 0, "provide ETH collateral");
        uint256 vaultTokenBalance = asset.balanceOf(address(this));
        require(vaultTokenBalance >= tokenAmount, "vault: insufficient liquidity");

        positionOf[msg.sender] = Position({
            borrower: msg.sender,
            principal: tokenAmount,
            collateralWei: msg.value,
            apr: DEFAULT_APR,
            closed: false
        });

        asset.safeTransfer(msg.sender, tokenAmount);
        emit LoanOpened(msg.sender, tokenAmount, msg.value);
    }

    function settleLoan() external nonReentrant {
        Position storage pos = positionOf[msg.sender];
        require(pos.principal > 0, "no active loan");
        require(!pos.closed, "already settled");

        uint256 interest = (pos.principal * pos.apr) / 100;
        uint256 totalRepay = pos.principal + interest;

        asset.safeTransferFrom(msg.sender, address(this), totalRepay);
        pos.closed = true;

        uint256 collateral = pos.collateralWei;
        pos.collateralWei = 0;
        (bool sent, ) = payable(msg.sender).call{value: collateral}("");
        require(sent, "ETH return failed");

        emit LoanClosed(msg.sender, totalRepay);
    }

    function withdrawTokens(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "zero recipient");
        require(amount > 0, "amount>0");
        asset.safeTransfer(to, amount);
        emit OwnerWithdrawn(to, amount);
    }

    receive() external payable {}
}
