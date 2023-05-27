// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import { Account } from "../Account.sol";
import { IAccountFactory } from "../interfaces/IAccountFactory.sol";

contract MockAccountFactory is IAccountFactory {
    address public immutable wETH;

    address public lastAccount;

    constructor(address _wETH) {
        wETH = _wETH;
    }

    function createAccount(
        bytes calldata _commitment
    ) external returns (address account) {
        account = address(new Account(wETH, _commitment));

        lastAccount = account;
    }

    function getLastAccount() external view returns (address) {
        return lastAccount;
    }
}
