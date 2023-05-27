// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import { UserOperationVariant } from "./UserOperationVariant.sol";

interface IAccount {
    struct CommitmentProof {
        bytes commitment;
        bytes proof;
    }

    function validateUserOp(
        UserOperationVariant calldata userOp
    ) external returns (uint256 validationData);

    function verify(
        bytes calldata commitment,
        bytes calldata proof
    ) external returns (bool);
}
