// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import { IAccountFactory } from "./interfaces/IAccountFactory.sol";
import { Account } from "./Account.sol";

contract AccountFactory is IAccountFactory {
    address public immutable wETH;

    constructor(address _wETH) {
        wETH = _wETH;
    }

    function createAccount(
        bytes calldata _commitment
    ) external returns (address account) {
        account = address(new Account(wETH, _commitment));
    }
}
