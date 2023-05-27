// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import { UserOperationVariant } from "./UserOperationVariant.sol";

interface IEntryPoint {
    function handleOps(UserOperationVariant[] calldata ops) external;
}
