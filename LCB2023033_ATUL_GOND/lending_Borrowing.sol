pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EtherBackedLender is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable assetToken;
    uint256 public loanToValue;

    mapping(address => uint256) public ethCollateral;
    mapping(address => uint256) public borrowBalance;

    event CollateralDeposited(address indexed who, uint256 amount);
    event CollateralAdded(address indexed who, uint256 amount);
    event LoanDrawn(address indexed who, uint256 amount);
    event LoanRepaid(address indexed who, uint256 amount);
    event CollateralRedeemed(address indexed who, uint256 amount);
    event LoanToValueUpdated(uint256 oldLTV, uint256 newLTV);
    event TokensRescued(address indexed to, uint256 amount);
    event ETHRescued(address indexed to, uint256 amount);

    constructor(IERC20 _assetToken, uint256 _initialLTV) {
        require(address(_assetToken) != address(0), "asset token zero addr");
        assetToken = _assetToken;
        loanToValue = _initialLTV;
    }

    receive() external payable {
        require(msg.value > 0, "no ETH sent");
        ethCollateral[msg.sender] += msg.value;
        emit CollateralDeposited(msg.sender, msg.value);
    }

    function addCollateral() external payable {
        require(msg.value > 0, "deposit > 0");
        ethCollateral[msg.sender] += msg.value;
        emit CollateralAdded(msg.sender, msg.value);
    }

    function drawLoan(uint256 amount) external nonReentrant {
        require(amount > 0, "borrow > 0");
        uint256 collateral = ethCollateral[msg.sender];
        uint256 maxAllowed = (collateral * loanToValue) / 100;
        require(borrowBalance[msg.sender] + amount <= maxAllowed, "exceeds allowed LTV");
        require(assetToken.balanceOf(address(this)) >= amount, "insufficient liquidity");
        borrowBalance[msg.sender] += amount;
        assetToken.safeTransfer(msg.sender, amount);
        emit LoanDrawn(msg.sender, amount);
    }

    function settle(uint256 amount) external nonReentrant {
        require(amount > 0, "repay > 0");
        uint256 outstanding = borrowBalance[msg.sender];
        require(outstanding > 0, "no debt");
        uint256 toPay = amount > outstanding ? outstanding : amount;
        assetToken.safeTransferFrom(msg.sender, address(this), toPay);
        borrowBalance[msg.sender] = outstanding - toPay;
        emit LoanRepaid(msg.sender, toPay);
    }

    function redeemCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "withdraw > 0");
        require(ethCollateral[msg.sender] >= amount, "not enough collateral");
        require(borrowBalance[msg.sender] == 0, "outstanding borrow exists");
        ethCollateral[msg.sender] -= amount;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "ETH transfer failed");
        emit CollateralRedeemed(msg.sender, amount);
    }

    function updateLTV(uint256 _newLTV) external onlyOwner {
        uint256 old = loanToValue;
        loanToValue = _newLTV;
        emit LoanToValueUpdated(old, _newLTV);
    }

    function tokenHoldings() external view returns (uint256) {
        return assetToken.balanceOf(address(this));
    }

    function borrowableAmount(address user) external view returns (uint256) {
        uint256 maxAllowed = (ethCollateral[user] * loanToValue) / 100;
        if (maxAllowed <= borrowBalance[user]) return 0;
        return maxAllowed - borrowBalance[user];
    }

    function rescueTokens(uint256 amount, address to) external onlyOwner {
        require(to != address(0), "invalid to");
        assetToken.safeTransfer(to, amount);
        emit TokensRescued(to, amount);
    }

    function rescueETH(uint256 amount, address payable to) external onlyOwner {
        require(to != address(0), "invalid to");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "ETH rescue failed");
        emit ETHRescued(to, amount);
    }
}
