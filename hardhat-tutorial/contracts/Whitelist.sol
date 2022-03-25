// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Whitelist {
    //Max no of address which can be whitelisted
    uint8 public maxWhitelistAddress;

    //Keep track of no of address whitelisted till now
    uint8 public numAddressWhitelisted = 0;

    mapping(address => bool) public whitelistedAddresses;

    constructor(uint8 _maxWhitelistAddress) {
        maxWhitelistAddress = _maxWhitelistAddress;
    }

    function addAddressToWhitelist() public {
        require(
            !whitelistedAddresses[msg.sender],
            "Sender is already in the whitelist"
        );

        require(
            numAddressWhitelisted < maxWhitelistAddress,
            "Max limit reached"
        );

        whitelistedAddresses[msg.sender] = true;
        numAddressWhitelisted += 1;
    }
}
