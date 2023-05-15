// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/Context.sol";

error NotPlatform();

contract PlatformGated is Context {
    address private _platform;

    modifier onlyPlatform() {
        _checkPlatform();
        _;
    }

    constructor(address platform) {
        _platform = platform;
    }

    function getPlatform() public view returns (address) {
        return _platform;
    }

    // Force subclasses to implement this function
    function setPlatform(address platform) external virtual {}

    function _setPlatform(address platform) internal {
        _platform = platform;
    }

    function _checkPlatform() private view {
        if (_msgSender() != _platform) revert NotPlatform();
    }
}
