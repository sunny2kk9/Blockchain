// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyTokenTransaction is ERC1155, Ownable {
    uint256 private _nextTokenId = 1;
    address contractOwner;
    address escrowAccount = 0x4c441E2C9cA861F337701777bEba2cDD356682f9;

    struct PropertyTransaction{
        address escrowAccount;
        address sellerAddress;
        address channlePartnerAddress;
        address buyerAddress;
        address paidAddress;
        uint256 tokenAmount;
        uint256 finalAmount;
        bool legalApproved;
        uint status;
    }

    mapping(address => uint256[]) private ownedTokens;
    mapping(uint256 => PropertyTransaction[]) private transactions;

    event GeneratedTokenEvent(uint256 tokenId, bytes data);
    event AddBalanceEvent(address _id, uint256 tokenId, uint256);
    event Transaction(address escrowAccount,address sellerAddress,address channlePartnerAddress,address buyerAddress,address paidAddress,uint256 tokenAmount,uint256 finalAmount);

    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {
        contractOwner = initialOwner;
    }

    function generatePropertyToken(address _owner, bytes memory propertyData) public{
        uint256 tokenId = _nextTokenId++;
        _mint(_owner, tokenId, 1, propertyData);
        ownedTokens[_owner].push(tokenId);
        emit GeneratedTokenEvent(tokenId, propertyData);
    }

    function ownerTokens(address _owner) public view returns (uint256[] memory){
        return ownedTokens[_owner];
    }

    function addBalance(address _id, uint256 balance) public{
        _mint(_id, 0, balance, '0x');
        emit AddBalanceEvent(_id,0,balance);
    }

    function getEscrowAccount() public view returns (address){
        return escrowAccount;
    }

    function checkBalance(address _account) public view returns(uint256){
        return balanceOf(_account, 0);
    }

    function payTokenAmount(
            address _channelPartnerAddress,
            address _buyerAddress,
            address _sellerAddress,
            uint256 _propertyTokenId,
            address _fromAddress,
            uint256 _amount,
            uint256 _finalAmount
        ) public {
            // Check the balance of the _fromAddress for propertyTokenId
            uint256 balance = balanceOf(_fromAddress, 0);

            // Ensure the balance is sufficient
            require(balance >= _amount, "Insufficient balance");

            // Check the balance of the _fromAddress for propertyTokenId
            uint256 propertyToken = balanceOf(_sellerAddress, _propertyTokenId);

            // Ensure the balance is sufficient
            require(propertyToken == 1, "You are not the Property Owner");

            _setApprovalForAll(_fromAddress,contractOwner, true);
            // Transfer tokens from _fromAddress to sellerAddress
            safeTransferFrom(_fromAddress, escrowAccount, 0, _amount, "");

            if (_channelPartnerAddress == address(0)) {
                _channelPartnerAddress = address(0);
            }

            transactions[_propertyTokenId].push(
                PropertyTransaction(
                    escrowAccount,
                    _sellerAddress,
                    _channelPartnerAddress,
                    _buyerAddress,
                    _fromAddress,
                    _amount,
                    _finalAmount,
                    false,
                    2
                )
            );

            emit Transaction(escrowAccount, _sellerAddress, _channelPartnerAddress, _buyerAddress, _fromAddress, _amount, _finalAmount);

    }

    function approveTokenAmount(
            address _channelPartnerAddress,
            address _buyerAddress,
            address _sellerAddress,
            uint256 _propertyTokenId,
            address _fromAddress,
            uint256 _amount,
            uint256 _finalAmount
        ) public {
            // Check the balance of the _fromAddress for propertyTokenId
            uint256 propertyToken = balanceOf(_sellerAddress, _propertyTokenId);

            // Ensure the balance is sufficient
            require(propertyToken == 1, "You are not the Property Owner");

            setApprovalForAll(address(this), true);
            // Transfer tokens from _fromAddress to sellerAddress
            _setApprovalForAll(_sellerAddress,contractOwner, true);
            safeTransferFrom(_sellerAddress, escrowAccount, _propertyTokenId, 1, "");

            if (_channelPartnerAddress == address(0)) {
                _channelPartnerAddress = address(0);
            }

            transactions[_propertyTokenId].push(
                PropertyTransaction(
                    escrowAccount,
                    _sellerAddress,
                    _channelPartnerAddress,
                    _buyerAddress,
                    _fromAddress,
                    _amount,
                    _finalAmount,
                    false,
                    3
                )
            );

            emit Transaction(escrowAccount, _sellerAddress, _channelPartnerAddress, _buyerAddress, _fromAddress, _amount, _finalAmount);

    }

    function legalApproved(
            address _channelPartnerAddress,
            address _buyerAddress,
            address _sellerAddress,
            uint256 _propertyTokenId,
            address _fromAddress,
            uint256 _amount,
            uint256 _finalAmount
        ) public {
            if (_channelPartnerAddress == address(0)) {
                _channelPartnerAddress = address(0);
            }

            transactions[_propertyTokenId].push(
                PropertyTransaction(
                    escrowAccount,
                    _sellerAddress,
                    _channelPartnerAddress,
                    _buyerAddress,
                    _fromAddress,
                    _amount,
                    _finalAmount,
                    true,
                    4
                )
            );

            emit Transaction(escrowAccount, _sellerAddress, _channelPartnerAddress, _buyerAddress, _fromAddress, _amount, _finalAmount);

    }

    function agreementAmount(
            address _channelPartnerAddress,
            address _buyerAddress,
            address _sellerAddress,
            uint256 _propertyTokenId,
            address _fromAddress,
            uint256 _amount,
            uint256 _finalAmount
        ) public {
            // Check the balance of the _fromAddress for propertyTokenId
            uint256 balance = balanceOf(_fromAddress, 0);

            // Ensure the balance is sufficient
            require(balance >= _amount, "Insufficient balance");

            // Check the balance of the _fromAddress for propertyTokenId
            uint256 propertyToken = balanceOf(escrowAccount, _propertyTokenId);

            // Ensure the balance is sufficient
            require(propertyToken == 1, "You are not the Property Owner");

            _setApprovalForAll(_fromAddress,contractOwner, true);
            // Transfer tokens from _fromAddress to sellerAddress
            safeTransferFrom(_fromAddress, escrowAccount, 0, _amount, "");

            if (_channelPartnerAddress == address(0)) {
                _channelPartnerAddress = address(0);
            }

            transactions[_propertyTokenId].push(
                PropertyTransaction(
                    escrowAccount,
                    _sellerAddress,
                    _channelPartnerAddress,
                    _buyerAddress,
                    _fromAddress,
                    _amount,
                    _finalAmount,
                    true,
                    6
                )
            );

            emit Transaction(escrowAccount, _sellerAddress, _channelPartnerAddress, _buyerAddress, _fromAddress, _amount, _finalAmount);

    }

    function completeTransaction(
            address _channelPartnerAddress,
            address _buyerAddress,
            address _sellerAddress,
            uint256 _propertyTokenId,
            address _fromAddress,
            uint256 _amount,
            uint256 _finalAmount
        ) public {
            // Check the balance of the _fromAddress for propertyTokenId
            uint256 balance = balanceOf(escrowAccount, 0);

            // Ensure the balance is sufficient
            require(balance >= _amount, "Insufficient balance");

            // Check the balance of the _sellerAddress for propertyTokenId
            uint256 propertyToken = balanceOf(escrowAccount, _propertyTokenId);

            // Ensure the balance is sufficient
            require(propertyToken == 1, "You are not the Property Owner");

            // Transfer tokens from _fromAddress to sellerAddress
            _setApprovalForAll(escrowAccount,contractOwner, true);
            safeTransferFrom(escrowAccount, _sellerAddress, 0, _amount, "");

            safeTransferFrom(escrowAccount, _buyerAddress, _propertyTokenId, 1, "");

            if (_channelPartnerAddress == address(0)) {
                _channelPartnerAddress = address(0);
            }

            transactions[_propertyTokenId].push(
                PropertyTransaction(
                    escrowAccount,
                    _sellerAddress,
                    _channelPartnerAddress,
                    _buyerAddress,
                    _fromAddress,
                    _amount,
                    _finalAmount,
                    true,
                    7
                )
            );

            emit Transaction(escrowAccount, _sellerAddress, _channelPartnerAddress, _buyerAddress, _fromAddress, _amount, _finalAmount);
    }

    function legalDisApproved(
            address _channelPartnerAddress,
            address _buyerAddress,
            address _sellerAddress,
            uint256 _propertyTokenId,
            address _fromAddress,
            uint256 _amount,
            uint256 _finalAmount
        ) public {
            // Check the balance of the _fromAddress for propertyTokenId
            uint256 balance = balanceOf(escrowAccount, 0);

            // Ensure the balance is sufficient
            require(balance >= _amount, "Insufficient balance");

            // Check the balance of the _sellerAddress for propertyTokenId
            uint256 propertyToken = balanceOf(escrowAccount, _propertyTokenId);

            // Ensure the balance is sufficient
            require(propertyToken == 1, "You are not the Property Owner");

            // Transfer tokens from _fromAddress to sellerAddress
            _setApprovalForAll(escrowAccount,contractOwner, true);
            safeTransferFrom(escrowAccount, _buyerAddress, 0, _amount, "");

            safeTransferFrom(escrowAccount, _sellerAddress, _propertyTokenId, 1, "");

            if (_channelPartnerAddress == address(0)) {
                _channelPartnerAddress = address(0);
            }

            transactions[_propertyTokenId].push(
                PropertyTransaction(
                    escrowAccount,
                    _sellerAddress,
                    _channelPartnerAddress,
                    _buyerAddress,
                    _fromAddress,
                    _amount,
                    _finalAmount,
                    false,
                    5
                )
            );

            emit Transaction(escrowAccount, _sellerAddress, _channelPartnerAddress, _buyerAddress, _fromAddress, _amount, _finalAmount);
    }

    //Function to retrive all transactions of the property
    function getAllPropertyTransactions(uint256 _tokenId) external view returns (PropertyTransaction[] memory) {
        return transactions[_tokenId];
    }
}
