
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SimpleLendingPool is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable collateralToken;
    IERC20 public immutable borrowToken;

    mapping(address => uint256) public collateralDeposits;
    mapping(address => uint256) public borrowBalances;

    uint256 public constant COLLATERAL_FACTOR = 75; // 75%

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);

    constructor(address _collateralToken, address _borrowToken) {
        collateralToken = IERC20(_collateralToken);
        borrowToken = IERC20(_borrowToken);
    }

    function depositCollateral(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        collateralToken.safeTransferFrom(msg.sender, address(this), _amount);
        collateralDeposits[msg.sender] += _amount;
        emit Deposited(msg.sender, _amount);
    }

    function borrow(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        uint256 borrowLimit = _calculateBorrowLimit(msg.sender);
        uint256 newTotalBorrowed = borrowBalances[msg.sender] + _amount;

        require(newTotalBorrowed <= borrowLimit, "Borrow amount exceeds collateral limit");
        require(borrowToken.balanceOf(address(this)) >= _amount, "Pool has insufficient liquidity");

        borrowBalances[msg.sender] = newTotalBorrowed;
        borrowToken.safeTransfer(msg.sender, _amount);
        emit Borrowed(msg.sender, _amount);
    }

    function repay(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        uint256 debt = borrowBalances[msg.sender];
        uint256 actualRepayment = _amount > debt ? debt : _amount;

        borrowToken.safeTransferFrom(msg.sender, address(this), actualRepayment);
        borrowBalances[msg.sender] -= actualRepayment;
        emit Repaid(msg.sender, actualRepayment);
    }

    function withdrawCollateral(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        uint256 userCollateral = collateralDeposits[msg.sender];
        require(_amount <= userCollateral, "Insufficient collateral deposited");

        uint256 remainingCollateral = userCollateral - _amount;
        uint256 newBorrowLimit = (remainingCollateral * COLLATERAL_FACTOR) / 100;

        require(borrowBalances[msg.sender] <= newBorrowLimit, "Withdrawal would cause under-collateralization");

        collateralDeposits[msg.sender] = remainingCollateral;
        collateralToken.safeTransfer(msg.sender, _amount);
        emit Withdrawn(msg.sender, _amount);
    }

    function _calculateBorrowLimit(address _user) internal view returns (uint256) {
        uint256 collateralValue = collateralDeposits[_user];
        return (collateralValue * COLLATERAL_FACTOR) / 100;
    }
}