// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AdminAccess {
    address public owner;
    mapping(address => bool) public admins;

    constructor() {
        owner = msg.sender;
        admins[owner] = true; // Deployer is an admin
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    function addAdmin(address _admin) public onlyOwner {
        admins[_admin] = true;
    }

    function removeAdmin(address _admin) public onlyOwner {
        admins[_admin] = false;
    }

    function isAdmin(address _user) public view returns (bool) {
        return admins[_user];
    }
}
