// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract User {
    struct UserDetails {
        address id;
        string name;
        string email;
        string governementId;
        string phone;
        string userAddress;
    }

    mapping(address => UserDetails) public users;
    address[] public userAddresses;
    uint256 public userCount;

    event UserAdded(address id, string name);

    function addUser(address _id, string memory _name, string memory _email, string memory _govtId, string memory _phone, string memory _userAddress) external {
        if (users[_id].id != address(0)) {
            // User already exists, update details
            users[_id].name = _name;
            users[_id].email = _email;
            users[_id].governementId = _govtId;
            users[_id].phone = _phone;
            users[_id].userAddress = _userAddress;
        } else {
            // User does not exist, add as a new record
            userCount++;
            users[_id] = UserDetails(_id, _email,_name, _govtId, _phone, _userAddress);
            userAddresses.push(_id);
        }
        emit UserAdded(_id, _name);
    }

    function getUser(address _id) external view returns (UserDetails memory) {
        require(users[_id].id != address(0), "User does not exist");
        return users[_id];
    }

    function getAllUsers() external view returns (UserDetails[] memory) {
        UserDetails[] memory allUsers = new UserDetails[](userCount);

        for (uint256 i = 0; i < userCount; i++) {
            address userId = userAddresses[i];
            allUsers[i] = users[userId];
        }

        return allUsers;
    }
}