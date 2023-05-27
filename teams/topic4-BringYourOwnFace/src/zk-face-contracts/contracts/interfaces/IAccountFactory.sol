// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

interface IAccountFactory {
    function createAccount(
        bytes calldata _commitment
    ) external returns (address);
}
