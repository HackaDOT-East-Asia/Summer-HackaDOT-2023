// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

struct UserOperationVariant {
    address sender;
    bytes callData;
    bytes commitment;
    bytes proof;
    uint256 callGasLimit;
}
